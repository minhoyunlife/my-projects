import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { AuthErrorCode } from "@/src/constants/errors/auth/code";
import { authApi } from "@/src/lib/api/client";
import { isApiError } from "@/src/lib/api/types";
import { handleAuthError } from "@/src/lib/utils/route/auth/error";
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
  } = useAuthStore();

  const loginByGithub = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error("base url is not defined");
    }
    window.location.href = `${baseUrl}/auth/github`;
  };

  const setup2FAMutation = useMutation({
    mutationFn: () => authApi.setup2FA(),
    onSuccess: (response) => {
      setSetupToken(response.data.setupToken);
      return response.data;
    },
    onError: (error) => {
      handleAuthError(error, router, {
        path: "/login",
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

      if (response.data.backupCodes) {
        setBackupCodes(response.data.backupCodes);
        setTimeout(() => {
          router.push("/backup/show");
        }, 0); // 백업 코드 화면이 렌더링되는 시점에 대시보드로 리다이렉트되는 문제로 별도의 tick 에서 실행하여 방지
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      if (!isApiError(error) || !error.response?.data?.code) {
        handleAuthError(error, router, {
          path: "/login",
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
                mode: new URLSearchParams(window.location.search).get("mode"),
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

      router.push("/dashboard");
    },
    onError: (error) => {
      if (!isApiError(error) || !error.response?.data?.code) {
        handleAuthError(error, router, {
          path: "/login",
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
      router.push("/login");
    }, // 성공/실패 상관없이 무조건 로그인 페이지로
  });

  return {
    loginByGithub,
    setup2FA: () => setup2FAMutation.mutateAsync(),
    isSettingUp2FA: setup2FAMutation.isPending,
    verify2FA: (token: string | null, code: string) =>
      verify2FAMutation.mutate({ token, code }),
    isVerifying2FA: verify2FAMutation.isPending,
    verifyBackupCode: (code: string) =>
      verifyBackupCodeMutation.mutate({ code }),
    isVerifyingBackup: verifyBackupCodeMutation.isPending,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
