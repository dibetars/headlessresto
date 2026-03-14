import { Module } from '@nestjs/common';
import { KitchenController } from './kitchen.controller';
import { MenuService } from './menu.service';
import { StockService } from './stock.service';

@Module({
  controllers: [KitchenController],
  providers: [MenuService, StockService],
  exports: [MenuService, StockService],
})
export class KitchenModule {}
