import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Request, Response } from 'express';

import { Environment } from '@/src/common/enums/environment.enum';
import { AuthService } from '@/src/modules/auth/auth.service';
import {
  VerifyBackupCodeRequestDto,
  VerifyTotpRequestDto,
} from '@/src/modules/auth/dtos/request.dto';
import {
  SetupTotpResponseDto,
  Verify2faResponseDto,
} from '@/src/modules/auth/dtos/response.dto';
import { TokenType } from '@/src/modules/auth/enums/token-type.enum';
import { CookieAuthGuard } from '@/src/modules/auth/guards/cookie.auth.guard';
import { GithubAuthGuard } from '@/src/modules/auth/guards/github.auth.guard';
import { TempAuthGuard } from '@/src/modules/auth/guards/token.auth.guard';
import { AdminUser } from '@/src/modules/auth/interfaces/admin-user.interface';

@Controller('auth')
export class AuthController {
  private readonly cookieDomain: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.cookieDomain =
      this.configService.get('app.env') === Environment.PROD
        ? '.minhoyun.life'
        : undefined;
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  async githubAuth() {} // 가드가 리다이렉트 책무를 가지므로 별도 코드 작성은 불필요

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubAuthCallback(
    @Req() req: Request & { user: AdminUser },
    @Res() res: Response,
  ) {
    const tempToken = await this.authService.createTempToken(req.user);
    const needToSetup2FA = !req.user.isTotpEnabled;
    const adminWebUrl = this.configService.get('auth.adminWebUrl');

    return res.redirect(
      needToSetup2FA
        ? `${adminWebUrl}/2fa-setup?token=${tempToken}`
        : `${adminWebUrl}/2fa?token=${tempToken}`,
    );
  }

  @Post('2fa/setup')
  @UseGuards(TempAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async setupTotp(
    @Req() req: Request & { user: AdminUser },
  ): Promise<SetupTotpResponseDto> {
    return this.authService.setupTotp(req.user.email);
  }

  @Post('2fa/verify')
  @UseGuards(TempAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyTotp(
    @Req() req: Request & { user: AdminUser },
    @Body() verifyTotpDto: VerifyTotpRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    const isInitialSetup = !!verifyTotpDto.setupToken;

    await this.authService.verifyTotpCode(req.user.email, verifyTotpDto.code);

    const accessToken = await this.authService.createAccessToken(req.user);

    const refreshToken = await this.authService.createRefreshToken(req.user);

    this.setRefreshTokenCookie(res, refreshToken);
    this.setUserCookie(res, req.user);

    if (isInitialSetup) {
      res.cookie('show', 'true', {
        httpOnly: true,
        maxAge: 30000,
        sameSite:
          this.configService.get('app.env') === Environment.PROD
            ? 'none'
            : 'lax',
        secure: this.configService.get('app.env') === Environment.PROD,
        domain: this.cookieDomain,
      });
    }

    const response: Verify2faResponseDto = {
      accessToken,
      expiresIn: this.authService.TOKEN_EXPIRY[TokenType.ACCESS],
      ...(isInitialSetup && {
        backupCodes: await this.authService.getBackupCodes(req.user.email),
      }),
    };

    res.json(response);
  }

  @Post('2fa/backup')
  @UseGuards(TempAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyBackupCode(
    @Req() req: Request & { user: AdminUser },
    @Body() verifyBackupCodeDto: VerifyBackupCodeRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.verifyBackupCode(
      req.user.email,
      verifyBackupCodeDto.code,
    );

    const accessToken = await this.authService.createAccessToken(req.user);

    const refreshToken = await this.authService.createRefreshToken(req.user);

    this.setRefreshTokenCookie(res, refreshToken);
    this.setUserCookie(res, req.user);

    res.json({
      accessToken,
      expiresIn: this.authService.TOKEN_EXPIRY[TokenType.ACCESS],
    });
  }

  @Post('refresh')
  @UseGuards(CookieAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request & { user: AdminUser }) {
    const accessToken = await this.authService.createAccessToken(req.user);

    return {
      accessToken,
      expiresIn: this.authService.TOKEN_EXPIRY[TokenType.ACCESS],
    };
  }

  @Post('logout')
  @UseGuards(CookieAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res: Response): Promise<void> {
    this.clearRefreshTokenCookie(res);
    this.clearUserCookie(res);

    res.end();
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('app.env') === Environment.PROD,
      sameSite:
        this.configService.get('app.env') === Environment.PROD ? 'none' : 'lax',
      maxAge: this.authService.TOKEN_EXPIRY[TokenType.REFRESH] * 1000,
      domain: this.cookieDomain,
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get('app.env') === Environment.PROD,
      sameSite:
        this.configService.get('app.env') === Environment.PROD ? 'none' : 'lax',
      domain: this.cookieDomain,
    });
  }

  private setUserCookie(res: Response, user: AdminUser): void {
    res.cookie('user', JSON.stringify(user), {
      secure: this.configService.get('app.env') === Environment.PROD,
      sameSite:
        this.configService.get('app.env') === Environment.PROD ? 'none' : 'lax',
      domain: this.cookieDomain,
    });
  }

  private clearUserCookie(res: Response): void {
    res.clearCookie('user', {
      secure: this.configService.get('app.env') === Environment.PROD,
      sameSite:
        this.configService.get('app.env') === Environment.PROD ? 'none' : 'lax',
      domain: this.cookieDomain,
    });
  }
}
