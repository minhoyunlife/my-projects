import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  GetArtworksPlatformsEnum,
  GetArtworksSortEnum,
  GetArtworksStatusEnum,
} from "@minhoyunlife/my-ts-client";

import { useDebounce } from "@/src/hooks/use-debounce";
import { artworksApi } from "@/src/lib/api/client";
import type { CreateArtworkFormData } from "@/src/schemas/artworks/create";
import type { UpdateArtworkFormData } from "@/src/schemas/artworks/update";

interface ArtworkQueryParams {
  page?: number;
  search?: string;
  genres?: string[];
  platforms?: GetArtworksPlatformsEnum[];
  status?: GetArtworksStatusEnum[];
  sort?: GetArtworksSortEnum;
}

interface UploadProgressHandler {
  onProgress: (progress: number) => void;
}

interface CreateArtworkParams {
  file: File;
  data: CreateArtworkFormData;
}

interface UpdateArtworkParams {
  id: string;
  data: UpdateArtworkFormData;
}

interface UpdateArtworkStatusParams {
  ids: Set<string>;
  setPublished: boolean;
}

interface DeleteArtworkParams {
  ids: Set<string>;
}

export function useArtworks() {
  const queryClient = useQueryClient();

  // 리스트 조회
  const useList = (params: ArtworkQueryParams) => {
    const debouncedSearch = useDebounce(params.search || "", 300);

    return useQuery({
      queryKey: ["artworks", { ...params, search: debouncedSearch }],
      queryFn: () =>
        artworksApi.getArtworks(
          params.page || 1,
          params.sort,
          params.platforms ? new Set(params.platforms) : undefined,
          params.genres ? new Set(params.genres) : undefined,
          debouncedSearch || undefined,
          params.status,
        ),
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
    });
  };

  // 작품 생성
  const useCreate = (handlers?: UploadProgressHandler) =>
    useMutation({
      mutationFn: async ({ file, data }: CreateArtworkParams) => {
        try {
          const { imageKey, isVertical } = await uploadImageWithProgress(
            file,
            handlers?.onProgress,
          );

          return await artworksApi.createArtwork({
            ...data,
            imageKey,
            isVertical,
          });
        } catch (error) {
          throw error;
        }
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["artworks"] });
      },
    });

  // 작품 수정
  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: UpdateArtworkParams) =>
        artworksApi.updateArtwork(id, data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["artworks"] });
      },
    });

  // 작품 공개/비공개 상태 변환
  const useChangeStatus = () =>
    useMutation({
      mutationFn: async ({ ids, setPublished }: UpdateArtworkStatusParams) => {
        const response = await artworksApi.updateArtworksStatus({
          ids: Array.from(ids),
          setPublished,
        });

        if (response.status === 207) {
          throw response;
        }
        return response.data;
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: ["artworks"] });
      },
    });

  // 삭제
  const useDelete = () =>
    useMutation({
      mutationFn: ({ ids }: DeleteArtworkParams) =>
        artworksApi.deleteArtworks({ ids: Array.from(ids) }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["artworks"] });
      },
    });

  // 작품 검색 (타이틀 기준)
  const useSearch = (search: string) => {
    const debouncedSearch = useDebounce(search, 300);

    return useQuery({
      queryKey: ["artworks", "search", debouncedSearch],
      queryFn: () =>
        artworksApi.getArtworks(
          1, // 첫 페이지만 검색
          undefined,
          undefined,
          undefined,
          debouncedSearch || undefined,
          undefined,
        ),
      enabled: !!debouncedSearch && debouncedSearch.length >= 2,
      staleTime: 1000 * 60, // 1분
      gcTime: 1000 * 60 * 5, // 5분
    });
  };

  return {
    useList,
    useCreate,
    useUpdate,
    useChangeStatus,
    useDelete,
    useSearch,
  };
}

async function uploadImageWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{ imageKey: string; isVertical: boolean }> {
  return artworksApi
    .uploadArtworkImage(file, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress?.(Math.round(progress));
        }
      },
    })
    .then((response) => response.data);
}
