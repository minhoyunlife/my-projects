import { IsOptional, IsString, Length, Matches } from 'class-validator';

/**
 * TOTP 검증 리퀘스트 DTO
 */
export class VerifyTotpRequestDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/)
  code: string;

  @IsOptional() // 첫 인증때만 필요
  @IsString()
  setupToken?: string;
}

/**
 * 백업 코드 검증 리퀘스트 DTO
 */
export class VerifyBackupCodeRequestDto {
  @IsString()
  @Length(8, 8)
  @Matches(/^[A-Z0-9]+$/)
  code: string;
}
