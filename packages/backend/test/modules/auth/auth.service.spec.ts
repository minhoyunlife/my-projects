import { randomBytes } from 'crypto';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

import { authenticator } from 'otplib';
import { DataSource, Repository } from 'typeorm';

import { TokenType } from '@/src/common/enums/token-type.enum';
import { decrypt } from '@/src/common/utils/encryption.util';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Totp } from '@/src/modules/auth/entities/totp.entity';
import { GithubProfile } from '@/src/modules/auth/interfaces/github-profile.interface';
import { clearTables } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  let administratorRepo: Repository<Administrator>;
  let totpRepo: Repository<Totp>;
  let dataSource: DataSource;

  const encryptionKey = randomBytes(32).toString('base64');
  const email = 'test@example.com';

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [Administrator, Totp],
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockImplementation((key: string) => {
              if (key === 'database.encryption_key') {
                return encryptionKey;
              }
              return null;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: vi.fn() },
        },
      ],
    });

    service = module.get(AuthService);
    jwtService = module.get(JwtService);

    administratorRepo = module.get(getRepositoryToken(Administrator));
    totpRepo = module.get(getRepositoryToken(Totp));
    dataSource = module.get(DataSource);
  });

  beforeEach(async () => {
    await administratorRepo.save({ email });
  });

  afterEach(async () => {
    await clearTables(dataSource, [Administrator, Totp]);
    vi.clearAllMocks();
  });

  describe('validateAdminUser()', () => {
    it('등록된 관리자인 경우, 유저 정보를 반환함', async () => {
      const profile = {
        emails: [{ value: email }],
      } as GithubProfile;

      const result = await service.validateAdminUser(profile);

      expect(result).toEqual({
        email,
        isAdmin: true,
      });
    });

    it('등록되지 않은 이메일인 경우, 에러가 발생함', async () => {
      const profile = {
        emails: [{ value: 'unknown@example.com' }],
      } as GithubProfile;

      await expect(service.validateAdminUser(profile)).rejects.toThrowError();
    });
  });

  describe('createTempToken()', () => {
    it('임시 토큰을 생성함', async () => {
      const token = 'mock.jwt.token';
      const user = {
        email,
        isAdmin: true,
      };

      vi.mocked(jwtService.sign).mockResolvedValue(token);

      const result = await service.createTempToken(user);

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          email: user.email,
          isAdmin: user.isAdmin,
          type: TokenType.TEMPORARY,
        },
        {
          expiresIn: '5m',
        },
      );
      expect(result).toBe(token);
    });
  });

  describe('setupTotp()', () => {
    it('TOTP 초기 설정이 성공함', async () => {
      const result = await service.setupTotp(email);

      expect(result).toHaveProperty('qrCodeUri');
      expect(result).toHaveProperty('backupCodes');

      const savedTotp = await totpRepo.findOneBy({ adminEmail: email });
      expect(savedTotp).toBeDefined();
    });

    it('초기 설정이 성공한 경우, QR코드의 URI에 설정한 email 과 issuer 가 들어감', async () => {
      const result = await service.setupTotp(email);

      expect(result.qrCodeUri).toContain(encodeURIComponent(email));
      expect(result.qrCodeUri).toContain(
        encodeURIComponent('My Projects Admin'),
      );
    });

    it('초기 설정이 성공한 경우, 생성된 백업 코드가 올바른 형식을 가짐', async () => {
      const result = await service.setupTotp(email);

      expect(result.backupCodes).toHaveLength(8);
      result.backupCodes.forEach((code) => {
        expect(code).toMatch(/^[0-9A-F]{8}$/);
      });
    });

    it('해당 계정에 이미 TOTP 가 설정되어 있는 경우, 에러가 발생함', async () => {
      await service.setupTotp(email);

      await expect(service.setupTotp(email)).rejects.toThrowError();
    });
  });

  describe('verifyTotpCode()', () => {
    beforeEach(async () => {
      await service.setupTotp(email);
    });

    it('올바른 TOTP 코드인 경우, 검증에 성공함', async () => {
      const totp = await totpRepo.findOneBy({ adminEmail: email });
      const validCode = authenticator.generate(totp.encryptedSecret);

      const result = await service.verifyTotpCode(email, validCode);
      expect(result).toBe(true);
    });

    it('등록되지 않은 이메일인 경우, 에러가 발생함', async () => {
      const invalidEmail = 'unknown@example.com';
      const code = '12345678';

      await expect(
        service.verifyTotpCode(invalidEmail, code),
      ).rejects.toThrowError();
    });

    it('잘못된 TOTP 코드인 경우, 검증에 실패함', async () => {
      const invalidCode = '12345678';

      const result = await service.verifyTotpCode(email, invalidCode);
      expect(result).toBe(false);
    });

    describe('검증 실패 횟수에 대한 동작 검증', () => {
      it('검증에 실패할 경우, 실패 횟수가 증가함', async () => {
        const invalidCode = '12345678';
        await service.verifyTotpCode(email, invalidCode);

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(1);
      });

      it('검증에 성공할 경우, 실패 횟수가 초기화됨', async () => {
        const invalidCode = '12345678';
        await service.verifyTotpCode(email, invalidCode); // 한 번 실패 후

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        const validCode = authenticator.generate(totp.encryptedSecret);

        await service.verifyTotpCode(email, validCode); // 검증 성공하면

        const updatedTotp = await totpRepo.findOneBy({ adminEmail: email });

        expect(updatedTotp.failedAttempts).toBe(0);
        expect(updatedTotp.lastFailedAttempt).toBeNull();
      });

      it('최대 검증 실패 가능횟수를 초과한 경우, 에러가 발생함', async () => {
        const invalidCode = '12345678';

        // 최대 검증 실패 가능횟수는 5
        for (let i = 0; i < 5; i++) {
          await service.verifyTotpCode(email, invalidCode);
        }

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(5);

        await expect(
          service.verifyTotpCode(email, invalidCode),
        ).rejects.toThrowError();
      });

      it('마지막 실패 시도로부터 15분이 지난 후에 다시 실패 시도를 한 경우, 실패 횟수가 1이 됨', async () => {
        const invalidCode = '12345678';
        await service.verifyTotpCode(email, invalidCode); // 마지막 실패 시도

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(1);

        vi.useFakeTimers();
        setTimeout(
          async () => await service.verifyTotpCode(email, invalidCode),
          15 * 60 * 1000 + 1000, // 15분 1초 후
        );
        vi.runAllTimers();

        const updatedTotp = await totpRepo.findOneBy({ adminEmail: email });
        expect(updatedTotp.failedAttempts).toBe(1);
      });
    });
  });

  describe('verifyBackupCode()', () => {
    beforeEach(async () => {
      await service.setupTotp(email);
    });

    it('올바른 백업 코드인 경우, 검증에 성공함', async () => {
      const totp = await totpRepo.findOneBy({ adminEmail: email });

      const randomIndex = Math.floor(Math.random() * totp.backupCodes.length);
      const decryptedCode = decrypt(
        totp.backupCodes[randomIndex],
        encryptionKey,
      );

      const result = await service.verifyBackupCode(email, decryptedCode);

      expect(result).toBe(true);
    });

    it('등록되지 않은 이메일인 경우, 에러가 발생함', async () => {
      const invalidEmail = 'unknown@example.com';

      const totp = await totpRepo.findOneBy({ adminEmail: email });

      const randomIndex = Math.floor(Math.random() * totp.backupCodes.length);
      const decryptedCode = decrypt(
        totp.backupCodes[randomIndex],
        encryptionKey,
      );

      await expect(
        service.verifyBackupCode(invalidEmail, decryptedCode),
      ).rejects.toThrowError();
    });

    it('잘못된 백업 코드인 경우, 검증에 실패함', async () => {
      const invalidCode = '12345678';

      const result = await service.verifyBackupCode(email, invalidCode);
      expect(result).toBe(false);
    });
  });

  describe('createAccessToken()', () => {
    it('액세스 토큰을 생성함', async () => {
      const token = 'mock.jwt.token';
      const user = {
        email,
        isAdmin: true,
      };

      vi.mocked(jwtService.sign).mockResolvedValue(token);

      const result = await service.createAccessToken(user);

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          email: user.email,
          isAdmin: user.isAdmin,
          type: TokenType.ACCESS,
        },
        {
          expiresIn: '1d',
        },
      );
      expect(result).toBe(token);
    });
  });
});
