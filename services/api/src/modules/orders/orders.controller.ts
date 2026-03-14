import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { OrdersService } from './orders.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createOrderSchema } from '@restaurantos/shared';

@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Public: QR menu order creation (no auth required, but locationId from URL)
  @Post('public/:locationId')
  createPublic(
    @Param('locationId') locationId: string,
    @Body(new ZodValidationPipe(createOrderSchema)) body: any,
  ) {
    return this.ordersService.create(locationId, { ...body, source: 'qr_menu' });
  }

  @Post()
  @Roles('owner', 'manager', 'wait_staff', 'kitchen_staff')
  create(
    @CurrentTenant() tenant: { locationId: string },
    @Body(new ZodValidationPipe(createOrderSchema)) body: any,
  ) {
    return this.ordersService.create(tenant.locationId, body);
  }

  @Get()
  @Roles('owner', 'manager', 'kitchen_staff', 'wait_staff')
  findAll(
    @CurrentTenant() tenant: { locationId: string },
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findByLocation(tenant.locationId, {
      status: status as any,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  @Roles('owner', 'manager', 'kitchen_staff', 'wait_staff')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.ordersService.updateStatus(id, status);
  }
}
