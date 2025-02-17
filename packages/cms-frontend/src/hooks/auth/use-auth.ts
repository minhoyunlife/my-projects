import getConfig from "next/config";
import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { AuthErrorCode } from "@/src/constants/auth/error-codes";
import { authApi } from "@/src/lib/api/client";
import { isApiError } from "@/src/lib/api/types";
import { getUserFromCookie } from "@/src/lib/utils/cookie";
import { handleAuthError } from "@/src/lib/utils/errors/auth";
import { ROUTES } from "@/src/routes";
import { useAuthStore } from "@/src/store/auth";

export function useAuth() {
  const router = useRouter();
  const {
    setSetupToken,
    clearSetupToken,
    setTempToken,
    clearTempToken,
    setAccessToken,
    clearAccessToken,
    setBackupCodes,
    setUser,
    clearUser,
  } = useAuthStore();

  const loginByGithub = () => {
    const { publicRuntimeConfig } = getConfig();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || publicRuntimeConfig.apiUrl;
    if (!baseUrl) {
      throw new Error("base url is not defined");
    }
    router.replace(`${baseUrl}/auth/github`);
  };

  const setup2FAMutation = useMutation({
    mutationFn: () => authApi.setup2FA(),
    onSuccess: (response) => {
      setSetupToken(response.data.setupToken);
      return response.data;
    },
    onError: (error) => {
      handleAuthError(error, router, {
        path: ROUTES.LOGIN,
        params: { error: "setup_failed" },
      });
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: async ({
      token,
      code,
    }: {
      token: string | null;
      code: string;
      mode: string | null;
    }) => {
      if (token) {
        setTempToken(token);
      }

      const { setupToken } = useAuthStore.getState();

      return authApi.verify2FA({
        code,
        ...(setupToken && { setupToken }),
      });
    },
    onSuccess: (response) => {
      setAccessToken(response.data.accessToken);
      clearTempToken();
      clearSetupToken();

      const user = getUserFromCookie();
      if (!user) {
        router.replace(ROUTES.LOGIN);
        return;
      }
      setUser(user);

      if (response.data.backupCodes) {
        setBackupCodes(response.data.backupCodes);
        router.replace(ROUTES.BACKUP_SHOW);
      } else {
        router.replace(ROUTES.DASHBOARD);
      }
    },
    onError: (error, variables) => {
      if (!isApiError(error) || !error.response?.data?.code) {
        handleAuthError(error, router, {
          path: ROUTES.LOGIN,
          params: { error: "unknown" },
        });
        return;
      }

      const errorCode = error.response.data.code;

      const defaultRoute =
        errorCode === AuthErrorCode.TOTP_VERIFICATION_FAILED ||
        errorCode === AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED
          ? {
              path: "",
              params: {
                token: useAuthStore.getState().tempToken,
                mode: variables.mode,
                error: "totp_verification_failed",
              },
            } // 파라미터만 넘겨주고 실제 라우팅 경로 해석은 handleAuthError 에서 처리
          : {
              path: "",
              params: { error: errorCode.toLowerCase() },
            }; // 파라미터만 넘겨주고 실제 라우팅 경로 해석은 handleAuthError 에서 처리

      handleAuthError(error, router, defaultRoute);
    },
  });

  const verifyBackupCodeMutation = useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      return authApi.verifyBackupCode({
        code,
      });
    },
    onSuccess: (response) => {
      setAccessToken(response.data.accessToken);
      clearTempToken();

      router.replace(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      if (!isApiError(error) || !error.response?.data?.code) {
        handleAuthError(error, router, {
          path: ROUTES.LOGIN,
          params: { error: "unknown" },
        });
        return;
      }

      const errorCode = error.response.data.code;
      const defaultRoute =
        errorCode === AuthErrorCode.TOTP_VERIFICATION_FAILED ||
        errorCode === AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED
          ? {
              path: "",
              params: {
                token: useAuthStore.getState().tempToken,
                error: "totp_verification_failed",
              },
            } // 파라미터만 넘겨주고 실제 라우팅 경로 해석은 handleAuthError 에서 처리
          : {
              path: "",
              params: { error: errorCode.toLowerCase() },
            }; // 파라미터만 넘겨주고 실제 라우팅 경로 해석은 handleAuthError 에서 처리

      handleAuthError(error, router, defaultRoute);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAccessToken();
      clearUser();

      router.replace(ROUTES.LOGIN);
    }, // 성공/실패 상관없이 무조건 로그인 페이지로
  });

  return {
    loginByGithub,
    setup2FA: () => setup2FAMutation.mutateAsync(),
    isSettingUp2FA: setup2FAMutation.isPending,
    verify2FA: (token: string | null, code: string, mode: string | null) =>
      verify2FAMutation.mutateAsync({ token, code, mode }),
    isVerifying2FA: verify2FAMutation.isPending,
    verifyBackupCode: (code: string) =>
      verifyBackupCodeMutation.mutateAsync({ code }),
    isVerifyingBackup: verifyBackupCodeMutation.isPending,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
