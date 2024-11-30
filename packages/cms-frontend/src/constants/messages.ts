export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  not_admin: "관리자 권한이 없는 계정입니다.",
  github_auth_failed: "GitHub 로그인에 실패했습니다.",
  session_expired: "인증 세션이 만료되었습니다. 다시 시도해주세요.",
} as const;

export const TWO_FACTOR_ERROR_MESSAGES: Record<string, string> = {
  invalid_format: "올바르지 않은 인증 코드 형식입니다.",
  invalid_code: "잘못된 인증 코드입니다.",
  too_many_attempts: "너무 많은 시도를 하셨습니다. 15분 후 다시 시도해주세요.",
} as const;
