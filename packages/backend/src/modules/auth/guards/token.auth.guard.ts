import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import { TokenType } from '@/src/modules/auth/enums/token-type.enum';
import {
  TokenErrorCode,
  TokenException,
} from '@/src/modules/auth/exceptions/token.exception';
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

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new TokenException(
        TokenErrorCode.NOT_PROVIDED,
        'Authorization headers not provided',
      );
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      throw new TokenException(
        TokenErrorCode.INVALID_FORMAT,
        'Invalid token format',
        { type: [`Expected 'Bearer' but ${type} provided`] },
      );
    }

    let payload: T;

    try {
      payload = this.jwtService.verify<T>(token, {
        secret: this.configService.get('auth.jwtSecret'),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenException(TokenErrorCode.EXPIRED, 'Token expired');
      }
      throw new TokenException(TokenErrorCode.INVALID_TOKEN, 'Invalid token');
    }

    if (payload.type !== this.tokenType) {
      throw new TokenException(
        TokenErrorCode.INVALID_TYPE,
        'Invalid token type',
        { type: [`Expected ${this.tokenType} but ${payload.type} provided`] },
      );
    }

    request.user = {
      email: payload.email,
      avatarUrl: payload.avatarUrl,
      isAdmin: payload.isAdmin,
    } as AdminUser;

    return true;
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

/**
 * 본 액세스 토큰 확인용 가드(옵셔널)
 */
@Injectable()
export class OptionalBearerAuthGuard extends BearerAuthGuard {
  constructor(configService: ConfigService, jwtService: JwtService) {
    super(configService, jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      await super.canActivate(context);
    } catch (error) {
      // 토큰이 없는 경우는 인증이 필요하지 않은 액세스를 의미하므로, 옵셔널하게 처리
      if (
        error instanceof TokenException &&
        error.getCode() === TokenErrorCode.NOT_PROVIDED
      ) {
        request.user = undefined;
        return true;
      }

      throw error;
    }

    return true;
  }
}
