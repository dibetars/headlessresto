import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { createLocationSchema } from './dto/create-location.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { LocationService } from './location.service';

@Controller('locations')
@UseGuards(RolesGuard)
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Post()
  @Roles('owner')
  create(
    @CurrentTenant() tenant: { orgId: string },
    @Body(new ZodValidationPipe(createLocationSchema)) body: any,
  ) {
    return this.locationService.create(tenant.orgId, body);
  }

  @Get()
  findAll(@CurrentTenant() tenant: { orgId: string }) {
    return this.locationService.findByOrg(tenant.orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findById(id);
  }

  @Patch(':id')
  @Roles('owner', 'manager')
  update(@Param('id') id: string, @Body() body: any) {
    return this.locationService.update(id, body);
  }
}
