import { ExecutionContext } from '@nestjs/common';

import { TokenNotProvidedException } from '@/src/common/exceptions/auth/token.exception';
import { AuthService } from '@/src/modules/auth/auth.service';
import { CookieAuthGuard } from '@/src/modules/auth/guards/cookie.auth.guard';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('CookieAuthGuard', () => {
  function createExecutionContext({
    cookies = {},
  }: {
    cookies?: Record<string, string>;
  }): ExecutionContext {
    const request: any = { cookies: cookies };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }

  let guard: CookieAuthGuard;
  let authService: AuthService;

  beforeAll(async () => {
    const module = await createTestingModuleWithoutDB({
      providers: [
        CookieAuthGuard,
        {
          provide: AuthService,
          useValue: {
            verifyRefreshToken: vi.fn(),
          },
        },
      ],
    });

    guard = module.get(CookieAuthGuard);
    authService = module.get(AuthService);
  });

  it('유효한 쿠키인 경우, request 객체에 user 정보를 추가함', async () => {
    const context = createExecutionContext({
      cookies: { refreshToken: 'valid-token' },
    });

    vi.mocked(authService.verifyRefreshToken).mockResolvedValue({
      email: 'test@example.com',
      isAdmin: true,
    });

    const result = await guard.canActivate(context);
    const request = context.switchToHttp().getRequest();

    expect(result).toBe(true);
    expect(request.user).toEqual({
      email: 'test@example.com',
      isAdmin: true,
    });
  });

  it('쿠키에 리프레시 토큰이 없는 경우, 에러가 발생함', async () => {
    const context = createExecutionContext({ cookies: {} });

    await expect(guard.canActivate(context)).rejects.toThrowError(
      TokenNotProvidedException,
    );
  });
});
