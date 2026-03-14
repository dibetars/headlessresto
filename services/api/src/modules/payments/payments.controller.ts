import { Body, Controller, Headers, Param, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('orders/:orderId/intent')
  createPaymentIntent(@Param('orderId') orderId: string) {
    return this.paymentsService.createPaymentIntent(orderId);
  }

  @Post('stripe-connect/onboard')
  @UseGuards(RolesGuard)
  @Roles('owner')
  startOnboarding(
    @CurrentTenant() tenant: { locationId: string },
    @Body('return_url') returnUrl: string,
  ) {
    return this.paymentsService.startConnectOnboarding(tenant.locationId, returnUrl);
  }
}
