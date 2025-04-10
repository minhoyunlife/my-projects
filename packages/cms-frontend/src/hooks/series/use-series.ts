import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useDebounce } from "@/src/hooks/use-debounce";
import { seriesApi } from "@/src/lib/api/client";
import type { CreateSeriesFormData } from "@/src/schemas/series/create";
import type { UpdateSeriesFormData } from "@/src/schemas/series/update";

export interface SeriesListParams {
  page?: number;
  search?: string;
}

export interface SeriesUpdateParams {
  id: string;
  data: UpdateSeriesFormData;
}

export interface SeriesArtworksUpdateParams {
  seriesId: string;
  artworks: Array<{
    id: string;
    order: number;
  }>;
}

export interface SeriesDeleteParams {
  ids: Set<string>;
}

export function useSeries() {
  const queryClient = useQueryClient();

  // 리스트 조회
  const useList = (params: SeriesListParams) => {
    const debouncedSearch = useDebounce(params.search || "", 300);

    return useQuery({
      queryKey: ["series", { ...params, search: debouncedSearch }],
      queryFn: () =>
        seriesApi.getSeries(params.page || 1, debouncedSearch || undefined),
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
    });
  };

  // 생성
  const useCreate = () =>
    useMutation({
      mutationFn: (data: CreateSeriesFormData) => seriesApi.createSeries(data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["series"] });
      },
    });

  // 타이틀 수정
  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: SeriesUpdateParams) =>
        seriesApi.updateSeries(id, data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["series"] });
      },
    });

  // 시리즈-아트워크 연결 업데이트
  const useUpdateArtworks = () =>
    useMutation({
      mutationFn: ({ seriesId, artworks }: SeriesArtworksUpdateParams) =>
        seriesApi.updateSeriesArtworks(seriesId, { artworks }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["series"] });
      },
    });

  // 삭제
  const useDelete = () =>
    useMutation({
      mutationFn: ({ ids }: SeriesDeleteParams) =>
        seriesApi.deleteSeries({ ids: Array.from(ids) }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["series"] });
      },
    });

  return {
    useList,
    useCreate,
    useUpdate,
    useUpdateArtworks,
    useDelete,
  };
}
