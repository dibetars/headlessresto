import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { BookkeepingService } from './bookkeeping.service';

@Controller('finances/bookkeeping')
@UseGuards(RolesGuard)
export class BookkeepingController {
  constructor(private bookkeepingService: BookkeepingService) {}

  @Get()
  @Roles('owner', 'manager')
  getSummary(
    @CurrentTenant() tenant: { locationId: string },
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.bookkeepingService.getSummary(tenant.locationId, start, end);
  }

  @Get('daily')
  @Roles('owner', 'manager')
  getDaily(
    @CurrentTenant() tenant: { locationId: string },
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.bookkeepingService.getDailyBreakdown(tenant.locationId, start, end);
  }
}
