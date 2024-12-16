import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-github2';

import {
  GithubAuthErrorCode,
  GithubAuthException,
} from '@/src/common/exceptions/auth/github-auth.exception';
import { AuthService } from '@/src/modules/auth/auth.service';
import { GithubProfile } from '@/src/modules/auth/interfaces/github-profile.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('auth.clientId'),
      clientSecret: configService.get('auth.clientSecret'),
      callbackURL: configService.get('auth.callbackUrl'),
      scope: ['user:email', 'read:user'],
    });
  }

  async validate(_: string, __: string, profile: GithubProfile) {
    if (profile.emails?.length === 0) {
      throw new GithubAuthException(
        GithubAuthErrorCode.INVALID_PROFILE,
        'Invalid Github profile',
      );
    }
    return await this.authService.validateAdminUser(profile);
  }
}
