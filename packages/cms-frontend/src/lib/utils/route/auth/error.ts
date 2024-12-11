import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { AuthErrorCode } from "@/src/constants/errors/auth/code";
import { ROUTES } from "@/src/constants/routes";
import { isApiError } from "@/src/lib/api/types";
import { createUrl } from "@/src/lib/utils/route/base";

export type AuthRouteParams = {
  error?: string;
  token?: string;
};

export type AuthRoute = {
  path: string;
  params: AuthRouteParams;
};

export const ERROR_ROUTES_TO_LOGIN: Partial<Record<AuthErrorCode, AuthRoute>> =
  {
    [AuthErrorCode.TOKEN_NOT_PROVIDED]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.TOKEN_NOT_PROVIDED.toLowerCase(),
      },
    },
    [AuthErrorCode.INVALID_TOKEN]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.INVALID_TOKEN.toLowerCase(),
      },
    },
    [AuthErrorCode.TOKEN_EXPIRED]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.TOKEN_EXPIRED.toLowerCase(),
      },
    },
    [AuthErrorCode.INVALID_TOKEN_FORMAT]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.INVALID_TOKEN_FORMAT.toLowerCase(),
      },
    },
    [AuthErrorCode.INVALID_TOKEN_TYPE]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.INVALID_TOKEN_TYPE.toLowerCase(),
      },
    },
    [AuthErrorCode.TOTP_NOT_SETUP]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.TOTP_NOT_SETUP.toLowerCase(),
      },
    },
    [AuthErrorCode.TOTP_SETUP_FAILED]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.TOTP_SETUP_FAILED.toLowerCase(),
      },
    },
    [AuthErrorCode.NOT_ADMIN]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.NOT_ADMIN.toLowerCase(),
      },
    },
    [AuthErrorCode.UNKNOWN]: {
      path: ROUTES.LOGIN,
      params: {
        error: AuthErrorCode.UNKNOWN.toLowerCase(),
      },
    },
  };

export const ERROR_ROUTES_TO_2FA: Partial<Record<AuthErrorCode, AuthRoute>> = {
  [AuthErrorCode.TOTP_VERIFICATION_FAILED]: {
    path: ROUTES.TWO_FACTOR_VERIFICATION,
    params: {
      error: AuthErrorCode.TOTP_VERIFICATION_FAILED.toLowerCase(),
    },
  },
  [AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED]: {
    path: ROUTES.TWO_FACTOR_VERIFICATION,
    params: {
      error: AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED.toLowerCase(),
    },
  },
  [AuthErrorCode.TOTP_CODE_MALFORMED]: {
    path: ROUTES.TWO_FACTOR_VERIFICATION,
    params: {
      error: AuthErrorCode.TOTP_CODE_MALFORMED.toLowerCase(),
    },
  },
};

export const ERROR_ROUTES_TO_BACKUP: Partial<Record<AuthErrorCode, AuthRoute>> =
  {
    [AuthErrorCode.TOTP_VERIFICATION_FAILED]: {
      path: ROUTES.BACKUP_VERIFICATION,
      params: {
        error: AuthErrorCode.TOTP_VERIFICATION_FAILED.toLowerCase(),
      },
    },
    [AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED]: {
      path: ROUTES.BACKUP_VERIFICATION,
      params: {
        error: AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED.toLowerCase(),
      },
    },
  };

/**
 * 인증 관련 API 에러 코드에 대응하는 라우트 정보를 반환
 */
export const findAuthErrorRoute = (errorCode: string): AuthRoute => {
  const loginRoute = ERROR_ROUTES_TO_LOGIN[errorCode as AuthErrorCode];
  if (loginRoute) return loginRoute;

  // 백업코드 인증 페이지에서 발생한 에러는 백업코드 인증 페이지로 리다이렉트
  if (window.location.pathname.includes("backup")) {
    const backupRoute = ERROR_ROUTES_TO_BACKUP[errorCode as AuthErrorCode];
    if (backupRoute) return backupRoute;
  }

  const tfaRoute = ERROR_ROUTES_TO_2FA[errorCode as AuthErrorCode];
  if (tfaRoute) return tfaRoute;

  return ERROR_ROUTES_TO_LOGIN.UNKNOWN!;
};

/**
 * 인증 관련 API 에러를 처리하고 적절한 페이지로 리다이렉트
 */
export const handleAuthError = (
  error: unknown,
  router: AppRouterInstance,
  defaultRoute: AuthRoute,
) => {
  if (!isApiError(error) || !error.response?.data?.code) {
    router.replace(createUrl(defaultRoute));
    return;
  }

  const errorRoute = findAuthErrorRoute(error.response.data.code);
  const mergedRoute = {
    ...errorRoute,
    params: { ...defaultRoute.params, ...errorRoute.params },
  };
  router.replace(createUrl(mergedRoute));
};
