import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { AuthErrorCode } from "@/src/constants/auth/error-codes";
import {
  findAuthErrorRoute,
  handleAuthError,
} from "@/src/lib/utils/routes/auth/error";
import { createUrl } from "@/src/lib/utils/routes/base";
import { ROUTES } from "@/src/routes";

describe("error", () => {
  describe("findAuthErrorRoute", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("로그인 루트에 정의된 에러 코드의 경우, 에러 코드에 부합하는 파라미터와 로그인 패스를 반환함", () => {
      const result = findAuthErrorRoute(AuthErrorCode.TOKEN_NOT_PROVIDED);

      expect(result.path).toBe(ROUTES.LOGIN);
      expect(result.params.error).toBe(
        AuthErrorCode.TOKEN_NOT_PROVIDED.toLowerCase(),
      );
    });

    it("2FA 검증 루트에 정의된 에러 코드의 경우, 에러 코드에 부합하는 파라미터와 2FA 검증 패스를 반환함", () => {
      const result = findAuthErrorRoute(AuthErrorCode.TOTP_VERIFICATION_FAILED);

      expect(result.path).toBe(ROUTES.TWO_FACTOR_VERIFICATION);
      expect(result.params.error).toBe(
        AuthErrorCode.TOTP_VERIFICATION_FAILED.toLowerCase(),
      );
    });

    it("백업 코드 검증 루트에서 발생한 에러 코드의 경우, 에러 코드에 부합하는 파라미터와 백업 코드 검증 패스를 반환함", () => {
      vi.stubGlobal("window", {
        location: { pathname: "/backup" },
      });

      const result = findAuthErrorRoute(
        AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED,
      );

      expect(result.path).toBe(ROUTES.BACKUP_VERIFICATION);
      expect(result.params.error).toBe(
        AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED.toLowerCase(),
      );
    });

    it("출처를 알 수 없는 에러 코드의 경우, unknown 파라미터와 로그인 패스를 반환함", () => {
      const result = findAuthErrorRoute(
        "CODE_THAT_IS_NOT_DEFINED" as AuthErrorCode,
      );

      expect(result.path).toBe(ROUTES.LOGIN);
      expect(result.params.error).toBe(AuthErrorCode.UNKNOWN.toLowerCase());
    });
  });

  describe("handleAuthError", () => {
    const router = {
      replace: vi.fn(),
    } as Partial<AppRouterInstance> as AppRouterInstance;

    const defaultRoute = {
      path: ROUTES.TWO_FACTOR_VERIFICATION,
      params: {
        token: "temp-token",
        mode: "setup",
      },
    };

    it("API 로 기인한 에러가 아닌 경우, 지정한 디폴트 루트로 리다이렉트함", () => {
      const error = new Error("Error which is not kind of API error");

      handleAuthError(error, router, defaultRoute);

      expect(router.replace).toHaveBeenCalledWith(createUrl(defaultRoute));
    });

    it("API 로 기인한 에러이나 에러 코드가 존재하지 않는 경우, 지정한 디폴트 루트로 리다이렉트함", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {}, // code 없음
        },
      };

      handleAuthError(error, router, defaultRoute);

      expect(router.replace).toHaveBeenCalledWith(createUrl(defaultRoute));
    });

    it("API 로 기인한 에러이며 에러 코드가 존재하는 경우, 병합한 파라미터와 함께 에러 코드에 부합하는 패스로 리다이렉트함", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            code: AuthErrorCode.TOTP_VERIFICATION_FAILED,
          },
        },
      };

      handleAuthError(error, router, defaultRoute);

      expect(router.replace).toHaveBeenCalledWith(
        expect.stringContaining(ROUTES.TWO_FACTOR_VERIFICATION),
      );
      expect(router.replace).toHaveBeenCalledWith(
        expect.stringContaining("error=totp_verification_failed"),
      );
      expect(router.replace).toHaveBeenCalledWith(
        expect.stringContaining("token=temp-token"),
      );
      expect(router.replace).toHaveBeenCalledWith(
        expect.stringContaining("mode=setup"),
      );
    });
  });
});
