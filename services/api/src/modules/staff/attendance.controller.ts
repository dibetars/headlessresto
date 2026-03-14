import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentUser, CurrentTenant, Roles, type RequestUser } from '../../common/guards/roles.guard';
import { AttendanceService } from './attendance.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { logAttendanceSchema } from '@restaurantos/shared';

@Controller('staff/attendance')
@UseGuards(RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  log(
    @CurrentUser() user: RequestUser,
    @CurrentTenant() tenant: { locationId: string },
    @Body(new ZodValidationPipe(logAttendanceSchema)) body: any,
  ) {
    return this.attendanceService.logAttendance(user.id, tenant.locationId, body);
  }

  @Get()
  @Roles('owner', 'manager')
  getLogs(
    @CurrentTenant() tenant: { locationId: string },
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceService.getLogs(tenant.locationId, start || today, end || today);
  }

  @Get('payroll-summary')
  @Roles('owner', 'manager')
  getPayrollSummary(
    @CurrentTenant() tenant: { locationId: string },
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.attendanceService.getPayrollSummary(tenant.locationId, start, end);
  }
}
