import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  GetArtworksPlatformsEnum,
  GetArtworksSortEnum,
  GetArtworksStatusEnum,
} from "@minhoyunlife/my-ts-client";

import { useDebounce } from "@/src/hooks/use-debounce";
import { artworksApi } from "@/src/lib/api/client";
import type { CreateArtworkFormData } from "@/src/schemas/artworks/create";

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
          const { imageKey } = await uploadImageWithProgress(
            file,
            handlers?.onProgress,
          );

          return await artworksApi.createArtwork({
            ...data,
            imageKey,
          });
        } catch (error) {
          throw error;
        }
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["artworks"] });
      },
    });

  return {
    useList,
    useCreate,
  };
}

async function uploadImageWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{ imageKey: string }> {
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
