import { renderHook } from "@testing-library/react";

import { useDeleteGenresMutation } from "@/src/hooks/genres/use-delete-genres-mutation";
import { genresApi } from "@/src/lib/api/client";
import { wrapper } from "@/test/utils/test-query-client";

vi.mock("@/src/lib/api/client", () => ({
  genresApi: {
    deleteGenres: vi.fn(),
  },
}));

describe("useDeleteGenresMutation", () => {
  const mockIds = ["genre-1", "genre-2"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("기본 동작", () => {
    it("장르 삭제 API를 호출함", async () => {
      vi.mocked(genresApi.deleteGenres).mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useDeleteGenresMutation(), {
        wrapper,
      });

      await result.current.mutateAsync({ ids: mockIds });

      expect(genresApi.deleteGenres).toHaveBeenCalledWith(new Set(mockIds));
    });
  });

  describe("에러 처리", () => {
    it("API 호출에 실패할 경우, 에러를 반환함", async () => {
      const mockError = new Error("API Error");
      vi.mocked(genresApi.deleteGenres).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useDeleteGenresMutation(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ ids: mockIds }),
      ).rejects.toThrow(mockError);
    });
  });
});
