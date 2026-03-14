import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { DeliveriesService } from './deliveries.service';

@Controller('deliveries')
@UseGuards(RolesGuard)
export class DeliveriesController {
  constructor(private deliveriesService: DeliveriesService) {}

  @Get()
  @Roles('owner', 'manager', 'delivery_driver')
  getActive(@CurrentTenant() tenant: { locationId: string }) {
    return this.deliveriesService.getActiveDeliveries(tenant.locationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveriesService.getDelivery(id);
  }

  @Post('orders/:orderId/dispatch')
  @Roles('owner', 'manager', 'kitchen_staff')
  dispatch(
    @Param('orderId') orderId: string,
    @Body('dropoff_address') dropoffAddress: string,
  ) {
    return this.deliveriesService.dispatch(orderId, dropoffAddress);
  }

  @Post(':id/sync')
  syncStatus(@Param('id') id: string) {
    return this.deliveriesService.syncStatus(id);
  }
}
