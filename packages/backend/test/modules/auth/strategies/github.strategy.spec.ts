import { ConfigService } from '@nestjs/config';

import { InvalidGithubProfileException } from '@/src/common/exceptions/auth/strategy.exception';
import { AuthService } from '@/src/modules/auth/auth.service';
import { AdminUser } from '@/src/modules/auth/interfaces/admin-user.interface';
import { GithubProfile } from '@/src/modules/auth/interfaces/github-profile.interface';
import { GithubStrategy } from '@/src/modules/auth/strategies/github.strategy';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('GithubStrategy', () => {
  let strategy: GithubStrategy;
  let authService: AuthService;

  beforeAll(async () => {
    const module = await createTestingModuleWithoutDB({
      providers: [
        GithubStrategy,
        {
          provide: AuthService,
          useValue: {
            validateAdminUser: vi.fn(),
          },
        },
      ],
    });

    strategy = module.get(GithubStrategy);
    authService = module.get(AuthService);
  });

  describe('validate()', () => {
    it('처리 결과, validateAdminUser의 반환값을 그대로 반환함', async () => {
      const profile = {
        emails: [{ value: 'test@example.com' }],
      } as GithubProfile;

      const expectedResult = {
        email: 'test@example.com',
        isAdmin: true,
      } as AdminUser;

      vi.mocked(authService.validateAdminUser).mockResolvedValue(
        expectedResult,
      );

      const result = await strategy.validate('', '', profile);
      expect(result).toEqual(expectedResult);
    });

    it('이메일이 없는 GitHub 프로필의 경우, 에러가 발생함', async () => {
      const profile = {
        emails: [],
      } as GithubProfile;

      await expect(strategy.validate('', '', profile)).rejects.toThrowError(
        InvalidGithubProfileException,
      );
    });
  });
});
