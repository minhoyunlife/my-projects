import type { AxiosResponse } from "axios";

import { useGenreListQuery } from "@/src/hooks/genres/use-genre-list-query";
import { genresApi } from "@/src/lib/api/client";
import { wrapper } from "@/test/utils/test-query-client";

vi.mock("@/src/lib/api/client", () => ({
  genresApi: {
    getGenres: vi.fn(),
  },
}));

vi.mock("@/src/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}));

describe("useGenreListQuery", () => {
  const mockGenres = {
    data: {
      data: [
        {
          id: "1",
          translations: [
            { language: "ko", name: "액션" },
            { language: "en", name: "Action" },
            { language: "ja", name: "アクション" },
          ],
        },
      ],
      pageCount: 1,
    },
  } as AxiosResponse;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("기본 동작", () => {
    it("파라미터 없이 호출할 경우, 기본값으로 API를 호출함", async () => {
      vi.mocked(genresApi.getGenres).mockResolvedValueOnce(mockGenres);

      const { result } = renderHook(() => useGenreListQuery({}), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(genresApi.getGenres).toHaveBeenCalledWith(1, undefined);
    });

    it("모든 파라미터를 지정하여 API를 호출 가능", async () => {
      vi.mocked(genresApi.getGenres).mockResolvedValueOnce(mockGenres);

      const params = {
        page: 2,
        search: "test",
      };

      const { result } = renderHook(() => useGenreListQuery(params), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(genresApi.getGenres).toHaveBeenCalledWith(
        params.page,
        params.search,
      );
    });
  });

  describe("캐싱 동작", () => {
    it("매번 호출할 때마다 fresh 한 데이터를 가져옴", async () => {
      vi.mocked(genresApi.getGenres).mockResolvedValue(mockGenres);

      const { result } = renderHook(() => useGenreListQuery({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      await result.current.refetch();

      expect(genresApi.getGenres).toHaveBeenCalledTimes(2);
    });
  });

  describe("에러 처리", () => {
    it("API 호출에 실패할 경우, 에러를 반환함", async () => {
      const mockError = new Error("API Error");
      vi.mocked(genresApi.getGenres).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useGenreListQuery({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });
});
