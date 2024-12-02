import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { RefreshTokenNotProvidedException } from '@/src/common/exceptions/auth/token.exception';
import { AuthService } from '@/src/modules/auth/auth.service';
import { AdminUser } from '@/src/modules/auth/interfaces/admin-user.interface';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      throw new RefreshTokenNotProvidedException();
    }

    const user = await this.authService.verifyRefreshToken(refreshToken);
    request.user = user as AdminUser;

    return true;
  }
}
