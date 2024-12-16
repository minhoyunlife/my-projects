import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AUTHENTICATED_PATHS,
  ROUTES,
  UNAUTHENTICATED_PATHS,
} from "@/src/routes";

function hasMatchingPath(pathname: string, paths: readonly string[]) {
  return paths.some((path) => {
    if (path === ROUTES.DASHBOARD) {
      return pathname === ROUTES.DASHBOARD;
    }
    return pathname === path || pathname.startsWith(`${path}/`); // 특정 경로 및 그 하위 경로까지 포함
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasRefreshToken = request.cookies.has("refreshToken");

  // 백업 코드 표시 페이지 접근 시도
  if (pathname.startsWith(ROUTES.BACKUP_SHOW)) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    const canShowBackup = request.cookies.has("show");
    if (!canShowBackup) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }

    const response = NextResponse.next();
    response.cookies.delete("show");
    return response;
  }

  // 인증된 사용자가 미인증 전용 페이지 접근 시도
  if (hasMatchingPath(pathname, UNAUTHENTICATED_PATHS) && hasRefreshToken) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  // 미인증 사용자가 인증 필요 페이지 접근 시도
  if (hasMatchingPath(pathname, AUTHENTICATED_PATHS) && !hasRefreshToken) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 패턴 정의
// 빌드 시점에서 config 는 export 할 때 바로 초기화가 되어야 하므로, 명시적으로 정의해줘야 함.
export const config = {
  matcher: [
    "/login",
    "/2fa-setup",
    "/2fa",
    "/backup/verify",
    "/",
    "/fanarts",
    "/genres",
  ],
};
