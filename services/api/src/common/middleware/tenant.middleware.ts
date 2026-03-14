import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * TenantMiddleware — the most important piece of the auth pipeline.
 *
 * For every authenticated request, it:
 * 1. Validates the JWT from the Authorization header
 * 2. Extracts the user and resolves their active tenant context
 * 3. Sets PostgreSQL session variables for RLS enforcement
 *
 * After this runs, every Supabase query automatically filters
 * by the user's org and location — application code never needs
 * to add WHERE tenant_id = ? manually.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    // Skip auth for public routes (QR menu, health checks)
    if (this.isPublicRoute(req.path)) {
      return next();
    }

    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException("Missing authorization token");
    }

    try {
      // Validate JWT and get user
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException("Invalid token");
      }

      // Resolve tenant context from the request
      // The active org/location comes from either:
      // - X-Organization-Id + X-Location-Id headers (web/mobile apps)
      // - The location slug in the URL (station views)
      const orgId = req.headers["x-organization-id"] as string;
      const locationId = req.headers["x-location-id"] as string;

      if (!orgId) {
        throw new UnauthorizedException("Missing organization context");
      }

      // Verify user has access to this org
      const { data: membership } = await this.supabase
        .from("org_memberships")
        .select("role, location_id")
        .eq("user_id", user.id)
        .eq("org_id", orgId)
        .eq("is_active", true)
        .maybeSingle();

      if (!membership) {
        throw new UnauthorizedException("No access to this organization");
      }

      // If user is scoped to a specific location, verify they're accessing it
      if (
        membership.location_id &&
        locationId &&
        membership.location_id !== locationId
      ) {
        throw new UnauthorizedException("No access to this location");
      }

      // Attach resolved context to the request
      (req as any).user = {
        id: user.id,
        email: user.email,
        orgId,
        locationId: locationId || membership.location_id,
        role: membership.role,
      };

      // Set PostgreSQL session variables for RLS
      // This is what makes row-level security work — every subsequent
      // query in this request will be filtered by these values
      await this.supabase.rpc("set_request_context", {
        p_user_id: user.id,
        p_org_id: orgId,
        p_location_id: locationId || membership.location_id || null,
      });

      next();
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException("Authentication failed");
    }
  }

  private extractToken(req: Request): string | null {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      return auth.slice(7);
    }
    return null;
  }

  private isPublicRoute(path: string): boolean {
    const publicPaths = [
      "/health",
      "/api/menu/",       // Public QR menu endpoints
      "/api/webhooks/",   // Stripe/Uber webhooks (verified separately)
    ];
    return publicPaths.some((p) => path.startsWith(p));
  }
}
