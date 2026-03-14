import { Module } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { UberDirectService } from './uber-direct.service';

@Module({
  controllers: [DeliveriesController],
  providers: [DeliveriesService, UberDirectService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
