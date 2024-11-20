import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenType } from '@/src/common/enums/token-type.enum';
import { Administrator } from '@/src/modules/auth/interfaces/Administrator.interface';
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
    private readonly jwtService: JwtService,
    private readonly tokenType: TokenType,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new Error('No token provided');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      throw new Error('Invalid token type');
    }

    const payload = this.jwtService.verify<T>(token);
    if (payload.type !== this.tokenType) {
      throw new Error('Invalid token type');
    }

    request.user = {
      email: payload.email,
      isAdmin: payload.isAdmin,
    } as Administrator;

    return true;
  }
}

/**
 * 임시 토큰 확인용 가드
 */
@Injectable()
export class TempAuthGuard extends TokenAuthGuard<TempTokenPayload> {
  /**
   * 생성자입니다.
   * @param jwtService JwtService 인스턴스입니다.
   */
  constructor(jwtService: JwtService) {
    super(jwtService, TokenType.TEMPORARY);
  }
}

/**
 * 본 액세스 토큰 확인용 가드
 */
@Injectable()
export class BearerAuthGuard extends TokenAuthGuard<AccessTokenPayload> {
  constructor(jwtService: JwtService) {
    super(jwtService, TokenType.ACCESS);
  }
}
