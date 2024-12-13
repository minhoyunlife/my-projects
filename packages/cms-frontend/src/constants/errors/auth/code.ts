export enum AuthErrorCode {
  // GitHub 관련
  NOT_ADMIN = "NOT_ADMIN",
  GITHUB_AUTH_FAILED = "GITHUB_AUTH_FAILED",

  // 각종 토큰 관련
  TOKEN_NOT_PROVIDED = "TOKEN_NOT_PROVIDED",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_TOKEN_FORMAT = "INVALID_TOKEN_FORMAT",
  INVALID_TOKEN_TYPE = "INVALID_TOKEN_TYPE",

  // TOTP 관련
  TOTP_SETUP_FAILED = "TOTP_SETUP_FAILED",
  TOTP_CODE_MALFORMED = "TOTP_CODE_MALFORMED",
  TOTP_VERIFICATION_FAILED = "TOTP_VERIFICATION_FAILED",
  TOTP_NOT_SETUP = "TOTP_NOT_SETUP",
  TOTP_MAX_ATTEMPTS_EXCEEDED = "TOTP_MAX_ATTEMPTS_EXCEEDED",

  // 기타 불명의 에러
  UNKNOWN = "UNKNOWN",
}

/**
 * 주어진 코드가 AuthErrorCode 열거형의 값인지 체크
 */
export const isAuthErrorCode = (code: string): code is AuthErrorCode => {
  return Object.values(AuthErrorCode).includes(code as AuthErrorCode);
};
