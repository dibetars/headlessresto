import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { PayrollService } from './payroll.service';

@Controller('finances/payroll')
@UseGuards(RolesGuard)
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get()
  @Roles('owner', 'manager')
  getSummary(
    @CurrentTenant() tenant: { locationId: string },
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.payrollService.getSummary(tenant.locationId, start, end);
  }
}
