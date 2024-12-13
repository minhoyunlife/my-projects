import { useSearchParams } from "next/navigation";

import type { Mock } from "vitest";

import BackupVerifyPage from "@/src/app/(auth)/backup/verify/page";
import { AuthErrorCode } from "@/src/constants/errors/auth/code";
import { getErrorMessage } from "@/src/constants/errors/auth/messages";
import { ROUTES } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/use-auth";
import { useAuthStore } from "@/src/store/auth";

const mockRouter = {
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

const mockVerifyBackupCode = vi.fn();

vi.mock("@/src/hooks/use-auth", () => ({
  useAuth: vi.fn(() => ({
    verifyBackupCode: mockVerifyBackupCode,
    isVerifyingBackup: false,
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

describe("BackupVerifyPage", () => {
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
        render(<BackupVerifyPage />);

        const inputFields = reactScreen.getAllByRole("textbox");

        expect(
          reactScreen.getByRole("heading", { level: 2 }),
        ).toBeInTheDocument();
        expect(inputFields).toHaveLength(8);
      });
    });

    describe("로딩 상태", () => {
      it("입력 후 검증 중에는 로딩 스피너가 표시됨", () => {
        (useAuth as Mock).mockReturnValue({
          verifyBackupCode: mockVerifyBackupCode,
          isVerifyingBackup: true,
        });

        render(<BackupVerifyPage />);

        expect(reactScreen.getByTestId("spinner")).toBeInTheDocument();
      });
    });

    describe("TOTP 입력 링크", () => {
      it("TOTP 입력 링크가 표시됨", () => {
        (useAuth as Mock).mockReturnValue({
          verifyBackupCode: mockVerifyBackupCode,
          isVerifyingBackup: false,
        });

        render(<BackupVerifyPage />);

        const link = reactScreen.getByText("TOTP 코드로 인증하기");
        expect(link).toHaveAttribute(
          "href",
          `${ROUTES.TWO_FACTOR_VERIFICATION}?token=test-token`,
        );
      });
    });
  });

  describe("동작 검증", () => {
    describe("파라미터 검증", () => {
      it("token 이 없으면 로그인 페이지로 리다이렉트함", () => {
        (useSearchParams as Mock).mockReturnValue(new URLSearchParams());

        render(<BackupVerifyPage />);

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

        render(<BackupVerifyPage />);

        expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
      });
    });

    describe("인증 코드 입력 검증", () => {
      const token = "test-token";
      const code = "A1B2C3D4";

      beforeEach(() => {
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({ token }),
        );
      });

      it("일반 모드에서 코드 입력 완료시 verifyBackupCode 가 호출됨", () => {
        render(<BackupVerifyPage />);

        const firstInput = reactScreen.getByLabelText("code-input-1");

        fireEvent.paste(firstInput, {
          clipboardData: {
            getData: () => code,
          },
        });

        expect(mockVerifyBackupCode).toHaveBeenCalledWith(code);
      });
    });
  });

  describe("에러 처리 검증", () => {
    it.each([
      [AuthErrorCode.TOTP_VERIFICATION_FAILED],
      [AuthErrorCode.TOTP_MAX_ATTEMPTS_EXCEEDED],
    ])("에러 코드 %s에 대해 적절한 메시지를 표시함", async (code) => {
      (useSearchParams as Mock).mockReturnValue(
        new URLSearchParams({
          token: "test-token",
          error: code.toLowerCase(),
        }),
      );

      render(<BackupVerifyPage />);

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
