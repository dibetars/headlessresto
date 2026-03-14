import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { createMenuItemSchema, type MenuItem } from "@restaurantos/shared";
import {
  Roles,
  CurrentUser,
  CurrentTenant,
  RolesGuard,
  type RequestUser,
} from "../../common/guards/roles.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { MenuService } from "./menu.service";
import { StockService } from "./stock.service";

/**
 * Kitchen module controller.
 *
 * Notice what's NOT here:
 * - No tenant_id filtering — RLS handles it at the database level
 * - No auth token parsing — TenantMiddleware handles it
 * - No permission checks inline — @Roles() decorator handles it
 *
 * This is the benefit of the middleware + RLS architecture:
 * controllers stay focused on business logic.
 */
@Controller("kitchen")
@UseGuards(RolesGuard)
export class KitchenController {
  constructor(
    private menuService: MenuService,
    private stockService: StockService
  ) {}

  // ----- Menu Items -----

  @Get("menu-items")
  @Roles("owner", "manager", "kitchen_staff")
  async getMenuItems(
    @CurrentTenant() tenant: { orgId: string; locationId: string },
    @Query("category") category?: string
  ) {
    return this.menuService.getItems(tenant.locationId, category);
  }

  @Post("menu-items")
  @Roles("owner", "manager")
  async createMenuItem(
    @CurrentTenant() tenant: { orgId: string; locationId: string },
    @Body(new ZodValidationPipe(createMenuItemSchema)) body: any
  ) {
    return this.menuService.createItem(tenant.locationId, body);
  }

  @Put("menu-items/:id")
  @Roles("owner", "manager")
  async updateMenuItem(
    @Param("id") id: string,
    @Body() body: Partial<MenuItem>
  ) {
    return this.menuService.updateItem(id, body);
  }

  @Put("menu-items/:id/toggle")
  @Roles("owner", "manager", "kitchen_staff")
  async toggleAvailability(@Param("id") id: string) {
    // Kitchen staff can mark items as 86'd (unavailable)
    return this.menuService.toggleAvailability(id);
  }

  @Delete("menu-items/:id")
  @Roles("owner")
  async deleteMenuItem(@Param("id") id: string) {
    return this.menuService.deleteItem(id);
  }

  // ----- Daily Menu -----

  @Get("daily-menu")
  @Roles("owner", "manager", "kitchen_staff")
  async getDailyMenu(
    @CurrentTenant() tenant: { orgId: string; locationId: string },
    @Query("date") date?: string
  ) {
    const menuDate = date || new Date().toISOString().split("T")[0];
    return this.menuService.getDailyMenu(tenant.locationId, menuDate);
  }

  @Post("daily-menu")
  @Roles("owner", "manager")
  async createDailyMenu(
    @CurrentTenant() tenant: { orgId: string; locationId: string },
    @Body() body: { date: string; item_ids: string[]; specials?: any[] }
  ) {
    return this.menuService.createDailyMenu(tenant.locationId, body);
  }

  @Put("daily-menu/:id/publish")
  @Roles("owner", "manager")
  async publishDailyMenu(@Param("id") id: string) {
    return this.menuService.publishDailyMenu(id);
  }

  // ----- Stock -----

  @Get("stock")
  @Roles("owner", "manager", "kitchen_staff")
  async getStock(
    @CurrentTenant() tenant: { orgId: string; locationId: string }
  ) {
    return this.stockService.getItems(tenant.locationId);
  }

  @Get("stock/low")
  @Roles("owner", "manager")
  async getLowStockAlerts(
    @CurrentTenant() tenant: { orgId: string; locationId: string }
  ) {
    return this.stockService.getLowStockItems(tenant.locationId);
  }

  @Post("stock/:id/movement")
  @Roles("owner", "manager", "kitchen_staff")
  async recordStockMovement(
    @Param("id") stockItemId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { quantity_change: number; reason: string }
  ) {
    // This is the append-only ledger approach for offline sync.
    // Instead of updating stock_items.quantity directly,
    // we insert a movement record. A database trigger
    // or scheduled job recalculates the current quantity.
    return this.stockService.recordMovement(stockItemId, {
      ...body,
      recorded_by: user.id,
    });
  }
}
