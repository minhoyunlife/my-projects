import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

import { Request, Response } from 'express';

import { AuthService } from '@/src/modules/auth/auth.service';
import { AdminUser } from '@/src/modules/auth/interfaces/admin-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // TODO: 깃헙 로그인 페이지로 리다이렉트
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(
    @Req() req: Request & { user: AdminUser },
    @Res() res: Response,
  ) {
    const adminWebUrl = this.configService.get('ADMIN_WEB_URL');

    try {
      const tempToken = await this.authService.createTempToken(req.user);

      // TODO: 실제 프론트엔드 환경에 따라 패스를 바꿔야 할지도
      return res.redirect(`${adminWebUrl}/auth/2fa?token=${tempToken}`);
    } catch (error) {
      // TODO: 실제 프론트엔드 환경에 따라 패스를 바꿔야 할지도
      return res.redirect(`${adminWebUrl}/auth/error`);
    }
  }
}
