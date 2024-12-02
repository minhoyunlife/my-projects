import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';

import { TokenType } from '@/src/common/enums/token-type.enum';
import {
  InvalidTokenException,
  JwtAuthFailedException,
} from '@/src/common/exceptions/auth/token.exception';
import { AdminUser } from '@/src/modules/auth/interfaces/admin-user.interface';
import {
  AccessTokenPayload,
  TempTokenPayload,
  TokenPayload,
} from '@/src/modules/auth/interfaces/token.interface';

/**
 * 토큰 기반 인증 가드의 추상 클래스
 * @template T 토큰 페이로드 타입
 */
abstract class TokenAuthGuard<T extends TokenPayload> implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tokenType: TokenType,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new Error('Authorization headers not provided'); // 400
      }

      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer') {
        throw new Error('Invalid token format'); // 400
      }

      const payload = this.jwtService.verify<T>(token, {
        secret: this.configService.get('auth.jwtSecret'),
      });

      if (payload.type !== this.tokenType) {
        throw new Error('Invalid token type'); // 400
      }

      request.user = {
        email: payload.email,
        isAdmin: payload.isAdmin,
      } as AdminUser;

      return true;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new JwtAuthFailedException(); // 401
      }
      throw new InvalidTokenException(); // 400
    }
  }
}

/**
 * 임시 토큰 확인용 가드
 */
@Injectable()
export class TempAuthGuard extends TokenAuthGuard<TempTokenPayload> {
  constructor(configService: ConfigService, jwtService: JwtService) {
    super(configService, jwtService, TokenType.TEMPORARY);
  }
}

/**
 * 본 액세스 토큰 확인용 가드
 */
@Injectable()
export class BearerAuthGuard extends TokenAuthGuard<AccessTokenPayload> {
  constructor(configService: ConfigService, jwtService: JwtService) {
    super(configService, jwtService, TokenType.ACCESS);
  }
}
