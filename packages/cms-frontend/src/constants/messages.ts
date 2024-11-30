export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  not_admin: "관리자 권한이 없는 계정입니다.",
  github_auth_failed: "GitHub 로그인에 실패했습니다.",
  session_expired: "인증 세션이 만료되었습니다. 다시 시도해주세요.",
} as const;
