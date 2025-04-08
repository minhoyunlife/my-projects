import { CreateSeriesForm } from "@/src/app/(authenticated)/series/(actions)/create";

vi.mock("@/src/hooks/use-toast");

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/series/use-series", () => ({
  useSeries: () => ({
    useCreate: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("CreateSeriesForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("유효한 데이터로 폼 제출 시 시리즈가 생성됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    const { container } = render(<CreateSeriesForm />);

    const koInput = reactScreen.getByPlaceholderText("한국어 시리즈 제목");
    const enInput = reactScreen.getByPlaceholderText("English series title");
    const jaInput = reactScreen.getByPlaceholderText("シリーズタイトル");

    fireEvent.change(koInput, { target: { value: "타이틀" } });
    fireEvent.change(enInput, { target: { value: "Title" } });
    fireEvent.change(jaInput, { target: { value: "タイトル" } });

    const form = container.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        koTitle: "타이틀",
        enTitle: "Title",
        jaTitle: "タイトル",
      });
    });
  });

  it("API 에러 발생 시 에러 토스트를 표시함", async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: {
          code: "DUPLICATE_TITLE",
          errors: {
            titles: ["Title"],
          },
        },
      },
    };
    mockMutateAsync.mockRejectedValueOnce(mockError);

    const { container } = render(<CreateSeriesForm />);

    const koInput = reactScreen.getByPlaceholderText("한국어 시리즈 제목");
    const enInput = reactScreen.getByPlaceholderText("English series title");
    const jaInput = reactScreen.getByPlaceholderText("シリーズタイトル");

    fireEvent.change(koInput, { target: { value: "타이틀" } });
    fireEvent.change(enInput, { target: { value: "Title" } });
    fireEvent.change(jaInput, { target: { value: "タイトル" } });

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
    render(<CreateSeriesForm />);

    await userEvent.type(
      reactScreen.getByPlaceholderText("한국어 시리즈 제목"),
      "Action",
    );

    const submitButton = reactScreen.getByRole("button");
    expect(submitButton).toBeDisabled();
  });
});
