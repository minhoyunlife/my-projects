import { useSearchParams } from "next/navigation";

import type { Mock } from "vitest";

import LoginPage from "@/src/app/(unauthenticated)/login/page";
import { AuthErrorCode } from "@/src/constants/auth/error-codes";
import { getErrorMessage } from "@/src/constants/auth/error-messages";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

const mockToast = vi.fn();

vi.mock("@/src/hooks/use-toast", () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

vi.mock("@/src/components/(unauthenticated)/github-login-button", () => ({
  GitHubLoginButton: () => <button>GitHub Login</button>,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("화면 렌더링 검증", () => {
    it("로그인 섹션, 제목, 버튼, 안내 메시지가 표시됨", () => {
      render(<LoginPage />);

      expect(
        reactScreen.getByRole("region", { name: "login" }),
      ).toBeInTheDocument();
      expect(reactScreen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "SNS 계정으로 로그인",
      );
      expect(reactScreen.getByRole("button")).toBeInTheDocument();
      expect(reactScreen.getByRole("alert")).toHaveTextContent(
        "관리자 계정으로만 로그인이 가능합니다",
      );
    });
  });

  describe("에러 처리 검증", () => {
    it.each([
      [AuthErrorCode.TOKEN_NOT_PROVIDED],
      [AuthErrorCode.INVALID_TOKEN],
      [AuthErrorCode.TOKEN_EXPIRED],
      [AuthErrorCode.INVALID_TOKEN_FORMAT],
      [AuthErrorCode.INVALID_TOKEN_TYPE],
      [AuthErrorCode.TOTP_NOT_SETUP],
      [AuthErrorCode.TOTP_SETUP_FAILED],
      [AuthErrorCode.NOT_ADMIN],
      [AuthErrorCode.UNKNOWN],
    ])("에러 코드 %s에 대해 적절한 메시지를 표시함", async (code) => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
        new URLSearchParams({ error: code.toLowerCase() }),
      );

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: "destructive",
          description: getErrorMessage(code),
        });
      });
    });

    it("유효하지 않은 에러 코드가 쿼리 파라미터에 존재하는 경우, 토스트 메시지가 표시되지 않음", async () => {
      (useSearchParams as Mock).mockReturnValue(
        new URLSearchParams({ error: "UNKNOWN_ERROR_CODE" }),
      );

      render(<LoginPage />);

      await waitFor(() => {
        expect(mockToast).not.toHaveBeenCalled();
      });
    });
  });
});
