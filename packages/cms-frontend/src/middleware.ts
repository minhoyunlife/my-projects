import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AUTHENTICATED_PATHS,
  ROUTES,
  UNAUTHENTICATED_PATHS,
} from "@/src/constants/routes";

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
  if (
    UNAUTHENTICATED_PATHS.some((path) => pathname.startsWith(path)) &&
    hasRefreshToken
  ) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  // 미인증 사용자가 인증 필요 페이지 접근 시도
  if (
    AUTHENTICATED_PATHS.some((path) => pathname.startsWith(path)) &&
    !hasRefreshToken
  ) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 패턴 정의
export const config = {
  matcher: [...AUTHENTICATED_PATHS, ...UNAUTHENTICATED_PATHS],
};
