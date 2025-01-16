import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeleteGenresDialog } from "@/src/app/(authenticated)/genres/(actions)/delete";
import { wrapper } from "@/test/utils/test-query-client";

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/genres/use-delete-genres-mutation", () => ({
  useDeleteGenresMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("DeleteGenresDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    selectedIds: ["genre-1", "genre-2"],
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("선택된 장르 수가 다이얼로그 설명에 표시됨", () => {
    render(<DeleteGenresDialog {...defaultProps} />, { wrapper });

    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it("삭제 확인 시 장르가 삭제됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    render(<DeleteGenresDialog {...defaultProps} />, { wrapper });

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        ids: defaultProps.selectedIds,
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
            koNames: ["액션"],
          },
        },
      },
    };
    mockMutateAsync.mockRejectedValueOnce(mockError);

    render(<DeleteGenresDialog {...defaultProps} />, { wrapper });

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        }),
      );
    });
  });

  it("취소 버튼 클릭 시 다이얼로그가 닫힘", async () => {
    render(<DeleteGenresDialog {...defaultProps} />, { wrapper });

    await userEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
