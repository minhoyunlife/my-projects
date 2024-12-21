import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';

import { TokenType } from '@/src/modules/auth/enums/token-type.enum';
import {
  TokenErrorCode,
  TokenException,
} from '@/src/modules/auth/exceptions/token.exception';
import {
  BearerAuthGuard,
  OptionalBearerAuthGuard,
  TempAuthGuard,
} from '@/src/modules/auth/guards/token.auth.guard';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('TokenAuthGuard', () => {
  function createExecutionContext({
    headers = {},
  }: {
    headers?: Record<string, string>;
  }): ExecutionContext {
    const request: any = { headers: headers };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }

  describe('TempAuthGuard', () => {
    let guard: TempAuthGuard;
    let jwtService: JwtService;

    beforeAll(async () => {
      const module = await createTestingModuleWithoutDB({
        providers: [
          TempAuthGuard,
          {
            provide: JwtService,
            useValue: {
              verify: vi.fn(),
            },
          },
        ],
      });

      guard = module.get(TempAuthGuard);
      jwtService = module.get(JwtService);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('유효한 토큰인 경우, request 객체에 user 정보를 추가함', async () => {
      const payload = {
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        isAdmin: true,
        type: TokenType.TEMPORARY,
      };

      const context = createExecutionContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      vi.mocked(jwtService.verify).mockReturnValue(payload);

      const result = await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(request.user).toEqual({
        email: payload.email,
        avatarUrl: payload.avatarUrl,
        isAdmin: payload.isAdmin,
      });
    });

    it('헤더에 Authorization이 없는 경우, NOT_PROVIDED 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: {},
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.NOT_PROVIDED);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('Authorization 타입이 Bearer가 아닌 경우, INVALID_FORMAT 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'invalid-token' },
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_FORMAT);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('페이로드의 타입이 temporary가 아닌 경우, INVALID_TYPE 에러가 발생함', async () => {
      const payload = {
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        isAdmin: true,
        type: TokenType.ACCESS,
      };

      const context = createExecutionContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      vi.mocked(jwtService.verify).mockReturnValue(payload);

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_TYPE);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('JWT 토큰이 만료된 경우, EXPIRED 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'Bearer expired-token' },
      });

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new TokenExpiredError('jwt error', new Date());
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.EXPIRED);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('JWT 토큰 검증에 실패한 경우, INVALID_TOKEN 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'Bearer invalid-token' },
      });

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new JsonWebTokenError('jwt error');
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_TOKEN);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });
  });

  describe('BearerAuthGuard', () => {
    let guard: BearerAuthGuard;
    let jwtService: JwtService;

    beforeAll(async () => {
      const module = await createTestingModuleWithoutDB({
        providers: [
          BearerAuthGuard,
          {
            provide: JwtService,
            useValue: {
              verify: vi.fn(),
            },
          },
        ],
      });

      guard = module.get(BearerAuthGuard);
      jwtService = module.get(JwtService);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('유효한 토큰인 경우, request 객체에 user 정보를 추가함', async () => {
      const payload = {
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        isAdmin: true,
        type: TokenType.ACCESS,
      };

      const context = createExecutionContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      vi.mocked(jwtService.verify).mockReturnValue(payload);

      const result = await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(request.user).toEqual({
        email: payload.email,
        avatarUrl: payload.avatarUrl,
        isAdmin: payload.isAdmin,
      });
    });

    it('헤더에 Authorization이 없는 경우, 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: {},
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.NOT_PROVIDED);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('Authorization 타입이 Bearer가 아닌 경우, INVALID_FORMAT 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'invalid-token' },
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_FORMAT);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('페이로드의 타입이 access가 아닌 경우, INVALID_TYPE 에러가 발생함', async () => {
      const payload = {
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        isAdmin: true,
        type: TokenType.TEMPORARY,
      };

      const context = createExecutionContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      vi.mocked(jwtService.verify).mockReturnValue(payload);

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_TYPE);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('JWT 토큰이 만료된 경우, EXPIRED 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'Bearer expired-token' },
      });

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new TokenExpiredError('jwt error', new Date());
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.EXPIRED);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('JWT 토큰 검증에 실패한 경우, INVALID_TOKEN 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'Bearer invalid-token' },
      });

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new JsonWebTokenError('jwt error');
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_TOKEN);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });
  });

  describe('OptionalBearerAuthGuard', () => {
    let guard: OptionalBearerAuthGuard;
    let jwtService: JwtService;

    beforeAll(async () => {
      const module = await createTestingModuleWithoutDB({
        providers: [
          OptionalBearerAuthGuard,
          {
            provide: JwtService,
            useValue: {
              verify: vi.fn(),
            },
          },
        ],
      });

      guard = module.get(OptionalBearerAuthGuard);
      jwtService = module.get(JwtService);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('유효한 토큰인 경우, request 객체에 user 정보를 추가하고 true를 반환함', async () => {
      const payload = {
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        isAdmin: true,
        type: TokenType.ACCESS,
      };

      const context = createExecutionContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      vi.mocked(jwtService.verify).mockReturnValue(payload);

      const result = await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(request.user).toEqual({
        email: payload.email,
        avatarUrl: payload.avatarUrl,
        isAdmin: payload.isAdmin,
      });
    });

    it('헤더에 Authorization이 없는 경우, request.user는 undefined이고 true를 반환함', async () => {
      const context = createExecutionContext({
        headers: {},
      });

      const result = await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(request.user).toBeUndefined();
    });

    it('Authorization 타입이 Bearer가 아닌 경우, TokenException을 발생시킴', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'invalid-token' },
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_FORMAT);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('페이로드의 타입이 access가 아닌 경우, TokenException을 발생시킴', async () => {
      const payload = {
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        isAdmin: true,
        type: TokenType.TEMPORARY,
      };

      const context = createExecutionContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      vi.mocked(jwtService.verify).mockReturnValue(payload);

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_TYPE);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('JWT 토큰이 만료된 경우, TokenException을 발생시킴', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'Bearer expired-token' },
      });

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new TokenExpiredError('jwt error', new Date());
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.EXPIRED);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('JWT 토큰 검증에 실패한 경우, TokenException을 발생시킴', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'Bearer invalid-token' },
      });

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new JsonWebTokenError('jwt error');
      });

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_TOKEN);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });
  });
});
