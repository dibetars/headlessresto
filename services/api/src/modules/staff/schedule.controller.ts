import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { ScheduleService } from './schedule.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createStaffScheduleSchema } from '@restaurantos/shared';

@Controller('staff/schedules')
@UseGuards(RolesGuard)
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get()
  @Roles('owner', 'manager')
  getSchedule(
    @CurrentTenant() tenant: { locationId: string },
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const today = new Date().toISOString().split('T')[0];
    const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    return this.scheduleService.getSchedule(
      tenant.locationId,
      start || today,
      end || weekOut,
    );
  }

  @Post()
  @Roles('owner', 'manager')
  createShift(
    @CurrentTenant() tenant: { locationId: string },
    @Body(new ZodValidationPipe(createStaffScheduleSchema)) body: any,
  ) {
    return this.scheduleService.createShift(tenant.locationId, body);
  }

  @Delete(':id')
  @Roles('owner', 'manager')
  deleteShift(@Param('id') id: string) {
    return this.scheduleService.deleteShift(id);
  }
}
