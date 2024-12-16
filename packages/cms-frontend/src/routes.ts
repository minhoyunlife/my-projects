// NOTE: 페이지를 정의할 때마다 여기에 추가할 것.

// 앱 전체의 루트 정의
export const ROUTES = {
  LOGIN: "/login",
  TWO_FACTOR_SETUP: "/2fa-setup",
  TWO_FACTOR_VERIFICATION: "/2fa",
  BACKUP_VERIFICATION: "/backup/verify",
  BACKUP_SHOW: "/backup/show",
  DASHBOARD: "/",
  FANARTS: "/fanarts",
  GENRES: "/genres",
} as const;

// 미인증시에만 접근 가능한 경로
export const UNAUTHENTICATED_PATHS = [
  ROUTES.LOGIN,
  ROUTES.TWO_FACTOR_SETUP,
  ROUTES.TWO_FACTOR_VERIFICATION,
  ROUTES.BACKUP_VERIFICATION,
];

// 인증 후에만 접근 가능한 경로
export const AUTHENTICATED_PATHS = [
  ROUTES.DASHBOARD,
  ROUTES.FANARTS,
  ROUTES.GENRES,
];
