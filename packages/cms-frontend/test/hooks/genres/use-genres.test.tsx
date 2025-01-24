import type { AxiosResponse } from "axios";

import { useGenres } from "@/src/hooks/genres/use-genres";
import { genresApi } from "@/src/lib/api/client";
import { wrapper } from "@/test/utils/test-query-client";

vi.mock("@/src/lib/api/client", () => ({
  genresApi: {
    getGenres: vi.fn(),
    getGenresByName: vi.fn(),
    createGenre: vi.fn(),
    updateGenre: vi.fn(),
    deleteGenres: vi.fn(),
  },
}));

vi.mock("@/src/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}));

describe("useGenres", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useList", () => {
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

    describe("기본 동작", () => {
      it("파라미터 없이 호출할 경우, 기본값으로 API를 호출함", async () => {
        vi.mocked(genresApi.getGenres).mockResolvedValueOnce(mockGenres);

        const { result } = renderHook(() => useGenres().useList({}), {
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

        const { result } = renderHook(() => useGenres().useList(params), {
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

        const { result } = renderHook(() => useGenres().useList({}), {
          wrapper,
        });

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

        const { result } = renderHook(() => useGenres().useList({}), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBe(mockError);
      });
    });
  });

  describe("useSearch", () => {
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

    it("검색어 입력 시 API를 호출함", async () => {
      vi.mocked(genresApi.getGenresByName).mockResolvedValueOnce(mockGenres);

      const { result } = renderHook(() => useGenres().useSearch("RPG"), {
        wrapper,
      });

      expect(genresApi.getGenresByName).toHaveBeenCalledWith("RPG");

      await waitFor(() => {
        expect(result.current.data).toEqual(mockGenres);
      });
    });

    it("검색어가 없을 때는 API를 호출하지 않음", () => {
      renderHook(() => useGenres().useSearch(""), { wrapper });

      expect(genresApi.getGenresByName).not.toHaveBeenCalled();
    });

    describe("에러 처리", () => {
      it("API 에러를 처리함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(genresApi.getGenresByName).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useGenres().useSearch("RPG"), {
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

  describe("useCreate", () => {
    const mockCreateGenreData = {
      koName: "액션",
      enName: "Action",
      jaName: "アクション",
    };

    describe("기본 동작", () => {
      it("장르 생성 API를 호출함", async () => {
        vi.mocked(genresApi.createGenre).mockResolvedValueOnce({} as any);

        const { result } = renderHook(() => useGenres().useCreate(), {
          wrapper,
        });

        await result.current.mutateAsync(mockCreateGenreData);

        expect(genresApi.createGenre).toHaveBeenCalledWith(mockCreateGenreData);
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(genresApi.createGenre).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useGenres().useCreate(), {
          wrapper,
        });

        await expect(
          result.current.mutateAsync(mockCreateGenreData),
        ).rejects.toThrow(mockError);
      });
    });
  });

  describe("useUpdate", () => {
    const mockUpdateData = {
      id: "genre-1",
      data: {
        koName: "액션 RPG",
        enName: "Action RPG",
        jaName: "アクションRPG",
      },
    };

    describe("기본 동작", () => {
      it("장르 수정 API를 호출함", async () => {
        vi.mocked(genresApi.updateGenre).mockResolvedValueOnce({} as any);

        const { result } = renderHook(() => useGenres().useUpdate(), {
          wrapper,
        });

        await result.current.mutateAsync(mockUpdateData);

        expect(genresApi.updateGenre).toHaveBeenCalledWith(
          mockUpdateData.id,
          mockUpdateData.data,
        );
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(genresApi.updateGenre).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useGenres().useUpdate(), {
          wrapper,
        });

        await expect(
          result.current.mutateAsync(mockUpdateData),
        ).rejects.toThrow(mockError);
      });
    });
  });

  describe("useDelete", () => {
    const mockIds = new Set(["genre-1", "genre-2"]);

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe("기본 동작", () => {
      it("장르 삭제 API를 호출함", async () => {
        vi.mocked(genresApi.deleteGenres).mockResolvedValueOnce({} as any);

        const { result } = renderHook(() => useGenres().useDelete(), {
          wrapper,
        });

        await result.current.mutateAsync({ ids: mockIds });

        expect(genresApi.deleteGenres).toHaveBeenCalledWith({ ids: mockIds });
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(genresApi.deleteGenres).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useGenres().useDelete(), {
          wrapper,
        });

        await expect(
          result.current.mutateAsync({ ids: mockIds }),
        ).rejects.toThrow(mockError);
      });
    });
  });
});
