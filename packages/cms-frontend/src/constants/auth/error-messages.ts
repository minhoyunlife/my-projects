import { AuthErrorCode } from "./error-codes";

type ErrorMessages = {
  [key in AuthErrorCode]: string;
};

export const AUTH_ERROR_MESSAGES: ErrorMessages = {
  [AuthErrorCode.NOT_ADMIN]: "관리자 권한이 없는 계정입니다.",
  [AuthErrorCode.GITHUB_AUTH_FAILED]: "GitHub 로그인에 실패했습니다.",
  [AuthErrorCode.INVALID_TOKEN]: "인증 토큰이 올바르지 않습니다.",
  [AuthErrorCode.TOKEN_EXPIRED]:
    "인증 토큰이 만료되었습니다. 다시 로그인해주세요.",
  [AuthErrorCode.TOKEN_NOT_PROVIDED]: "인증 토큰이 제공되지 않았습니다.",
  [AuthErrorCode.INVALID_TOKEN_FORMAT]: "올바르지 않은 인증 토큰 형식입니다.",
  [AuthErrorCode.INVALID_TOKEN_TYPE]: "올바르지 않은 인증 토큰 타입입니다.",
  [AuthErrorCode.TOTP_SETUP_FAILED]: "2단계 인증 설정에 실패했습니다.",
  [AuthErrorCode.TOTP_NOT_SETUP]: "사전에 2단계 인증의 초기 설정이 필요합니다.",
  [AuthErrorCode.TOTP_CODE_MALFORMED]: "잘못된 형식의 인증 코드입니다.",
  [AuthErrorCode.TOTP_VERIFICATION_FAILED]: "코드 인증에 실패했습니다.",
  [AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED]:
    "너무 많은 시도가 이뤄졌습니다. 5분 후 다시 시도해주세요.",
  [AuthErrorCode.UNKNOWN]: "알 수 없는 오류가 발생했습니다.",
};

export const getErrorMessage = (code: string): string => {
  const errorCode = code.toUpperCase() as AuthErrorCode;
  return (
    AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES[AuthErrorCode.UNKNOWN]
  );
};
