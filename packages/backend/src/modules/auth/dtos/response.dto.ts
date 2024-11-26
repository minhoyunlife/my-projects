/**
 * TOTP 초기 설정 시의 리스폰스 DTO
 */
export class SetupTotpResponseDto {
  qrCodeUrl: string;
  manualEntryKey: string;
  setupToken: string;
}

export class Verify2faResponseDto {
  accessToken: string;
  expiresIn: number;
  backupCodes?: string[]; // 초기 설정 시에만 제공
}
