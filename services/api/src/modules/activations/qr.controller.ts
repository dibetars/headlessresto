import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RolesGuard, CurrentTenant, Roles } from '../../common/guards/roles.guard';
import { QrService } from './qr.service';

@Controller('menu')
export class QrController {
  constructor(private qrService: QrService) {}

  // Public — no auth
  @Get(':slug')
  getPublicMenu(@Param('slug') slug: string) {
    return this.qrService.getPublicMenu(slug);
  }

  @Get(':locationId/qr-codes')
  @UseGuards(RolesGuard)
  @Roles('owner', 'manager')
  generateQrCodes(
    @Param('locationId') locationId: string,
    @Query('tables') tables: string,
  ) {
    return this.qrService.generateQrCodes(locationId, parseInt(tables) || 10);
  }
}
