import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(RolesGuard)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  @Roles('owner', 'manager')
  getStaff(@CurrentTenant() tenant: { locationId: string }) {
    return this.staffService.getStaff(tenant.locationId);
  }
}
