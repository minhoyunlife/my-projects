import { randomBytes } from 'crypto';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { authenticator } from 'otplib';
import { Repository } from 'typeorm';

import { TokenType } from '@/src/common/enums/token-type.enum';
import { NotAdminException } from '@/src/common/exceptions/auth/admin.exception';
import {
  TotpAlreadySetupException,
  TotpMaxAttemptsExceededException,
  TotpNotSetupException,
  TotpSetupFailedException,
  TotpVerificationFailedException,
} from '@/src/common/exceptions/auth/totp.exception';
import { decrypt, encrypt } from '@/src/common/utils/encryption.util';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Totp } from '@/src/modules/auth/entities/totp.entity';
import { Administrator as AdminUser } from '@/src/modules/auth/interfaces/Administrator.interface';
import { GithubProfile } from '@/src/modules/auth/interfaces/github-profile.interface';

export class AuthService {
  private readonly BACKUP_CODES_COUNT = 8;
  private readonly TOTP_ISSUER = 'My Projects Admin'; // TOTP 앱에 표시될 서비스명
  private readonly TOTP_RESET_INTERVAL = 15 * 60 * 1000; // TOTP 인증 시도 실패의 초기화 간격(마지막 실패 후 이 시간이 지나면 리셋)
  private readonly MAX_TOTP_ATTEMPTS = 5;
  private readonly TOKEN_EXPIRY = {
    [TokenType.TEMPORARY]: '5m',
    [TokenType.ACCESS]: '1d',
  } as const;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,

    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
    @InjectRepository(Totp)
    private readonly totpRepository: Repository<Totp>,
  ) {
    authenticator.options = {
      window: 1, // TOTP 앱에서 표시되는 코드의 전후 30초의 코드까지 유효
    };
  }

  /**
   * 관리자 계정인지 유효성 검사
   */
  async validateAdminUser(profile: GithubProfile): Promise<AdminUser> {
    const profileEmail = profile.emails[0].value;

    const administrator = await this.administratorRepository.findOneBy({
      email: profileEmail,
    });
    if (!administrator) {
      throw new NotAdminException();
    }

    return {
      email: administrator.email,
      isAdmin: true,
    };
  }

  /**
   * TOTP 인증 전 임시 토큰 생성
   */
  async createTempToken(user: AdminUser): Promise<string> {
    return this.jwtService.sign(
      {
        email: user.email,
        isAdmin: user.isAdmin,
        type: TokenType.TEMPORARY,
      },
      {
        expiresIn: this.TOKEN_EXPIRY[TokenType.TEMPORARY],
      },
    );
  }

  /**
   * TOTP 초기 설정
   */
  async setupTotp(email: string): Promise<{
    qrCodeUrl: string;
    manualEntryKey: string;
    setupToken: string;
  }> {
    const totp = await this.totpRepository.findOneBy({ adminEmail: email });
    if (totp) {
      throw new TotpAlreadySetupException();
    }

    try {
      const secret = authenticator.generateSecret();
      const manualEntryKey = secret.replace(/(.{4})/g, '$1 ').trim();

      const encryptedSecret = encrypt(
        secret,
        this.configService.get('database.encryption_key'),
      );

      const backupCodes = [...Array(this.BACKUP_CODES_COUNT)].map(() =>
        randomBytes(4).toString('hex').toUpperCase(),
      );

      const encryptedBackupCodes = backupCodes.map((code) =>
        encrypt(code, this.configService.get('database.encryption_key')),
      );

      await this.totpRepository.save({
        adminEmail: email,
        encryptedSecret: encryptedSecret,
        backupCodes: encryptedBackupCodes,
      });

      const setupToken = await this.createTempToken({
        email,
        isAdmin: true,
      });

      return {
        qrCodeUrl: authenticator.keyuri(email, this.TOTP_ISSUER, secret),
        manualEntryKey,
        setupToken,
      };
    } catch (error) {
      throw new TotpSetupFailedException();
    }
  }

  /**
   * TOTP 코드에 의한 인증
   */
  async verifyTotpCode(email: string, code: string): Promise<boolean> {
    const totp = await this.totpRepository.findOneBy({ adminEmail: email });
    if (!totp) {
      throw new TotpNotSetupException();
    }

    try {
      const decryptedSecret = decrypt(
        totp.encryptedSecret,
        this.configService.get('database.encryption_key'),
      );

      const isValid = authenticator.verify({
        token: code,
        secret: decryptedSecret,
      });

      if (!isValid) {
        await this.recordFailedAttempt(totp);
        return false;
      }

      await this.resetFailedAttempt(totp);
      return true;
    } catch (error) {
      if (error instanceof TotpMaxAttemptsExceededException) {
        throw error;
      }
      throw new TotpVerificationFailedException();
    }
  }

  /**
   * 백업 코드에 의한 인증
   */
  async verifyBackupCode(email: string, code: string): Promise<boolean> {
    const totp = await this.totpRepository.findOneBy({ adminEmail: email });
    if (!totp) {
      throw new TotpNotSetupException();
    }

    try {
      return totp.backupCodes.some((encryptedCode) => {
        const decryptedCode = decrypt(
          encryptedCode,
          this.configService.get('database.encryption_key'),
        );
        return decryptedCode === code.toUpperCase();
      });
    } catch (error) {
      throw new TotpVerificationFailedException();
    }
  }

  /**
   * TOTP 인증 성공 후 실제 액세스 토큰을 발급
   */
  async createAccessToken(user: AdminUser): Promise<string> {
    return this.jwtService.sign(
      {
        email: user.email,
        isAdmin: user.isAdmin,
        type: TokenType.ACCESS,
      },
      {
        expiresIn: this.TOKEN_EXPIRY[TokenType.ACCESS],
      },
    );
  }

  /**
   * TOTP 인증 실패 횟수를 기록
   * - 마지막 시도로부터 15분이 지나면, 실패 횟수는 1로 초기화
   * - 총 실패 횟수가 다섯번이 넘으면 에러를 발생
   */
  private async recordFailedAttempt(totp: Totp): Promise<void> {
    const now = new Date();

    if (
      totp.lastFailedAttempt &&
      now.getTime() - totp.lastFailedAttempt.getTime() >
        this.TOTP_RESET_INTERVAL
    ) {
      totp.failedAttempts = 1;
    } else {
      totp.failedAttempts += 1;

      if (totp.failedAttempts > this.MAX_TOTP_ATTEMPTS) {
        throw new TotpMaxAttemptsExceededException();
      }
    }

    totp.lastFailedAttempt = now;
    await this.totpRepository.save(totp);
  }

  /**
   * TOTP 인증 실패 횟수를 초기화
   */
  private async resetFailedAttempt(totp: Totp): Promise<void> {
    totp.failedAttempts = 0;
    totp.lastFailedAttempt = null;

    await this.totpRepository.save(totp);
  }
}
