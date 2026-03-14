import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  createParamDecorator,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type UserRole, hasMinRole } from "@restaurantos/shared";

// ----- Decorators -----

/**
 * @Roles('owner', 'manager') — restrict endpoint to specific roles
 */
export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * @CurrentUser() — inject the authenticated user context into a handler
 *
 * Usage:
 *   @Get('dashboard')
 *   getDashboard(@CurrentUser() user: RequestUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

/**
 * @CurrentTenant() — shorthand to get just the org + location IDs
 *
 * Usage:
 *   @Get('stock')
 *   getStock(@CurrentTenant() tenant: { orgId: string; locationId: string }) { ... }
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      orgId: request.user.orgId,
      locationId: request.user.locationId,
    };
  }
);

// ----- Types -----

export interface RequestUser {
  id: string;
  email: string;
  orgId: string;
  locationId: string | null;
  role: UserRole;
}

// ----- Guard -----

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // No @Roles() decorator = endpoint is open to all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) {
      throw new ForbiddenException("Not authenticated");
    }

    // Check if user's role matches any of the required roles
    const hasRole = requiredRoles.some(
      (required) =>
        user.role === required || hasMinRole(user.role, required)
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Role '${user.role}' does not have access to this resource`
      );
    }

    return true;
  }
}
