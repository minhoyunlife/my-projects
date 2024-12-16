import { TokenType } from '@/src/common/enums/token-type.enum';

/**
 * 토큰 베이스 인터페이스
 */
export interface TokenPayload {
  email: string;
  avatarUrl: string;
  isAdmin: boolean;
  type: TokenType;
  iat: number;
  exp: number;
}

/**
 * 임시 토큰 인터페이스
 */
export interface TempTokenPayload extends TokenPayload {
  type: TokenType.TEMPORARY;
}

/**
 * 본 액세스 토큰 인터페이스
 */
export interface AccessTokenPayload extends TokenPayload {
  type: TokenType.ACCESS;
}

/**
 * 리프레시 토큰 인터페이스
 */
export interface RefreshTokenPayload extends TokenPayload {
  type: TokenType.REFRESH;
}
