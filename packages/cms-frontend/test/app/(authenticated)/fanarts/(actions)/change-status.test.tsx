import { ChangeArtworkStatusesDialog } from "@/src/app/(authenticated)/fanarts/(actions)/change-status";
import { wrapper } from "@/test/utils/test-query-client";

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/artworks/use-artworks", () => ({
  useArtworks: () => ({
    useChangeStatus: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("ChangeArtworkStatusesDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    selectedIds: ["artwork-1", "artwork-2"],
    setPublished: true,
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("공개로 상태 변경 시, 선택된 작품 수와 변경할 상태가 다이얼로그 설명에 표시됨", () => {
    render(<ChangeArtworkStatusesDialog {...defaultProps} />, { wrapper });

    expect(reactScreen.getByText(/2/)).toBeInTheDocument();
    expect(reactScreen.getByText(/공개/)).toBeInTheDocument();
  });

  it("비공개로 상태 변경 시, 선택된 작품 수와 변경할 상태가 다이얼로그 설명에 표시됨", () => {
    render(
      <ChangeArtworkStatusesDialog
        {...defaultProps}
        setPublished={false}
      />,
      { wrapper },
    );

    expect(reactScreen.getByText(/2/)).toBeInTheDocument();
    expect(reactScreen.getByText(/비공개/)).toBeInTheDocument();
  });

  it("상태 변경 적용 시, 작품 상태 처리가 실행됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    render(<ChangeArtworkStatusesDialog {...defaultProps} />, { wrapper });

    await userEvent.click(reactScreen.getByRole("button", { name: "적용" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        ids: new Set(defaultProps.selectedIds),
        setPublished: defaultProps.setPublished,
      });
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
        }),
      );
    });
  });

  it("API 에러 발생 시 에러 토스트를 표시함", async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 207,
        data: {
          code: "SOME_FAILED",
          message: "Some status changes failed",
          errors: {
            FIELD_REQUIRED: ["artwork-1|createdAt"],
          },
        },
      },
    };
    mockMutateAsync.mockRejectedValueOnce(mockError);

    render(<ChangeArtworkStatusesDialog {...defaultProps} />, { wrapper });

    await userEvent.click(reactScreen.getByRole("button", { name: "적용" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        }),
      );
    });
  });

  it("취소 버튼 클릭 시 다이얼로그가 닫힘", async () => {
    render(<ChangeArtworkStatusesDialog {...defaultProps} />, { wrapper });

    await userEvent.click(reactScreen.getByRole("button", { name: "취소" }));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
