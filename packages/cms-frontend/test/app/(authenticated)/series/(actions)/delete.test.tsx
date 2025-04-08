import { DeleteSeriesDialog } from "@/src/app/(authenticated)/series/(actions)/delete";
import { wrapper } from "@/test/utils/test-query-client";

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/series/use-series", () => ({
  useSeries: () => ({
    useDelete: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("DeleteSeriesDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    selectedIds: ["series-1", "series-2"],
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("선택된 시리즈 수가 다이얼로그 설명에 표시됨", () => {
    render(<DeleteSeriesDialog {...defaultProps} />, { wrapper });

    expect(reactScreen.getByText(/2/)).toBeInTheDocument();
  });

  it("삭제 확인 시 시리즈가 삭제됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    render(<DeleteSeriesDialog {...defaultProps} />, { wrapper });

    await userEvent.click(reactScreen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        ids: new Set(defaultProps.selectedIds),
      });
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalled();
    });
  });

  it("API 에러 발생 시 에러 토스트를 표시함", async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: {
          code: "IN_USE",
          errors: {
            koTitle: ["타이틀"],
          },
        },
      },
    };
    mockMutateAsync.mockRejectedValueOnce(mockError);

    render(<DeleteSeriesDialog {...defaultProps} />, { wrapper });

    await userEvent.click(reactScreen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        }),
      );
    });
  });

  it("취소 버튼 클릭 시 다이얼로그가 닫힘", async () => {
    render(<DeleteSeriesDialog {...defaultProps} />, { wrapper });

    await userEvent.click(reactScreen.getByRole("button", { name: "취소" }));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
