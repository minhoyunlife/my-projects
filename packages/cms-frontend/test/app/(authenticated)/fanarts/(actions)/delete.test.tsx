import { DeleteArtworkDialog } from "@/src/app/(authenticated)/fanarts/(actions)/delete";
import { wrapper } from "@/test/utils/test-query-client";

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/artworks/use-artworks", () => ({
  useArtworks: () => ({
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

describe("DeleteArtworkDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    selectedIds: ["artwork-1", "artwork-2"],
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("선택된 작품 수가 다이얼로그 설명에 표시됨", () => {
    render(<DeleteArtworkDialog {...defaultProps} />, { wrapper });

    expect(reactScreen.getByText(/2/)).toBeInTheDocument();
  });

  it("삭제 확인 시 작품이 삭제됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    render(<DeleteArtworkDialog {...defaultProps} />, { wrapper });

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
          code: "ALREADY_PUBLISHED",
          errors: {
            titles: ["다크 소울3"],
          },
        },
      },
    };
    mockMutateAsync.mockRejectedValueOnce(mockError);

    render(<DeleteArtworkDialog {...defaultProps} />, { wrapper });

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
    render(<DeleteArtworkDialog {...defaultProps} />, { wrapper });

    await userEvent.click(reactScreen.getByRole("button", { name: "취소" }));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
