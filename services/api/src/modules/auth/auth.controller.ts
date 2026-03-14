import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser, type RequestUser } from '../../common/guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Returns the current user's profile + all org memberships.
   * Called by web/mobile after login to set up app context.
   */
  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    const [profile, memberships] = await Promise.all([
      this.authService.getUserProfile(user.id),
      this.authService.getUserMemberships(user.id),
    ]);
    return { user: profile, memberships };
  }
}
