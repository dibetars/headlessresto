import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  controllers: [StaffController, ScheduleController, AttendanceController],
  providers: [StaffService, ScheduleService, AttendanceService],
  exports: [StaffService, AttendanceService],
})
export class StaffModule {}
