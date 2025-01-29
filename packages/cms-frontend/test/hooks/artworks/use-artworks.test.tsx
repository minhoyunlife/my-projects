import {
  GetArtworksPlatformsEnum,
  GetArtworksSortEnum,
  GetArtworksStatusEnum,
} from "@minhoyunlife/my-ts-client";
import type { AxiosResponse } from "axios";

import { useArtworks } from "@/src/hooks/artworks/use-artworks";
import { artworksApi } from "@/src/lib/api/client";
import { wrapper } from "@/test/utils/test-query-client";

vi.mock("@/src/lib/api/client", () => ({
  artworksApi: {
    getArtworks: vi.fn(),
    uploadArtworkImage: vi.fn(),
    createArtwork: vi.fn(),
    deleteArtworks: vi.fn(),
  },
}));

describe("useArtworks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useList", () => {
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

    describe("기본 동작", () => {
      it("파라미터 없이 호출할 경우, 기본값으로 API를 호출함", async () => {
        vi.mocked(artworksApi.getArtworks).mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useArtworks().useList({}), {
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

        const { result } = renderHook(() => useArtworks().useList(params), {
          wrapper,
        });

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

        const { result } = renderHook(() => useArtworks().useList({}), {
          wrapper,
        });

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

        const { result } = renderHook(() => useArtworks().useList({}), {
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
    const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const mockFormData = {
      koTitle: "테스트 작품",
      enTitle: "Test Artwork",
      jaTitle: "テスト作品",
      genreIds: ["genre-1"],
    };

    const mockUploadResponse = {
      data: {
        imageKey: "artworks/2024/01/test.webp",
      },
    } as AxiosResponse;

    const mockCreateResponse = {
      data: {
        id: "1",
        imageKey: "artworks/2024/01/test.webp",
      },
    } as AxiosResponse;

    it("이미지 업로드 후 작품을 생성함", async () => {
      vi.mocked(artworksApi.uploadArtworkImage).mockResolvedValueOnce(
        mockUploadResponse,
      );
      vi.mocked(artworksApi.createArtwork).mockResolvedValueOnce(
        mockCreateResponse,
      );

      const { result } = renderHook(() => useArtworks().useCreate(), {
        wrapper,
      });

      await result.current.mutateAsync({
        file: mockFile,
        data: mockFormData,
      });

      expect(artworksApi.uploadArtworkImage).toHaveBeenCalledWith(
        mockFile,
        expect.any(Object),
      );
      expect(artworksApi.createArtwork).toHaveBeenCalledWith({
        ...mockFormData,
        imageKey: mockUploadResponse.data.imageKey,
      });
    });

    it("업로드 실패 시 에러를 발생시킴", async () => {
      const mockError = new Error("Upload failed");
      vi.mocked(artworksApi.uploadArtworkImage).mockRejectedValueOnce(
        mockError,
      );

      const { result } = renderHook(() => useArtworks().useCreate(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({
          file: mockFile,
          data: mockFormData,
        }),
      ).rejects.toThrow(mockError);

      expect(artworksApi.createArtwork).not.toHaveBeenCalled();
    });
  });

  describe("useDelete", () => {
    const mockIds = ["artwork-1", "artwork-2"];

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe("기본 동작", () => {
      it("작품 삭제 API를 호출함", async () => {
        vi.mocked(artworksApi.deleteArtworks).mockResolvedValueOnce({} as any);

        const { result } = renderHook(() => useArtworks().useDelete(), {
          wrapper,
        });

        await result.current.mutateAsync({ ids: new Set(mockIds) });

        expect(artworksApi.deleteArtworks).toHaveBeenCalledWith({
          ids: mockIds,
        });
      });
    });

    describe("에러 처리", () => {
      it("API 호출에 실패할 경우, 에러를 반환함", async () => {
        const mockError = new Error("API Error");
        vi.mocked(artworksApi.deleteArtworks).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useArtworks().useDelete(), {
          wrapper,
        });

        await expect(
          result.current.mutateAsync({ ids: new Set(mockIds) }),
        ).rejects.toThrow(mockError);
      });
    });
  });
});
