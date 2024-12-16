import { useSearchParams } from "next/navigation";

import type { Mock } from "vitest";

import TwoFactorSetupPage from "@/src/app/(unauthenticated)/2fa-setup/page";
import { useAuth } from "@/src/hooks/use-auth";
import { ROUTES } from "@/src/routes";

const mockRouter = {
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockRouter),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("qrcode.react", () => ({
  QRCodeCanvas: ({ value }: { value: string }) => (
    <div
      data-testid="mocked-qr-code"
      data-value={value}
    >
      QR Code Mock
    </div>
  ),
}));

const mockSetup2FA = vi.fn();

vi.mock("@/src/hooks/use-auth", () => ({
  useAuth: vi.fn(() => ({
    setup2FA: mockSetup2FA,
    isSettingUp2FA: false,
  })),
}));

const mockSetTempToken = vi.fn();

vi.mock("@/src/store/auth", () => ({
  useAuthStore: vi.fn(() => ({
    setTempToken: mockSetTempToken,
  })),
}));

describe("TwoFactorSetupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupData = {
    qrCodeUrl: "otpauth://example.com/totp/test",
    manualEntryKey: "ABCD EFGH IJKL",
    setupToken: "setup-token",
  };

  describe("화면 렌더링 검증", () => {
    describe("setup2FA 호출 전", () => {
      it("섹션, 제목, 로딩 스피너가 표시됨", async () => {
        (useAuth as Mock).mockReturnValue({
          setup2FA: mockSetup2FA.mockResolvedValue({ data: {} }),
          isSettingUp2FA: true,
        });
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({ token: "test-token" }),
        );

        await act(async () => {
          render(<TwoFactorSetupPage />);
        });

        expect(
          reactScreen.getByRole("heading", { level: 2 }),
        ).toHaveTextContent("2단계 인증 설정");
        expect(reactScreen.getByTestId("spinner")).toBeInTheDocument();
      });
    });

    describe("setup2FA 호출 후", () => {
      it("QR 코드와 수동 입력 코드가 표시됨", async () => {
        (useAuth as Mock).mockReturnValue({
          setup2FA: mockSetup2FA.mockResolvedValue({ data: setupData }),
          isSettingUp2FA: false,
        });
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({
            token: "test-temp-token",
          }),
        );

        render(<TwoFactorSetupPage />);

        await waitFor(() => {
          expect(reactScreen.getByTestId("mocked-qr-code")).toBeInTheDocument();
          expect(
            reactScreen.getByText(setupData.manualEntryKey),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe("동작 검증", () => {
    describe("토큰 파라미터", () => {
      it("token 파라미터가 존재하는 경우, 상태를 저장하고 setup2FA 를 호출함", async () => {
        const token = "test-temp-token";

        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({ token }),
        );

        await act(async () => {
          render(<TwoFactorSetupPage />);
        });

        expect(mockSetTempToken).toHaveBeenCalledWith(token);
        expect(mockSetup2FA).toHaveBeenCalled();
      });

      it("token 파라미터가 존재하지 않는 경우, 로그인 페이지로 이동함", () => {
        (useSearchParams as Mock).mockReturnValue(new URLSearchParams());

        render(<TwoFactorSetupPage />);

        expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
      });
    });

    describe("버튼 클릭", () => {
      it("인증하러 가기 버튼을 클릭한 경우 검증 페이지로 이동함", async () => {
        const token = "test-temp-token";

        (useAuth as Mock).mockReturnValue({
          setup2FA: mockSetup2FA.mockResolvedValue({ data: setupData }),
          isSettingUp2FA: false,
        });
        (useSearchParams as Mock).mockReturnValue(
          new URLSearchParams({
            token,
          }),
        );

        render(<TwoFactorSetupPage />);

        const button = await reactScreen.findByRole("button");
        fireEvent.click(button);

        await waitFor(() => {
          expect(mockRouter.replace).toHaveBeenCalledWith(
            `${ROUTES.TWO_FACTOR_VERIFICATION}?token=${token}&mode=setup`,
          );
        });
      });
    });
  });
});
