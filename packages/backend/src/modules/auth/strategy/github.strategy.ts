import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-github2';

import { AuthService } from '@/src/modules/auth/auth.service';
import { GithubProfile } from '@/src/modules/auth/interfaces/github-profile.interface';

export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(_: string, __: string, profile: GithubProfile) {
    if (profile.emails?.length === 0) {
      throw new UnauthorizedException('Invalid Github profile');
    }
    return await this.authService.validateGithubUser(profile);
  }
}
