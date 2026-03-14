import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { StaffModule } from './modules/staff/staff.module';
import { OrdersModule } from './modules/orders/orders.module';
import { FinancesModule } from './modules/finances/finances.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { ActivationsModule } from './modules/activations/activations.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    OrganizationModule,
    KitchenModule,
    StaffModule,
    OrdersModule,
    FinancesModule,
    PaymentsModule,
    DeliveriesModule,
    ActivationsModule,
    AdminModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'api/health', method: RequestMethod.GET },
        { path: 'api/menu/(.*)', method: RequestMethod.ALL },
        { path: 'api/webhooks/(.*)', method: RequestMethod.ALL },
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/register', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
