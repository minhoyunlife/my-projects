import type { Genre } from "@/src/app/(authenticated)/genres/(actions)/update";
import { UpdateGenreForm } from "@/src/app/(authenticated)/genres/(actions)/update";

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/genres/use-genres", () => ({
  useGenres: () => ({
    useUpdate: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("UpdateGenreForm", () => {
  const mockGenre = {
    id: "genre-1",
    translations: [
      { language: "ko", name: "액션" },
      { language: "en", name: "Action" },
      { language: "ja", name: "アクション" },
    ],
  } as Genre;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("초기값이 올바르게 설정됨", () => {
    render(<UpdateGenreForm genre={mockGenre} />);

    expect(reactScreen.getByPlaceholderText("한국어 장르명")).toHaveValue(
      "액션",
    );
    expect(reactScreen.getByPlaceholderText("English genre name")).toHaveValue(
      "Action",
    );
    expect(reactScreen.getByPlaceholderText("ジャンル名")).toHaveValue(
      "アクション",
    );
  });

  it("유효한 데이터로 폼 제출 시 장르가 수정됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    const onSuccess = vi.fn();

    const { container } = render(
      <UpdateGenreForm
        genre={mockGenre}
        onSuccess={onSuccess}
      />,
    );

    const koInput = reactScreen.getByPlaceholderText("한국어 장르명");
    const enInput = reactScreen.getByPlaceholderText("English genre name");
    const jaInput = reactScreen.getByPlaceholderText("ジャンル名");

    await userEvent.clear(koInput);
    await userEvent.clear(enInput);
    await userEvent.clear(jaInput);

    await userEvent.type(koInput, "액션 RPG");
    await userEvent.type(enInput, "Action RPG");
    await userEvent.type(jaInput, "アクションRPG");

    const form = container.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: mockGenre.id,
        data: {
          koName: "액션 RPG",
          enName: "Action RPG",
          jaName: "アクションRPG",
        },
      });
      expect(onSuccess).toHaveBeenCalled();
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

    const { container } = render(<UpdateGenreForm genre={mockGenre} />);

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
    render(<UpdateGenreForm genre={mockGenre} />);

    const koInput = reactScreen.getByPlaceholderText("한국어 장르명");
    await userEvent.clear(koInput);
    await userEvent.type(koInput, "Action");

    const submitButton = reactScreen.getByRole("button");
    expect(submitButton).toBeDisabled();
  });
});
