import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { TokenNotProvidedException } from '@/src/common/exceptions/auth/token.exception';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/interfaces/Administrator.interface';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      throw new TokenNotProvidedException('Refresh token not provided');
    }

    const user = await this.authService.verifyRefreshToken(refreshToken);
    request.user = user as Administrator;

    return true;
  }
}
