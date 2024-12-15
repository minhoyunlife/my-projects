import { GitHubLoginButton } from "@/src/components/(unauthenticated)/github-login-button";
import { useAuth } from "@/src/hooks/use-auth";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock("@/src/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

describe("GitHubLoginButton", () => {
  const mockLoginByGithub = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      loginByGithub: mockLoginByGithub,
    });
  });

  describe("버튼 클릭 전 검증", () => {
    it("GitHub 아이콘과 로그인 안내 텍스트가 포함된 버튼이 표시됨", () => {
      render(<GitHubLoginButton />);

      expect(reactScreen.getByLabelText("github login")).toBeInTheDocument();
      expect(reactScreen.getByTestId("github-icon")).toBeInTheDocument();
      expect(reactScreen.getByText("GitHub 으로 로그인")).toBeInTheDocument();
    });
  });

  describe("버튼 클릭 후 검증", () => {
    it("클릭할 경우, loginByGithub 을 호출함", async () => {
      render(<GitHubLoginButton />);

      await userEvent.click(reactScreen.getByRole("button"));
      expect(mockLoginByGithub).toHaveBeenCalledTimes(1);
    });

    it("클릭 후 로딩 중의 경우, 버튼이 비활성화됨", async () => {
      render(<GitHubLoginButton />);
      const button = reactScreen.getByRole("button");

      await userEvent.click(button);
      expect(button).toBeDisabled();

      await userEvent.click(button); // 비활성화 상태에서 클릭 시도
      expect(mockLoginByGithub).toHaveBeenCalledTimes(1);
    });

    it("클릭 후 로딩 중에는 버튼 내용이 숨겨지고 대신 로딩 스피너가 표시됨", async () => {
      render(<GitHubLoginButton />);
      const button = reactScreen.getByRole("button");

      await userEvent.click(button);
      expect(button).toBeDisabled();

      expect(reactScreen.queryByTestId("github-icon")).not.toBeInTheDocument();
      expect(
        reactScreen.queryByText("GitHub 으로 로그인"),
      ).not.toBeInTheDocument();
      expect(reactScreen.getByTestId("spinner")).toBeInTheDocument();
    });
  });
});
