import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/src/hooks/use-debounce";
import { seriesApi } from "@/src/lib/api/client";

export interface SeriesListParams {
  page?: number;
  search?: string;
}

export function useSeries() {
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

  return {
    useList,
  };
}
