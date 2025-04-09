import {
  UpdateSeriesForm,
  type Series,
} from "@/src/app/(authenticated)/series/(actions)/update";

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/series/use-series", () => ({
  useSeries: () => ({
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

describe("UpdateSeriesForm", () => {
  const mockSeries = {
    id: "series-1",
    translations: [
      { language: "ko", title: "타이틀" },
      { language: "en", title: "Title" },
      { language: "ja", title: "タイトル" },
    ],
  } as Series;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("초기값이 올바르게 설정됨", () => {
    render(<UpdateSeriesForm series={mockSeries} />);

    expect(reactScreen.getByPlaceholderText("한국어 시리즈 제목")).toHaveValue(
      "타이틀",
    );
    expect(
      reactScreen.getByPlaceholderText("English series title"),
    ).toHaveValue("Title");
    expect(reactScreen.getByPlaceholderText("シリーズタイトル")).toHaveValue(
      "タイトル",
    );
  });

  it("유효한 데이터로 폼 제출 시 시리즈가 수정됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    const onSuccess = vi.fn();

    const { container } = render(
      <UpdateSeriesForm
        series={mockSeries}
        onSuccess={onSuccess}
      />,
    );

    const koInput = reactScreen.getByPlaceholderText("한국어 시리즈 제목");
    const enInput = reactScreen.getByPlaceholderText("English series title");
    const jaInput = reactScreen.getByPlaceholderText("シリーズタイトル");

    await userEvent.clear(koInput);
    await userEvent.clear(enInput);
    await userEvent.clear(jaInput);

    await userEvent.type(koInput, "타이틀");
    await userEvent.type(enInput, "Title");
    await userEvent.type(jaInput, "タイトル");

    const form = container.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: mockSeries.id,
        data: {
          koTitle: "타이틀",
          enTitle: "Title",
          jaTitle: "タイトル",
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
          code: "DUPLICATE_TITLE",
          errors: {
            names: ["타이틀"],
          },
        },
      },
    };
    mockMutateAsync.mockRejectedValueOnce(mockError);

    const { container } = render(<UpdateSeriesForm series={mockSeries} />);

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
    render(<UpdateSeriesForm series={mockSeries} />);

    const koInput = reactScreen.getByPlaceholderText("한국어 시리즈 제목");
    await userEvent.clear(koInput);
    await userEvent.type(koInput, "Action");

    const submitButton = reactScreen.getByRole("button");
    expect(submitButton).toBeDisabled();
  });
});
