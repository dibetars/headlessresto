import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentUser, type RequestUser } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('organizations')
  listOrgs(
    @CurrentUser() user: RequestUser,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.adminService.listOrganizations(user.email, parseInt(page) || 1, parseInt(limit) || 50);
  }

  @Get('organizations/:id')
  getOrg(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.adminService.getOrgDetails(user.email, id);
  }

  @Patch('organizations/:id/license')
  updateLicense(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateLicense(user.email, id, body);
  }

  @Get('health')
  getHealth(@CurrentUser() user: RequestUser) {
    return this.adminService.getSystemHealth(user.email);
  }
}
