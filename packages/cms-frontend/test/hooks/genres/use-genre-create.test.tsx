import { renderHook } from "@testing-library/react";

import { useCreateGenre } from "@/src/hooks/genres/use-genre-create";
import { genresApi } from "@/src/lib/api/client";
import { wrapper } from "@/test/utils/test-query-client";

vi.mock("@/src/lib/api/client", () => ({
  genresApi: {
    createGenre: vi.fn(),
  },
}));

describe("useCreateGenre", () => {
  const mockCreateGenreData = {
    koName: "액션",
    enName: "Action",
    jaName: "アクション",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("기본 동작", () => {
    it("장르 생성 API를 호출함", async () => {
      vi.mocked(genresApi.createGenre).mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useCreateGenre(), { wrapper });

      await result.current.mutateAsync(mockCreateGenreData);

      expect(genresApi.createGenre).toHaveBeenCalledWith(mockCreateGenreData);
    });
  });

  describe("에러 처리", () => {
    it("API 호출에 실패할 경우, 에러를 반환함", async () => {
      const mockError = new Error("API Error");
      vi.mocked(genresApi.createGenre).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useCreateGenre(), { wrapper });

      await expect(
        result.current.mutateAsync(mockCreateGenreData),
      ).rejects.toThrow(mockError);
    });
  });
});
