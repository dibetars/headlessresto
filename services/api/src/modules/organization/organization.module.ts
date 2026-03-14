import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  controllers: [OrganizationController, LocationController],
  providers: [OrganizationService, LocationService],
  exports: [OrganizationService, LocationService],
})
export class OrganizationModule {}
