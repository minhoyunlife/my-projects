import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import {
  authApi,
  clearAccessToken,
  setAccessToken,
} from "@/src/lib/api/client";
import { isApiError } from "@/src/lib/api/types";

type UseAuth = {
  isLoading: boolean;
  is2FARequired: boolean;
  handleGithubLogin: () => void;
  handleGithubCallback: () => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
};

const handleAuthError = (
  router: ReturnType<typeof useRouter>,
  redirectTo: string,
) => {
  router.push(redirectTo);
};

const handleGitHubCallbackError = async (
  error: unknown,
  router: ReturnType<typeof useRouter>,
) => {
  if (!isApiError(error)) {
    handleAuthError(router, "/login?error=github_auth_failed");
    return;
  }

  // 콜백 처리에서는 403 밖에 없음
  handleAuthError(router, "/login?error=not_admin");
};

const handle2FAError = async (
  error: unknown,
  router: ReturnType<typeof useRouter>,
) => {
  if (!isApiError(error)) {
    handleAuthError(router, "/2fa?error=unknown");
    return;
  }

  let route: string;
  switch (error.response?.status) {
    case 400:
      route = "/2fa?error=invalid_format";
      break;
    case 401:
      route = "/login?error=session_expired";
      break;
    case 429:
      route = "/2fa?error=too_many_attempts";
      break;
    default:
      route = "/2fa?error=invalid_code";
  }

  handleAuthError(router, route);
};

/**
 * 인증 관련 상태와 메소드들을 제공하는 훅
 * @returns {Object} 인증 관련 상태와 활용 가능한 메소드들
 * - isLoading: 인증 작업 진행 중 여부
 * - is2FARequired: 2단계 인증 필요 여부
 * - handleGithubLogin: GitHub 로그인 메소드
 * - handleGitHubCallback: GitHub OAuth 콜백 처리 메소드
 * - verify2FA: 2단계 인증 코드 검증 메소드
 * - logout: 로그아웃 처리 메소드
 */
export function useAuth(): UseAuth {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);

  const handleGithubLogin = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${baseUrl}/auth/github`;
  }, []);

  const handleGithubCallback = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await authApi.handleGithubOAuthCallback();
      if (response.data.tempToken) {
        setAccessToken(response.data.tempToken);
        setIs2FARequired(true);

        router.push("/2fa");
      }
    } catch (error) {
      await handleGitHubCallbackError(error, router);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const verify2FA = useCallback(
    async (code: string) => {
      setIsLoading(true);

      try {
        const response = await authApi.verify2FA({ code });

        setAccessToken(response.data.accessToken);
        setIs2FARequired(false);

        router.push("/dashboard");
      } catch (error) {
        await handle2FAError(error, router);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearAccessToken();
      router.push("/login");
    }
  }, [router]);

  return {
    isLoading,
    is2FARequired,
    handleGithubLogin,
    handleGithubCallback,
    verify2FA,
    logout,
  };
}
