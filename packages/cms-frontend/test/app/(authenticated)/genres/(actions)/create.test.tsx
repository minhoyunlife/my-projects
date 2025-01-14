import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateGenreForm } from "@/src/app/(authenticated)/genres/(actions)/create";

vi.mock("@/src/hooks/genres/use-genre-create");
vi.mock("@/src/hooks/use-toast");

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/genres/use-genre-create", () => ({
  useCreateGenre: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("CreateGenreForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("유효한 데이터로 폼 제출 시 장르가 생성됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    const { container } = render(<CreateGenreForm />);

    const koInput = reactScreen.getByPlaceholderText("한국어 장르명");
    const enInput = reactScreen.getByPlaceholderText("English genre name");
    const jaInput = reactScreen.getByPlaceholderText("ジャンル名");

    fireEvent.change(koInput, { target: { value: "액션 RPG" } });
    fireEvent.change(enInput, { target: { value: "Action RPG" } });
    fireEvent.change(jaInput, { target: { value: "アクションRPG" } });

    const form = container.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        koName: "액션 RPG",
        enName: "Action RPG",
        jaName: "アクションRPG",
      });
    });
  });

  it("API 에러 발생 시 에러 토스트를 표시함", async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: {
          code: "DUPLICATE_NAME",
          errors: {
            names: ["액션"],
          },
        },
      },
    };
    mockMutateAsync.mockRejectedValueOnce(mockError);

    const { container } = render(<CreateGenreForm />);

    const koInput = reactScreen.getByPlaceholderText("한국어 장르명");
    const enInput = reactScreen.getByPlaceholderText("English genre name");
    const jaInput = reactScreen.getByPlaceholderText("ジャンル名");

    fireEvent.change(koInput, { target: { value: "액션 RPG" } });
    fireEvent.change(enInput, { target: { value: "Action RPG" } });
    fireEvent.change(jaInput, { target: { value: "アクションRPG" } });

    const form = container.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        }),
      );
    });
  });

  it("유효하지 않은 입력의 경우 제출 버튼이 비활성화됨", async () => {
    render(<CreateGenreForm />);

    await userEvent.type(
      reactScreen.getByPlaceholderText("한국어 장르명"),
      "Action",
    );

    const submitButton = screen.getByRole("button");
    expect(submitButton).toBeDisabled();
  });
});
