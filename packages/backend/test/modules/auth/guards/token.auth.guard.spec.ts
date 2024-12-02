import { ExecutionContext } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';

import { TokenType } from '@/src/common/enums/token-type.enum';
import {
  InvalidTokenException,
  JwtAuthFailedException,
} from '@/src/common/exceptions/auth/token.exception';
import {
  BearerAuthGuard,
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
        isAdmin: payload.isAdmin,
      });
    });

    it('헤더에 Authorization이 없는 경우, 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: {},
      });

      await expect(guard.canActivate(context)).rejects.toThrowError(
        InvalidTokenException,
      );
    });

    it('Authorization 타입이 Bearer가 아닌 경우, 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'invalid-token' },
      });

      await expect(guard.canActivate(context)).rejects.toThrowError(
        InvalidTokenException,
      );
    });

    it('페이로드의 타입이 temporary가 아닌 경우, 에러가 발생함', async () => {
      const payload = {
        email: 'test@example.com',
        isAdmin: true,
        type: TokenType.ACCESS,
      };

      const context = createExecutionContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      vi.mocked(jwtService.verify).mockReturnValue(payload);

      await expect(guard.canActivate(context)).rejects.toThrowError(
        InvalidTokenException,
      );
    });

    it('JWT 토큰 검증에 실패한 경우, 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'Bearer invalid-token' },
      });

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new JsonWebTokenError('jwt error');
      });

      await expect(guard.canActivate(context)).rejects.toThrowError(
        JwtAuthFailedException,
      );
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
        isAdmin: payload.isAdmin,
      });
    });

    it('헤더에 Authorization이 없는 경우, 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: {},
      });

      await expect(guard.canActivate(context)).rejects.toThrowError(
        InvalidTokenException,
      );
    });

    it('Authorization 타입이 Bearer가 아닌 경우, 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'invalid-token' },
      });

      await expect(guard.canActivate(context)).rejects.toThrowError(
        InvalidTokenException,
      );
    });

    it('페이로드의 타입이 access가 아닌 경우, 에러가 발생함', async () => {
      const payload = {
        email: 'test@example.com',
        isAdmin: true,
        type: TokenType.TEMPORARY,
      };

      const context = createExecutionContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      vi.mocked(jwtService.verify).mockReturnValue(payload);

      await expect(guard.canActivate(context)).rejects.toThrowError(
        InvalidTokenException,
      );
    });

    it('JWT 토큰 검증에 실패한 경우, 에러가 발생함', async () => {
      const context = createExecutionContext({
        headers: { authorization: 'Bearer invalid-token' },
      });

      vi.mocked(jwtService.verify).mockImplementation(() => {
        throw new JsonWebTokenError('jwt error');
      });

      await expect(guard.canActivate(context)).rejects.toThrowError(
        JwtAuthFailedException,
      );
    });
  });
});
