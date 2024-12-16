import { useSearchParams } from "next/navigation";

import type { Mock } from "vitest";

import TwoFactorAuthPage from "@/src/app/(unauthenticated)/2fa/page";
import { AuthErrorCode } from "@/src/constants/auth/error-codes";
import { getErrorMessage } from "@/src/constants/auth/error-messages";
import { useAuth } from "@/src/hooks/use-auth";
import { ROUTES } from "@/src/routes";
import { useAuthStore } from "@/src/store/auth";

const mockRouter = {
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

const mockVerify2FA = vi.fn();

vi.mock("@/src/hooks/use-auth", () => ({
  useAuth: vi.fn(() => ({
    verify2FA: mockVerify2FA,
    isVerifying2FA: false,
  })),
}));

const mockToast = vi.fn();

vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock("@/src/store/auth", () => ({
  useAuthStore: Object.assign(
    () => ({
      tempToken: undefined,
      setTempToken: vi.fn(),
    }),
    {
      getState: () => ({
        tempToken: undefined,
      }),
    },
  ),
}));

describe("TwoFactorAuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("화면 렌더링 검증", () => {
    beforeEach(() => {
      (useSearchParams as Mock).mockReturnValue(
        new URLSearchParams({ token: "test-token" }),
      );
    });

    describe("기본 화면 요소", () => {
      it("제목, 입력 필드가 표시됨", () => {
        render(<TwoFactorAuthPage />);

        const inputFields = reactScreen.getAllByRole("textbox");

        expect(
          reactScreen.getByRole("heading", { level: 2 }),
        ).toHaveTextContent("2단계 인증");
        expect(inputFields).toHaveLength(6);
      });
    });

    describe("로딩 상태", () => {
      it("입력 후 검증 중에는 로딩 스피너가 표시됨", () => {
        (useAuth as Mock).mockReturnValue({
          verify2FA: mockVerify2FA,
          isVerifying2FA: true,
        });

        render(<TwoFactorAuthPage />);

        expect(reactScreen.getByTestId("spinner")).toBeInTheDocument();
      });
    });

    describe("백업 코드 입력 링크", () => {
      beforeEach(() => {
        (useAuth as Mock).mockReturnValue({
          verify2FA: mockVerify2FA,
          isVerifying2FA: false,
        });
      });

      const token = "test-token";

      it("일반 모드에서는 백업 코드 링크가 표시됨", () => {
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({ token }),
        );

        render(<TwoFactorAuthPage />);

        expect(
          reactScreen.getByText("백업 코드로 인증하기"),
        ).toBeInTheDocument();
      });

      it("setup 모드에서는 백업 코드 링크가 표시되지 않음", () => {
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({
            token,
            mode: "setup",
          }),
        );

        render(<TwoFactorAuthPage />);

        expect(
          reactScreen.queryByText("백업 코드로 인증하기"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("동작 검증", () => {
    describe("파라미터 검증", () => {
      it("token 이 없으면 로그인 페이지로 리다이렉트함", () => {
        (useSearchParams as Mock).mockReturnValue(new URLSearchParams());

        render(<TwoFactorAuthPage />);

        expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
      });

      it("상태로 저장된 tempToken 과 파라미터 token 이 다르면 로그인 페이지로 리다이렉트함", () => {
        const mockAuthStore = vi.mocked(useAuthStore);

        mockAuthStore.getState = vi.fn().mockReturnValue({
          tempToken: "temp-token",
        });

        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({ token: "different-temp-token" }),
        );

        render(<TwoFactorAuthPage />);

        expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
      });

      it("유효하지 않은 mode 이면 로그인 페이지로 리다이렉트함", () => {
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({
            token: "test-token",
            mode: "invalid",
          }),
        );

        render(<TwoFactorAuthPage />);

        expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
      });
    });

    describe("인증 코드 입력 검증", () => {
      const token = "test-token";
      const code = "123456";

      beforeEach(() => {
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({ token }),
        );
      });

      it("일반 모드에서 코드 입력 완료시 verify2FA가 호출됨", () => {
        render(<TwoFactorAuthPage />);

        const firstInput = reactScreen.getByLabelText("code-input-1");

        fireEvent.paste(firstInput, {
          clipboardData: {
            getData: () => code,
          },
        });

        expect(mockVerify2FA).toHaveBeenCalledWith(token, code, null);
      });

      it("setup 모드에서 코드 입력 완료시 mode와 함께 verify2FA가 호출됨", () => {
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({
            token,
            mode: "setup",
          }),
        );

        render(<TwoFactorAuthPage />);

        const firstInput = reactScreen.getByLabelText("code-input-1");

        fireEvent.paste(firstInput, {
          clipboardData: {
            getData: () => code,
          },
        });

        expect(mockVerify2FA).toHaveBeenCalledWith(token, code, "setup");
      });
    });
  });

  describe("에러 처리 검증", () => {
    it.each([
      [AuthErrorCode.TOTP_VERIFICATION_FAILED],
      [AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED],
      [AuthErrorCode.TOTP_CODE_MALFORMED],
    ])("에러 코드 %s에 대해 적절한 메시지를 표시함", async (code) => {
      (useSearchParams as Mock).mockReturnValue(
        new URLSearchParams({
          token: "test-token",
          error: code.toLowerCase(),
        }),
      );

      render(<TwoFactorAuthPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "destructive",
            description: getErrorMessage(code),
          }),
        );
      });
    });
  });
});
