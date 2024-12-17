import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';

import {
  GithubAuthErrorCode,
  GithubAuthException,
} from '@/src/modules/auth/exceptions/github-auth.exception';
import { GithubAuthGuard } from '@/src/modules/auth/guards/github.auth.guard';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('GithubAuthGuard', () => {
  function createExecutionContext(): ExecutionContext {
    const response: any = {
      redirect: vi.fn(),
    };
    return {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as ExecutionContext;
  }

  let guard: GithubAuthGuard;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await createTestingModuleWithoutDB({
      providers: [GithubAuthGuard],
    });

    guard = module.get(GithubAuthGuard);
    configService = module.get(ConfigService);
  });

  it('예외가 발생하지 않는 경우, 사용자를 반환함', () => {
    const context = createExecutionContext();
    const user = { id: 1, email: 'test@example.com' };

    const result = guard.handleRequest(null, user, null, context);
    expect(result).toBe(user);
  });

  it('관리자 불일치 예외 발생한 경우, not_admin 파라미터와 함께 로그인 페이지로 리다이렉트함', () => {
    const context = createExecutionContext();
    const response = context.switchToHttp().getResponse();

    guard.handleRequest(
      new GithubAuthException(
        GithubAuthErrorCode.NOT_ADMIN,
        'Email of payload is not admin',
      ),
      null,
      null,
      context,
    );

    expect(response.redirect).toHaveBeenCalledWith(
      `${configService.get('auth.adminWebUrl')}/login?error=not_admin`,
    );
  });

  it('기타 에러가 발생한 경우, github_auth_failed 파라미터와 함께 로그인 페이지로 리다이렉트함', () => {
    const context = createExecutionContext();
    const user = { id: 1, email: 'test@example.com' };
    const response = context.switchToHttp().getResponse();

    guard.handleRequest(new Error(), user, null, context);

    expect(response.redirect).toHaveBeenCalledWith(
      `${configService.get('auth.adminWebUrl')}/login?error=github_auth_failed`,
    );
  });

  it('유저 정보가 없는 경우, github_auth_failed 파라미터와 함께 로그인 페이지로 리다이렉트함', () => {
    const context = createExecutionContext();
    const response = context.switchToHttp().getResponse();

    guard.handleRequest(null, null, null, context);

    expect(response.redirect).toHaveBeenCalledWith(
      `${configService.get('auth.adminWebUrl')}/login?error=github_auth_failed`,
    );
  });
});
