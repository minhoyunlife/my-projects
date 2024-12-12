import type { ReactNode } from "react";

import type { AxiosResponse } from "axios";

import QueryProvider from "@/src/components/providers/query-provider";
import { ROUTES } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/use-auth";
import { authApi } from "@/src/lib/api/client";
import { useAuthStore } from "@/src/store/auth";

const router = {
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/src/lib/api/client", () => ({
  authApi: {
    setup2FA: vi.fn(),
    verify2FA: vi.fn(),
    verifyBackupCode: vi.fn(),
    logout: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryProvider>{children}</QueryProvider>
);

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      tempToken: undefined,
      setupToken: undefined,
      accessToken: undefined,
      backupCodes: undefined,
    });
  });

  describe("loginByGithub", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("API URL 환경변수가 설정되어 있는 경우, GitHub OAuth 페이지로 이동함", () => {
      vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");

      const { result } = renderHook(() => useAuth(), { wrapper });

      result.current.loginByGithub();

      expect(router.replace).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/github`,
      );
    });

    it("API URL 환경변수가 설정되어 있지 않은 경우, 에러가 발생함", () => {
      vi.stubEnv("NEXT_PUBLIC_API_URL", undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(() => result.current.loginByGithub()).toThrowError();
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe("setup2FA", () => {
    afterEach(() => {
      act(() => {
        useAuthStore.setState({ setupToken: undefined });
      });
    });

    it("2FA 설정이 성공하면 setupToken이 저장되고 API 리스폰스를 반환함", async () => {
      const mockSetupToken = "test-setup-token";
      const mockResponse = {
        data: { setupToken: mockSetupToken },
      } as AxiosResponse;

      vi.mocked(authApi.setup2FA).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      const response = await act(async () => {
        return await result.current.setup2FA();
      });

      expect(useAuthStore.getState().setupToken).toBe(mockSetupToken);
      expect(response).toEqual(mockResponse);
    });

    it("2FA 설정이 실패하면 로그인 페이지로 리다이렉션됨", async () => {
      const mockError = {
        response: {
          data: { code: "SETUP_FAILED" },
        },
      };
      vi.mocked(authApi.setup2FA).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.setup2FA();
        } catch {
          // 에러는 예상된 동작이므로 무시
        }
      });

      expect(router.replace).toHaveBeenCalledWith(
        expect.stringContaining(`${ROUTES.LOGIN}?error=setup_failed`),
      );
    });
  });

  describe("verify2FA", () => {
    afterEach(() => {
      act(() => {
        useAuthStore.setState({
          tempToken: undefined,
          setupToken: undefined,
          accessToken: undefined,
          backupCodes: undefined,
        });
      });
    });

    it("2FA 검증이 성공하되 백업 코드 프로퍼티가 없는 경우, 대시보드로 이동함", async () => {
      const mockAccessToken = "test-access-token";
      const mockResponse = {
        data: { accessToken: mockAccessToken },
      } as AxiosResponse;

      vi.mocked(authApi.verify2FA).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        result.current.verify2FA("temp-token", "123456", null);
      });

      expect(useAuthStore.getState().accessToken).toBe(mockAccessToken);
      expect(useAuthStore.getState().tempToken).toBeUndefined();
      expect(useAuthStore.getState().setupToken).toBeUndefined();

      expect(router.replace).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it("2FA 검증이 성공하되 백업 코드 프로퍼티가 있는 경우, 백업 코드 표시 페이지로 이동함", async () => {
      const mockAccessToken = "test-access-token";
      const mockBackupCodes = ["code1", "code2"];
      const mockResponse = {
        data: {
          accessToken: mockAccessToken,
          backupCodes: mockBackupCodes,
        },
      } as AxiosResponse;

      vi.mocked(authApi.verify2FA).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        result.current.verify2FA("temp-token", "123456", null);
      });

      expect(useAuthStore.getState().accessToken).toBe(mockAccessToken);
      expect(useAuthStore.getState().backupCodes).toEqual(mockBackupCodes);
      expect(useAuthStore.getState().tempToken).toBeUndefined();
      expect(useAuthStore.getState().setupToken).toBeUndefined();

      expect(router.replace).toHaveBeenCalledWith(ROUTES.BACKUP_SHOW);
    });

    it("2FA 코드 검증이 실패할 경우, 에러 파라미터와 함께 현재 페이지에 머무름", async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: { code: "TOTP_VERIFICATION_FAILED" },
        },
      };
      vi.mocked(authApi.verify2FA).mockRejectedValueOnce(mockError);

      const tempToken = "temp-token";
      const mode = "setup";

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          result.current.verify2FA(tempToken, "123456", mode);
        } catch {
          // 예상된 에러이므로 무시
        }
      });

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining("error=totp_verification_failed"),
        );
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining(`token=${tempToken}`),
        );
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining(`mode=${mode}`),
        );
      });
    });

    it("2FA 코드 검증의 최대 시도 한도를 초과한 경우, 에러 파라미터와 함께 현재 페이지에 머무름", async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: { code: "TOTP_MAX_ATTEMPTS_EXCEEDED" },
        },
      };
      vi.mocked(authApi.verify2FA).mockRejectedValueOnce(mockError);

      const tempToken = "temp-token";
      const mode = "setup";

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          result.current.verify2FA(tempToken, "123456", mode);
        } catch {
          // 예상된 에러이므로 무시
        }
      });

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining("error=totp_max_attempts_exceeded"),
        );
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining(`token=${tempToken}`),
        );
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining(`mode=${mode}`),
        );
      });
    });
  });

  describe("verifyBackupCode", () => {
    afterEach(() => {
      act(() => {
        useAuthStore.setState({
          tempToken: undefined,
          accessToken: undefined,
        });
      });
    });

    it("백업 코드 검증이 성공하는 경우, 대시보드로 이동함", async () => {
      const mockAccessToken = "test-access-token";
      const mockResponse = {
        data: { accessToken: mockAccessToken },
      } as AxiosResponse;

      vi.mocked(authApi.verifyBackupCode).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        result.current.verifyBackupCode("1A2B3C4D");
      });

      expect(useAuthStore.getState().accessToken).toBe(mockAccessToken);
      expect(useAuthStore.getState().tempToken).toBeUndefined();

      expect(router.replace).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it("백업 코드 검증에 실패할 경우, 에러 파라미터와 함께 현재 페이지에 머무름", async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: { code: "TOTP_VERIFICATION_FAILED" },
        },
      };
      vi.mocked(authApi.verifyBackupCode).mockRejectedValueOnce(mockError);

      const tempToken = "temp-token";
      useAuthStore.setState({ tempToken });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          result.current.verifyBackupCode("1A2B3C4D");
        } catch {
          // 예상된 에러이므로 무시
        }
      });

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining("error=totp_verification_failed"),
        );
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining(`token=${tempToken}`),
        );
      });
    });

    it("백업 코드 검증의 최대 시도 한도를 초과한 경우, 에러 파라미터와 함께 현재 페이지에 머무름", async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: { code: "TOTP_MAX_ATTEMPTS_EXCEEDED" },
        },
      };
      vi.mocked(authApi.verifyBackupCode).mockRejectedValueOnce(mockError);

      const tempToken = "temp-token";
      useAuthStore.setState({ tempToken });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          result.current.verifyBackupCode("1A2B3C4D");
        } catch {
          // 예상된 에러이므로 무시
        }
      });

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining("error=totp_max_attempts_exceeded"),
        );
        expect(router.replace).toHaveBeenCalledWith(
          expect.stringContaining(`token=${tempToken}`),
        );
      });
    });
  });

  describe("logout", () => {
    afterEach(() => {
      act(() => {
        useAuthStore.setState({
          accessToken: undefined,
        });
      });
    });

    it("로그아웃 API 호출이 성공할 경우, 액세스 토큰이 삭제되고 로그인 페이지로 리다이렉션됨", async () => {
      const mockResponse = {
        data: {},
      } as AxiosResponse;

      vi.mocked(authApi.logout).mockResolvedValueOnce(mockResponse);

      const mockAccessToken = "test-access-token";
      useAuthStore.setState({ accessToken: mockAccessToken });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        result.current.logout();
      });

      expect(useAuthStore.getState().accessToken).toBeUndefined();
      expect(router.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
    });

    it("로그아웃 API 호출이 실패할 경우에도, 액세스 토큰이 삭제되고 로그인 페이지로 리다이렉션됨", async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: { code: "LOGOUT_FAILED" },
        },
      };
      vi.mocked(authApi.logout).mockRejectedValueOnce(mockError);

      const mockAccessToken = "test-access-token";
      useAuthStore.setState({ accessToken: mockAccessToken });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        result.current.logout();
      });

      expect(useAuthStore.getState().accessToken).toBeUndefined();
      expect(router.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });
});
