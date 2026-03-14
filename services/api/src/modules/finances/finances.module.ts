import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { BookkeepingController } from './bookkeeping.controller';
import { BookkeepingService } from './bookkeeping.service';

@Module({
  controllers: [PayrollController, BookkeepingController],
  providers: [PayrollService, BookkeepingService],
})
export class FinancesModule {}
