import { randomBytes } from 'crypto';

import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

import { authenticator } from 'otplib';
import { DataSource, Repository } from 'typeorm';

import { TokenType } from '@/src/common/enums/token-type.enum';
import {
  GithubAuthErrorCode,
  GithubAuthException,
} from '@/src/common/exceptions/auth/github-auth.exception';
import {
  TokenErrorCode,
  TokenException,
} from '@/src/common/exceptions/auth/token.exception';
import {
  TotpErrorCode,
  TotpException,
} from '@/src/common/exceptions/auth/totp.exception';
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
  let configService: ConfigService;

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
              if (key === 'database.encryptionKey') {
                return encryptionKey;
              } else if (key === 'auth.jwtSecret') {
                return 'test-secret-key';
              }
              return null;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: vi.fn(), verifyAsync: vi.fn() },
        },
      ],
    });

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    administratorRepo = module.get(getRepositoryToken(Administrator));
    totpRepo = module.get(getRepositoryToken(Totp));
    dataSource = module.get(DataSource);
  });

  beforeEach(async () => {
    await administratorRepo.save({ email, isTotpEnabled: false });
  });

  afterEach(async () => {
    await clearTables(dataSource, [Administrator, Totp]);
    vi.clearAllMocks();
  });

  describe('validateAdminUser()', () => {
    it('등록된 관리자인 경우, 유저 정보를 반환함', async () => {
      const administrator = await administratorRepo.findOneBy({ email });

      const profile = {
        emails: [{ value: email }],
      } as GithubProfile;

      const result = await service.validateAdminUser(profile);

      expect(result).toEqual({
        email: administrator.email,
        isAdmin: true,
        isTotpEnabled: administrator.isTotpEnabled,
      });
    });

    it('등록되지 않은 이메일인 경우, 에러가 발생함', async () => {
      const profile = {
        emails: [{ value: 'unknown@example.com' }],
      } as GithubProfile;

      try {
        await service.validateAdminUser(profile);
      } catch (error) {
        expect(error).toBeInstanceOf(GithubAuthException);
        expect(error.getCode()).toBe(GithubAuthErrorCode.NOT_ADMIN);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });
  });

  describe('setupTotp()', () => {
    it('TOTP 초기 설정이 성공함', async () => {
      const result = await service.setupTotp(email);

      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('manualEntryKey');
      expect(result).toHaveProperty('setupToken');

      const savedTotp = await totpRepo.findOneBy({ adminEmail: email });
      expect(savedTotp).toBeDefined();
    });

    it('초기 설정이 성공한 경우, QR코드의 URL에 설정한 email 과 issuer 가 들어감', async () => {
      const result = await service.setupTotp(email);

      expect(result.qrCodeUrl).toContain(encodeURIComponent(email));
      expect(result.qrCodeUrl).toContain(
        encodeURIComponent('My Projects Admin'),
      );
    });

    it('초기 설정이 성공한 경우, 수동 입력용 시크릿 키가 4글자 마다 스페이스 구분으로 반환됨', async () => {
      const result = await service.setupTotp(email);

      expect(result.manualEntryKey).toMatch(/^.{4} .{4} .{4} .{4}$/);
    });

    it('초기 설정이 성공한 경우, 임시 토큰이 반환됨', async () => {
      const result = await service.setupTotp(email);

      expect(result.setupToken).not.toBeNull();
    });

    it('초기 설정이 실패한 경우, 에러가 발생함', async () => {
      const mockGenerateSecret = vi.spyOn(authenticator, 'generateSecret');
      mockGenerateSecret.mockImplementationOnce(() => {
        throw new Error();
      });

      try {
        await service.setupTotp(email);
      } catch (error) {
        expect(error).toBeInstanceOf(TotpException);
        expect(error.getCode()).toBe(TotpErrorCode.SETUP_FAILED);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getBackupCodes()', () => {
    beforeEach(async () => {
      await service.setupTotp(email);
    });

    it('백업 코드 목록을 반환함', async () => {
      const result = await service.getBackupCodes(email);

      expect(result).toHaveLength(8);
      result.forEach((code) => {
        expect(code).toHaveLength(8);
      });
    });

    it('등록되지 않은 이메일인 경우, 에러가 발생함', async () => {
      const invalidEmail = 'unknown@example.com';

      try {
        await service.getBackupCodes(invalidEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(TotpException);
        expect(error.getCode()).toBe(TotpErrorCode.NOT_SETUP);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('verifyTotpCode()', () => {
    beforeEach(async () => {
      await service.setupTotp(email);
    });

    it('올바른 TOTP 코드인 경우, 검증에 성공함', async () => {
      const totp = await totpRepo.findOneBy({ adminEmail: email });
      const validCode = authenticator.generate(
        decrypt(totp.encryptedSecret, encryptionKey),
      );

      await expect(
        service.verifyTotpCode(email, validCode),
      ).resolves.not.toThrowError();
    });

    it('등록되지 않은 이메일인 경우, 에러가 발생함', async () => {
      const invalidEmail = 'unknown@example.com';
      const code = '12345678';

      try {
        await service.verifyTotpCode(invalidEmail, code);
      } catch (error) {
        expect(error).toBeInstanceOf(TotpException);
        expect(error.getCode()).toBe(TotpErrorCode.NOT_SETUP);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('잘못된 형식의 TOTP 코드인 경우, 검증에 실패함', async () => {
      const invalidCode = 'ABCDEFGH';

      const mockVerify = vi.spyOn(authenticator, 'verify');
      mockVerify.mockImplementationOnce(() => {
        throw new Error('Invalid format');
      });

      try {
        await service.verifyTotpCode(email, invalidCode);
      } catch (error) {
        expect(error).toBeInstanceOf(TotpException);
        expect(error.getCode()).toBe(TotpErrorCode.CODE_MALFORMED);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('TOTP 코드가 불일치할 경우, 검증에 실패함', async () => {
      const invalidCode = '000000';

      try {
        await service.verifyTotpCode(email, invalidCode);
      } catch (error) {
        expect(error).toBeInstanceOf(TotpException);
        expect(error.getCode()).toBe(TotpErrorCode.VERIFICATION_FAILED);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    describe('검증 실패 횟수에 대한 동작 검증', () => {
      it('검증에 실패할 경우, 실패 횟수가 증가함', async () => {
        const invalidCode = '12345678';

        await expect(
          service.verifyTotpCode(email, invalidCode),
        ).rejects.toThrowError(TotpException);

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(1);
      });

      it('검증에 성공할 경우, 실패 횟수가 초기화됨', async () => {
        const invalidCode = '12345678';
        await expect(
          service.verifyTotpCode(email, invalidCode),
        ).rejects.toThrowError(TotpException); // 한 번 실패 후

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        const validCode = authenticator.generate(
          decrypt(totp.encryptedSecret, encryptionKey),
        );

        await service.verifyTotpCode(email, validCode); // 검증 성공하면

        const updatedTotp = await totpRepo.findOneBy({ adminEmail: email });
        expect(updatedTotp.failedAttempts).toBe(0);
        expect(updatedTotp.lastFailedAttempt).toBeNull();
      });

      it('최대 검증 실패 가능횟수를 초과한 경우, 에러가 발생함', async () => {
        const invalidCode = '000000';

        // 최대 검증 실패 가능횟수는 5
        for (let i = 0; i < 5; i++) {
          await expect(
            service.verifyTotpCode(email, invalidCode),
          ).rejects.toThrowError(TotpException);
        }

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(5);

        try {
          await service.verifyTotpCode(email, invalidCode);
        } catch (error) {
          expect(error).toBeInstanceOf(TotpException);
          expect(error.getCode()).toBe(TotpErrorCode.MAX_ATTEMPTS_EXCEEDED);
          expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        }
      });

      it('마지막 실패 시도로부터 15분이 지난 후에 다시 실패 시도를 한 경우, 실패 횟수가 1이 됨', async () => {
        const invalidCode = '000000';

        await expect(
          service.verifyTotpCode(email, invalidCode),
        ).rejects.toThrowError(TotpException); // 마지막 실패 시도

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(1);

        // 위의 실패로 인해 세팅되었던 실패 시간을 15분 전으로 직접 되돌림
        await totpRepo.update(
          { adminEmail: email },
          {
            lastFailedAttempt: () =>
              "CURRENT_TIMESTAMP - interval '15 minutes 1 second'",
          },
        );

        await expect(
          service.verifyTotpCode(email, invalidCode),
        ).rejects.toThrowError(TotpException);

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

      await expect(
        service.verifyBackupCode(email, decryptedCode),
      ).resolves.not.toThrowError();
    });

    it('등록되지 않은 이메일인 경우, 에러가 발생함', async () => {
      const invalidEmail = 'unknown@example.com';

      const totp = await totpRepo.findOneBy({ adminEmail: email });

      const randomIndex = Math.floor(Math.random() * totp.backupCodes.length);
      const decryptedCode = decrypt(
        totp.backupCodes[randomIndex],
        encryptionKey,
      );

      try {
        await service.verifyBackupCode(invalidEmail, decryptedCode);
      } catch (error) {
        expect(error).toBeInstanceOf(TotpException);
        expect(error.getCode()).toBe(TotpErrorCode.NOT_SETUP);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('백업 코드가 불일치한 경우, 검증에 실패함', async () => {
      const invalidCode = 'AAAAAAAA';

      try {
        await service.verifyBackupCode(email, invalidCode);
      } catch (error) {
        expect(error).toBeInstanceOf(TotpException);
        expect(error.getCode()).toBe(TotpErrorCode.VERIFICATION_FAILED);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    describe('검증 실패 횟수에 대한 동작 검증', () => {
      it('검증에 실패할 경우, 실패 횟수가 증가함', async () => {
        const invalidCode = 'AAAAAAAA';

        await expect(
          service.verifyBackupCode(email, invalidCode),
        ).rejects.toThrowError(TotpException);

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(1);
      });

      it('검증에 성공할 경우, 실패 횟수가 초기화됨', async () => {
        const invalidCode = 'AAAAAAAA';

        await expect(
          service.verifyBackupCode(email, invalidCode),
        ).rejects.toThrowError(TotpException); // 한 번 실패 후

        const totp = await totpRepo.findOneBy({ adminEmail: email });

        const randomIndex = Math.floor(Math.random() * totp.backupCodes.length);
        const decryptedCode = decrypt(
          totp.backupCodes[randomIndex],
          encryptionKey,
        );

        await service.verifyBackupCode(email, decryptedCode); // 검증 성공하면

        const updatedTotp = await totpRepo.findOneBy({ adminEmail: email });
        expect(updatedTotp.failedAttempts).toBe(0);
        expect(updatedTotp.lastFailedAttempt).toBeNull();
      });

      it('최대 검증 실패 가능횟수를 초과한 경우, 에러가 발생함', async () => {
        const invalidCode = 'AAAAAAAA';

        for (let i = 0; i < 5; i++) {
          await expect(
            service.verifyBackupCode(email, invalidCode),
          ).rejects.toThrowError(TotpException);
        }

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(5);

        try {
          await service.verifyBackupCode(email, invalidCode);
        } catch (error) {
          expect(error).toBeInstanceOf(TotpException);
          expect(error.getCode()).toBe(TotpErrorCode.MAX_ATTEMPTS_EXCEEDED);
          expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        }
      });

      it('마지막 실패 시도로부터 15분이 지난 후에 다시 실패 시도를 한 경우, 실패 횟수가 1이 됨', async () => {
        const invalidCode = '12345678';

        await expect(
          service.verifyBackupCode(email, invalidCode),
        ).rejects.toThrowError(TotpException); // 마지막 실패 시도

        const totp = await totpRepo.findOneBy({ adminEmail: email });
        expect(totp.failedAttempts).toBe(1);

        // 위의 실패로 인해 세팅되었던 실패 시간을 15분 전으로 직접 되돌림
        await totpRepo.update(
          { adminEmail: email },
          {
            lastFailedAttempt: () =>
              "CURRENT_TIMESTAMP - interval '15 minutes 1 second'",
          },
        );

        await expect(
          service.verifyBackupCode(email, invalidCode),
        ).rejects.toThrowError(TotpException);

        const updatedTotp = await totpRepo.findOneBy({ adminEmail: email });
        expect(updatedTotp.failedAttempts).toBe(1);
      });
    });
  });

  describe('verifyRefreshToken()', () => {
    it('유효한 리프레시 토큰인 경우, 검증에 성공함', async () => {
      const refreshToken = 'mock.jwt.refresh.token';
      const payload = {
        email,
        isAdmin: true,
        type: TokenType.REFRESH,
      };

      vi.mocked(jwtService.verifyAsync).mockResolvedValue(payload);

      const result = await service.verifyRefreshToken(refreshToken);
      expect(result).toEqual({
        email,
        isAdmin: true,
      });
    });

    it('만료된 리프레시 토큰인 경우, 에러가 발생함', async () => {
      const expiredRefreshToken = 'expired.jwt.refresh.token';

      vi.mocked(jwtService.verifyAsync).mockImplementation(() => {
        throw new TokenExpiredError('Token expired', new Date());
      });

      try {
        await service.verifyRefreshToken(expiredRefreshToken);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.EXPIRED);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('유효하지 않은 리프레시 토큰인 경우, 에러가 발생함', async () => {
      const invalidRefreshToken = 'invalid.jwt.refresh.token';

      vi.mocked(jwtService.verifyAsync).mockImplementation(() => {
        throw new Error();
      });

      try {
        await service.verifyRefreshToken(invalidRefreshToken);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_TOKEN);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('리프레시 토큰이 아닌 토큰인 경우, 에러가 발생함', async () => {
      const accessToken = 'mock.jwt.access.token';
      const payload = {
        email,
        isAdmin: true,
        type: TokenType.ACCESS,
      };

      vi.mocked(jwtService.verifyAsync).mockResolvedValue(payload);

      try {
        await service.verifyRefreshToken(accessToken);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenException);
        expect(error.getCode()).toBe(TokenErrorCode.INVALID_TYPE);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('등록되지 않은 이메일인 경우, 에러가 발생함', async () => {
      const unknownEmail = 'unknown@example.com';
      const refreshToken = 'mock.jwt.refresh.token';

      vi.mocked(jwtService.verifyAsync).mockResolvedValue({
        email: unknownEmail,
        isAdmin: true,
        type: TokenType.REFRESH,
      });

      try {
        await service.verifyRefreshToken(refreshToken);
      } catch (error) {
        expect(error).toBeInstanceOf(GithubAuthException);
        expect(error.getCode()).toBe(GithubAuthErrorCode.NOT_ADMIN);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
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
          expiresIn: service.TOKEN_EXPIRY[TokenType.TEMPORARY],
          secret: configService.get('auth.jwtSecret'),
        },
      );
      expect(result).toBe(token);
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
          expiresIn: service.TOKEN_EXPIRY[TokenType.ACCESS],
          secret: configService.get('auth.jwtSecret'),
        },
      );
      expect(result).toBe(token);
    });
  });

  describe('createRefreshToken()', () => {
    it('리프레시 토큰을 생성함', async () => {
      const token = 'mock.jwt.token';
      const user = {
        email,
        isAdmin: true,
      };

      vi.mocked(jwtService.sign).mockResolvedValue(token);

      const result = await service.createRefreshToken(user);

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          email: user.email,
          isAdmin: user.isAdmin,
          type: TokenType.REFRESH,
        },
        {
          expiresIn: service.TOKEN_EXPIRY[TokenType.REFRESH],
          secret: configService.get('auth.jwtSecret'),
        },
      );
      expect(result).toBe(token);
    });
  });
});
