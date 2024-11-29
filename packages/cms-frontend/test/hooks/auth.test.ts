import { useRouter } from "next/navigation";

import { renderHook, act } from "@testing-library/react";
import type { Mock } from "vitest";

import { useAuth } from "@/src/hooks/auth";
import {
  authApi,
  setAccessToken,
  clearAccessToken,
} from "@/src/lib/api/client";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/src/lib/api/client", () => ({
  authApi: {
    handleGithubOAuthCallback: vi.fn(),
    verify2FA: vi.fn(),
    logout: vi.fn(),
  },
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}));

function setupAuth() {
  const locationMock = { href: "" };
  const routerMock = { push: vi.fn() };

  Object.defineProperty(window, "location", {
    value: locationMock,
  });

  (useRouter as Mock).mockReturnValue(routerMock);

  return {
    locationMock,
    routerMock,
    renderAuth: () => renderHook(() => useAuth()),
  };
}

describe("useAuth", () => {
  describe("handleGithubLogin", () => {
    it("깃헙 인증 페이지로 리다이렉트됨", () => {
      process.env.NEXT_PUBLIC_API_URL = "http://example.com";

      const { locationMock, renderAuth } = setupAuth();

      const { result } = renderAuth();

      act(() => {
        result.current.handleGithubLogin();
      });

      expect(locationMock.href).toBe(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/github`,
      );
    });
  });

  describe("handleGithubCallback", () => {
    it("깃헙 인증 콜백 처리 후 리다이렉트됨", async () => {
      const { routerMock, renderAuth } = setupAuth();
      const tempToken = "temp-token";

      (authApi.handleGithubOAuthCallback as Mock).mockResolvedValue({
        data: { tempToken },
      });

      const { result } = renderAuth();

      await act(async () => {
        await result.current.handleGithubCallback();
      });

      expect(setAccessToken).toHaveBeenCalledWith(tempToken);
      expect(result.current.is2FARequired).toBe(true);
      expect(routerMock.push).toHaveBeenCalledWith("/2fa");
    });

    it("관리자 권한이 없으면 로그인 페이지로 리다이렉트됨", async () => {
      const { routerMock, renderAuth } = setupAuth();

      (authApi.handleGithubOAuthCallback as Mock).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 403,
        },
      });

      const { result } = renderAuth();

      await act(async () => {
        await result.current.handleGithubCallback();
      });

      expect(routerMock.push).toHaveBeenCalledWith("/login?error=not_admin");
    });
  });

  describe("verify2FA", () => {
    it("2FA 인증 후 대시보드로 리다이렉트됨", async () => {
      const { routerMock, renderAuth } = setupAuth();
      const accessToken = "access-token";

      (authApi.verify2FA as Mock).mockResolvedValue({
        data: { accessToken },
      });

      const { result } = renderAuth();

      await act(async () => {
        await result.current.verify2FA("123456");
      });

      expect(setAccessToken).toHaveBeenCalledWith(accessToken);
      expect(result.current.is2FARequired).toBe(false);
      expect(routerMock.push).toHaveBeenCalledWith("/dashboard");
    });

    it("잘못된 형식의 코드를 입력하면 2FA 페이지로 리다이렉트됨", async () => {
      const { routerMock, renderAuth } = setupAuth();

      (authApi.verify2FA as Mock).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
        },
      });

      const { result } = renderAuth();

      await act(async () => {
        await result.current.verify2FA("123456");
      });

      expect(routerMock.push).toHaveBeenCalledWith("/2fa?error=invalid_format");
    });

    it("인증 가능한 시간이 만료되면 로그인 페이지로 리다이렉트됨", async () => {
      const { routerMock, renderAuth } = setupAuth();

      (authApi.verify2FA as Mock).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 401,
        },
      });

      const { result } = renderAuth();

      await act(async () => {
        await result.current.verify2FA("123456");
      });

      expect(routerMock.push).toHaveBeenCalledWith(
        "/login?error=session_expired",
      );
    });

    it("최대 가능 시도 횟수를 초과하면 2FA 페이지로 리다이렉트됨", async () => {
      const { routerMock, renderAuth } = setupAuth();

      (authApi.verify2FA as Mock).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 429,
        },
      });

      const { result } = renderAuth();

      await act(async () => {
        await result.current.verify2FA("123456");
      });

      expect(routerMock.push).toHaveBeenCalledWith(
        "/2fa?error=too_many_attempts",
      );
    });
  });

  describe("logout", () => {
    it("로그아웃 후 로그인 페이지로 리다이렉트됨", async () => {
      const { routerMock, renderAuth } = setupAuth();

      const { result } = renderAuth();

      await act(async () => {
        await result.current.logout();
      });

      expect(clearAccessToken).toHaveBeenCalled();
      expect(routerMock.push).toHaveBeenCalledWith("/login");
    });
  });
});
