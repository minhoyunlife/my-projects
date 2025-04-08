import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useDebounce } from "@/src/hooks/use-debounce";
import { seriesApi } from "@/src/lib/api/client";
import type { CreateSeriesFormData } from "@/src/schemas/series/create";

export interface SeriesListParams {
  page?: number;
  search?: string;
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

  return {
    useList,
    useCreate,
  };
}
