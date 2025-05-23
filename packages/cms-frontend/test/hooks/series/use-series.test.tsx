import type { AxiosResponse } from "axios";

import { useSeries } from "@/src/hooks/series/use-series";
import { seriesApi } from "@/src/lib/api/client";
import { wrapper } from "@/test/utils/test-query-client";

vi.mock("@/src/lib/api/client", () => ({
  seriesApi: {
    getSeries: vi.fn(),
    createSeries: vi.fn(),
    updateSeries: vi.fn(),
    updateSeriesArtworks: vi.fn(),
    deleteSeries: vi.fn(),
  },
}));

vi.mock("@/src/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}));

describe("useSeries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useList", () => {
    const mockSeries = {
      data: {
        items: [
          {
            id: "1",
            translations: [
              { language: "ko", title: "파이널 판타지" },
              { language: "en", title: "Final Fantasy" },
              { language: "ja", title: "ファイナルファンタジー" },
            ],
            seriesArtworks: [
              {
                id: "art-1",
                order: 0,
                translations: [
                  { language: "ko", title: "파이널 판타지 7 리버스" },
                  { language: "en", title: "Final Fantasy VII Rebirth" },
                  {
                    language: "ja",
                    title: "ファイナルファンタジーVII リバース",
                  },
                ],
              },
            ],
          },
        ],
        metadata: {
          totalCount: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
        },
      },
    } as AxiosResponse;

    describe("기본 동작", () => {
      it("파라미터 없이 호출할 경우, 기본값으로 API를 호출함", async () => {
        vi.mocked(seriesApi.getSeries).mockResolvedValueOnce(mockSeries);

        const { result } = renderHook(() => useSeries().useList({}), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(seriesApi.getSeries).toHaveBeenCalledWith(1, undefined);
      });

      it("모든 파라미터를 지정하여 API를 호출 가능", async () => {
        vi.mocked(seriesApi.getSeries).mockResolvedValueOnce(mockSeries);

        const params = {
          page: 2,
          search: "파이널",
        };

        const { result } = renderHook(() => useSeries().useList(params), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(seriesApi.getSeries).toHaveBeenCalledWith(
          params.page,
          params.search,
        );
      });
    });

    describe("캐싱 동작", () => {
      it("매번 호출할 때마다 fresh 한 데이터를 가져옴", async () => {
        vi.mocked(seriesApi.getSeries).mockResolvedValue(mockSeries);

        const { result } = renderHook(() => useSeries().useList({}), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        await result.current.refetch();

        expect(seriesApi.getSeries).toHaveBeenCalledTimes(2);
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(seriesApi.getSeries).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useSeries().useList({}), {
          wrapper,
        });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBe(mockError);
      });
    });
  });

  describe("useCreate", () => {
    const mockCreateSeriesData = {
      koTitle: "타이틀",
      enTitle: "Title",
      jaTitle: "タイトル",
    };

    describe("기본 동작", () => {
      it("시리즈 생성 API를 호출함", async () => {
        vi.mocked(seriesApi.createSeries).mockResolvedValueOnce({} as any);

        const { result } = renderHook(() => useSeries().useCreate(), {
          wrapper,
        });

        await result.current.mutateAsync(mockCreateSeriesData);

        expect(seriesApi.createSeries).toHaveBeenCalledWith(
          mockCreateSeriesData,
        );
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(seriesApi.createSeries).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useSeries().useCreate(), {
          wrapper,
        });

        await expect(
          result.current.mutateAsync(mockCreateSeriesData),
        ).rejects.toThrow(mockError);
      });
    });
  });

  describe("useUpdate", () => {
    const mockUpdateData = {
      id: "series-1",
      data: {
        koTitle: "타이틀",
        enTitle: "Title",
        jaTitle: "タイトル",
      },
    };

    describe("기본 동작", () => {
      it("시리즈 수정 API를 호출함", async () => {
        vi.mocked(seriesApi.updateSeries).mockResolvedValueOnce({} as any);

        const { result } = renderHook(() => useSeries().useUpdate(), {
          wrapper,
        });

        await result.current.mutateAsync(mockUpdateData);

        expect(seriesApi.updateSeries).toHaveBeenCalledWith(
          mockUpdateData.id,
          mockUpdateData.data,
        );
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(seriesApi.updateSeries).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useSeries().useUpdate(), {
          wrapper,
        });

        await expect(
          result.current.mutateAsync(mockUpdateData),
        ).rejects.toThrow(mockError);
      });
    });
  });

  describe("useUpdateArtworks", () => {
    const mockSeriesId = "series-1";
    const mockArtworks = [
      { id: "artwork-1", order: 0 },
      { id: "artwork-2", order: 1 },
    ];
    const mockUpdateArtworksData = {
      seriesId: mockSeriesId,
      artworks: mockArtworks,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe("기본 동작", () => {
      it("시리즈 아트워크 업데이트 API를 호출함", async () => {
        vi.mocked(seriesApi.updateSeriesArtworks).mockResolvedValueOnce(
          {} as any,
        );

        const { result } = renderHook(() => useSeries().useUpdateArtworks(), {
          wrapper,
        });

        await result.current.mutateAsync(mockUpdateArtworksData);

        expect(seriesApi.updateSeriesArtworks).toHaveBeenCalledWith(
          mockSeriesId,
          { artworks: mockArtworks },
        );
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(seriesApi.updateSeriesArtworks).mockRejectedValueOnce(
          mockError,
        );

        const { result } = renderHook(() => useSeries().useUpdateArtworks(), {
          wrapper,
        });

        await expect(
          result.current.mutateAsync(mockUpdateArtworksData),
        ).rejects.toThrow(mockError);
      });
    });
  });

  describe("useDelete", () => {
    const mockIds = ["series-1", "series-2"];

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe("기본 동작", () => {
      it("장르 삭제 API를 호출함", async () => {
        vi.mocked(seriesApi.deleteSeries).mockResolvedValueOnce({} as any);

        const { result } = renderHook(() => useSeries().useDelete(), {
          wrapper,
        });

        await result.current.mutateAsync({ ids: new Set(mockIds) });

        expect(seriesApi.deleteSeries).toHaveBeenCalledWith({ ids: mockIds });
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(seriesApi.deleteSeries).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useSeries().useDelete(), {
          wrapper,
        });

        await expect(
          result.current.mutateAsync({ ids: new Set(mockIds) }),
        ).rejects.toThrow(mockError);
      });
    });
  });
});
