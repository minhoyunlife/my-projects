import { randomBytes } from 'crypto';

import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { authenticator } from 'otplib';
import { Repository } from 'typeorm';

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
import { decrypt, encrypt } from '@/src/common/utils/encryption.util';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Totp } from '@/src/modules/auth/entities/totp.entity';
import { AdminUser } from '@/src/modules/auth/interfaces/admin-user.interface';
import { GithubProfile } from '@/src/modules/auth/interfaces/github-profile.interface';
import { RefreshTokenPayload } from '@/src/modules/auth/interfaces/token.interface';

export class AuthService {
  private readonly BACKUP_CODES_COUNT = 8;
  private readonly TOTP_ISSUER = 'My Projects Admin'; // TOTP 앱에 표시될 서비스명
  private readonly TOTP_RESET_INTERVAL = 5 * 60 * 1000; // TOTP 인증 시도 실패의 초기화 간격(마지막 실패 후 이 시간이 지나면 리셋)
  private readonly MAX_TOTP_ATTEMPTS = 5; // TOTP 인증 시도 실패 횟수 최대치(백업 코드 인증 시도 실패도 이 횟수에 포함)

  // 토큰 만료 시간(초 단위)
  public readonly TOKEN_EXPIRY = {
    [TokenType.TEMPORARY]: 10 * 60, // 5분
    [TokenType.ACCESS]: 15 * 60, // 15분
    [TokenType.REFRESH]: 7 * 24 * 60 * 60, // 7일
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
      throw new GithubAuthException(
        GithubAuthErrorCode.NOT_ADMIN,
        'Profile is not admin',
      );
    }

    return {
      email: administrator.email,
      isAdmin: true,
      isTotpEnabled: administrator.isTotpEnabled,
    };
  }

  /**
   * TOTP 초기 설정
   */
  async setupTotp(email: string): Promise<{
    qrCodeUrl: string;
    manualEntryKey: string;
    setupToken: string;
  }> {
    try {
      const secret = authenticator.generateSecret();
      const manualEntryKey = secret.replace(/(.{4})/g, '$1 ').trim();

      const encryptedSecret = encrypt(
        secret,
        this.configService.get('database.encryptionKey'),
      );

      const backupCodes = [...Array(this.BACKUP_CODES_COUNT)].map(() =>
        randomBytes(4).toString('hex').toUpperCase(),
      );

      const encryptedBackupCodes = backupCodes.map((code) =>
        encrypt(code, this.configService.get('database.encryptionKey')),
      );

      await this.totpRepository.save({
        adminEmail: email,
        encryptedSecret: encryptedSecret,
        backupCodes: encryptedBackupCodes,
        administrator: await this.administratorRepository.findOneBy({
          email,
        }),
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
      throw new TotpException(TotpErrorCode.SETUP_FAILED, 'TOTP setup failed');
    }
  }

  /**
   * 저장된 백업 코드 목록을 조회
   */
  async getBackupCodes(email: string): Promise<string[]> {
    const totp = await this.totpRepository.findOneBy({ adminEmail: email });
    if (!totp) {
      throw new TotpException(TotpErrorCode.NOT_SETUP, 'TOTP does not exist');
    }

    return totp.backupCodes.map((code) =>
      decrypt(code, this.configService.get('database.encryptionKey')),
    );
  }

  /**
   * TOTP 코드에 의한 인증
   */
  async verifyTotpCode(email: string, code: string): Promise<void> {
    const totp = await this.totpRepository.findOne({
      where: { adminEmail: email },
      relations: {
        administrator: true,
      },
    });
    if (!totp) {
      throw new TotpException(TotpErrorCode.NOT_SETUP, 'TOTP does not exist');
    }

    const decryptedSecret = decrypt(
      totp.encryptedSecret,
      this.configService.get('database.encryptionKey'),
    );

    let isValid: boolean;
    try {
      isValid = authenticator.verify({
        token: code,
        secret: decryptedSecret,
      });
    } catch (error) {
      await this.recordFailedAttempt(totp);
      throw new TotpException(
        TotpErrorCode.CODE_MALFORMED,
        'Provided code is malformed',
      );
    }

    if (isValid) {
      totp.administrator.isTotpEnabled = true;
      await this.administratorRepository.save(totp.administrator);

      await this.resetFailedAttempt(totp);
    } else {
      await this.recordFailedAttempt(totp);
      throw new TotpException(
        TotpErrorCode.VERIFICATION_FAILED,
        'TOTP verification failed',
      );
    }
  }

  /**
   * 백업 코드에 의한 인증
   */
  async verifyBackupCode(email: string, code: string): Promise<void> {
    const totp = await this.totpRepository.findOneBy({ adminEmail: email });
    if (!totp) {
      throw new TotpException(TotpErrorCode.NOT_SETUP, 'TOTP does not exist');
    }

    const isVerified = totp.backupCodes.some((encryptedCode) => {
      try {
        const decryptedCode = decrypt(
          encryptedCode,
          this.configService.get('database.encryptionKey'),
        );
        return decryptedCode === code.toUpperCase();
      } catch {
        return false;
      }
    });

    if (!isVerified) {
      await this.recordFailedAttempt(totp);
      throw new TotpException(
        TotpErrorCode.VERIFICATION_FAILED,
        'TOTP verification failed',
      );
    }

    await this.resetFailedAttempt(totp);
  }

  /**
   * 리프레시 토큰 검증 후 사용자 정보 반환
   */
  async verifyRefreshToken(refreshToken: string): Promise<Partial<AdminUser>> {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('auth.jwtSecret'),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenException(TokenErrorCode.EXPIRED, 'Token expired');
      }
      throw new TokenException(TokenErrorCode.INVALID_TOKEN, 'Invalid token');
    }

    if (payload.type !== TokenType.REFRESH) {
      throw new TokenException(
        TokenErrorCode.INVALID_TYPE,
        'Invalid token type',
      );
    }

    const administrator = await this.administratorRepository.findOneBy({
      email: payload.email,
    });
    if (!administrator) {
      throw new GithubAuthException(
        GithubAuthErrorCode.NOT_ADMIN,
        'Email of payload is not admin',
      );
    }

    return {
      email: administrator.email,
      isAdmin: true,
    };
  }

  /**
   * TOTP 인증 전 임시 토큰 생성
   */
  async createTempToken(user: Partial<AdminUser>): Promise<string> {
    return this.jwtService.sign(
      {
        email: user.email,
        isAdmin: user.isAdmin,
        type: TokenType.TEMPORARY,
      },
      {
        secret: this.configService.get('auth.jwtSecret'),
        expiresIn: this.TOKEN_EXPIRY[TokenType.TEMPORARY],
      },
    );
  }

  /**
   * TOTP 인증 성공 후 실제 액세스 토큰을 발급
   */
  async createAccessToken(user: Partial<AdminUser>): Promise<string> {
    return this.jwtService.sign(
      {
        email: user.email,
        isAdmin: user.isAdmin,
        type: TokenType.ACCESS,
      },
      {
        secret: this.configService.get('auth.jwtSecret'),
        expiresIn: this.TOKEN_EXPIRY[TokenType.ACCESS],
      },
    );
  }

  /**
   * 리프레시 토큰 발급
   */
  async createRefreshToken(user: Partial<AdminUser>): Promise<string> {
    return this.jwtService.sign(
      {
        email: user.email,
        isAdmin: user.isAdmin,
        type: TokenType.REFRESH,
      },
      {
        secret: this.configService.get('auth.jwtSecret'),
        expiresIn: this.TOKEN_EXPIRY[TokenType.REFRESH],
      },
    );
  }

  /**
   * TOTP 인증 실패 횟수를 기록
   * - 마지막 시도로부터 15분이 지나면, 실패 횟수는 1로 초기화
   * - 총 실패 횟수가 다섯번이 넘으면 에러를 발생
   */
  private async recordFailedAttempt(totp: Totp): Promise<void> {
    const resetIntervalSeconds = this.TOTP_RESET_INTERVAL / 1000;

    const result = await this.totpRepository
      .createQueryBuilder()
      .update(Totp)
      .set({
        failedAttempts: () => `
          CASE 
            WHEN "lastFailedAttempt" IS NULL 
            THEN 1
            WHEN (CURRENT_TIMESTAMP - "lastFailedAttempt") > interval '${resetIntervalSeconds} seconds'
            THEN 1 
            ELSE "failedAttempts" + 1 
          END
        `,
        lastFailedAttempt: () => 'CURRENT_TIMESTAMP',
      })
      .where('adminEmail = :email', { email: totp.adminEmail })
      .returning(['failedAttempts'])
      .execute();

    // 최대 시도 횟수 체크
    const { failedAttempts } = result.raw[0];
    if (failedAttempts > this.MAX_TOTP_ATTEMPTS) {
      throw new TotpException(
        TotpErrorCode.MAX_ATTEMPTS_EXCEEDED,
        'TOTP max attempts exceeded',
      );
    }
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
