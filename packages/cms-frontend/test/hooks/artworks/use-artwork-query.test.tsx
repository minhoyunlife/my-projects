import {
  GetArtworksPlatformsEnum,
  GetArtworksSortEnum,
  GetArtworksStatusEnum,
} from "@minhoyunlife/my-ts-client";
import type { AxiosResponse } from "axios";

import { useArtworkQuery } from "@/src/hooks/artworks/use-artwork-query";
import { artworksApi } from "@/src/lib/api/client";
import { wrapper } from "@/test/utils/test-query-client";

vi.mock("@/src/lib/api/client", () => ({
  artworksApi: {
    getArtworks: vi.fn(),
  },
}));

describe("useArtworkQuery", () => {
  const mockResponse = {
    data: {
      data: [
        {
          id: "1",
          title: "Test Artwork",
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
      vi.mocked(artworksApi.getArtworks).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useArtworkQuery({}), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(artworksApi.getArtworks).toHaveBeenCalledWith(
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it("모든 파라미터를 지정하여 API를 호출 가능", async () => {
      vi.mocked(artworksApi.getArtworks).mockResolvedValueOnce(mockResponse);

      const params = {
        page: 2,
        search: "test",
        genres: ["RPG"],
        platforms: [GetArtworksPlatformsEnum.Steam],
        status: [GetArtworksStatusEnum.Draft],
        sort: GetArtworksSortEnum.CreatedDesc,
      };

      const { result } = renderHook(() => useArtworkQuery(params), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(artworksApi.getArtworks).toHaveBeenCalledWith(
        params.page,
        params.sort,
        new Set(params.platforms),
        new Set(params.genres),
        params.search,
        params.status,
      );
    });
  });

  describe("캐싱 동작", () => {
    it("매번 호출할 때마다 fresh 한 데이터를 가져옴", async () => {
      vi.mocked(artworksApi.getArtworks).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useArtworkQuery({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      await result.current.refetch();

      expect(artworksApi.getArtworks).toHaveBeenCalledTimes(2);
    });
  });

  describe("에러 처리", () => {
    it("API 호출에 실패할 경우, 에러를 반환함", async () => {
      const mockError = new Error("API Error");
      vi.mocked(artworksApi.getArtworks).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useArtworkQuery({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });
});
