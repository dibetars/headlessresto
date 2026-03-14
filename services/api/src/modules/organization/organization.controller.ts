import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { createOrgSchema } from './dto/create-org.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RolesGuard, CurrentUser, Roles, type RequestUser } from '../../common/guards/roles.guard';
import { OrganizationService } from './organization.service';

@Controller('organizations')
@UseGuards(RolesGuard)
export class OrganizationController {
  constructor(private orgService: OrganizationService) {}

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(createOrgSchema)) body: any,
  ) {
    return this.orgService.create(user.id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgService.findById(id);
  }

  @Patch(':id')
  @Roles('owner')
  update(@Param('id') id: string, @Body() body: any) {
    return this.orgService.update(id, body);
  }

  @Get(':id/members')
  @Roles('owner', 'manager')
  getMembers(@Param('id') id: string) {
    return this.orgService.getMembers(id);
  }

  @Post(':id/members')
  @Roles('owner')
  inviteMember(@Param('id') id: string, @Body() body: any) {
    return this.orgService.inviteMember(id, body);
  }

  @Delete(':id/members/:membershipId')
  @Roles('owner')
  removeMember(@Param('membershipId') membershipId: string) {
    return this.orgService.removeMember(membershipId);
  }
}
