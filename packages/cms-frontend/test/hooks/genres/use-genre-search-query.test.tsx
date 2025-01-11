import { renderHook, waitFor } from "@testing-library/react";
import type { AxiosResponse } from "axios";

import { useGenreSearchQuery } from "@/src/hooks/genres/use-genre-search-query";
import { genresApi } from "@/src/lib/api/client";
import { wrapper } from "@/test/utils/test-query-client";

vi.mock("@/src/lib/api/client", () => ({
  genresApi: {
    getGenresByName: vi.fn(),
  },
}));

vi.mock("@/src/hooks/use-debounce", () => ({
  useDebounce: vi.fn((value: string) => value),
}));

describe("useGenreSearchQuery", () => {
  const mockGenres = {
    data: {
      items: [
        {
          id: "1",
          translations: [
            { language: "ko", name: "액션 RPG" },
            { language: "en", name: "Action RPG" },
          ],
        },
      ],
    },
  } as AxiosResponse;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("검색어 입력 시 API를 호출함", async () => {
    vi.mocked(genresApi.getGenresByName).mockResolvedValueOnce(mockGenres);

    const { result } = renderHook(() => useGenreSearchQuery("RPG"), {
      wrapper,
    });

    expect(genresApi.getGenresByName).toHaveBeenCalledWith("RPG");

    await waitFor(() => {
      expect(result.current.data).toEqual(mockGenres);
    });
  });

  it("검색어가 없을 때는 API를 호출하지 않음", () => {
    renderHook(() => useGenreSearchQuery(""), { wrapper });

    expect(genresApi.getGenresByName).not.toHaveBeenCalled();
  });

  describe("에러 처리", () => {
    it("API 에러를 처리함", async () => {
      const mockError = new Error("API Error");
      vi.mocked(genresApi.getGenresByName).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useGenreSearchQuery("RPG"), {
        wrapper,
      });

      expect(genresApi.getGenresByName).toHaveBeenCalledWith("RPG");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });
});
