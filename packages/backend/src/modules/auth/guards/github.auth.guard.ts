import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

import {
  GithubAuthErrorCode,
  GithubAuthException,
} from '@/src/modules/auth/exceptions/github-auth.exception';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  override handleRequest(err: any, user: any, _info: any, context: any) {
    const adminWebUrl = this.configService.get('auth.adminWebUrl');
    const response = context.switchToHttp().getResponse();

    if (
      err instanceof GithubAuthException &&
      err.getCode() === GithubAuthErrorCode.NOT_ADMIN
    ) {
      return response.redirect(`${adminWebUrl}/login?error=not_admin`);
    }

    if (err || !user) {
      return response.redirect(`${adminWebUrl}/login?error=github_auth_failed`);
    }

    return user;
  }
}
