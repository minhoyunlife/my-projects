import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AdminUser } from '@/src/modules/auth/interfaces/admin-user.interface';
import { GithubProfile } from '@/src/modules/auth/interfaces/github-profile.interface';

export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGithubUser(profile: GithubProfile): Promise<AdminUser> {
    const profileEmail = profile.emails[0].value;
    const adminEmail = this.configService.get('ADMIN_EMAIL');

    if (profileEmail !== adminEmail) {
      throw new UnauthorizedException('Provided email has no authorization');
    }

    return {
      email: profileEmail,
      isAdmin: true,
    };
  }

  async createTempToken(user: AdminUser): Promise<string> {
    return this.jwtService.sign(
      {
        email: user.email,
        isAdmin: user.isAdmin,
        type: 'temporary',
      },
      {
        expiresIn: '5m',
      },
    );
  }
}
