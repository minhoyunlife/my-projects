import { useQuery } from "@tanstack/react-query";

import type {
  GetArtworksPlatformsEnum,
  GetArtworksSortEnum,
  GetArtworksStatusEnum,
} from "@minhoyunlife/my-ts-client";

import { useDebounce } from "@/src/hooks/use-debounce";
import { artworksApi } from "@/src/lib/api/client";

interface UseArtworkQueryParams {
  page?: number;
  search?: string;
  genres?: string[];
  platforms?: GetArtworksPlatformsEnum[];
  status?: GetArtworksStatusEnum[];
  sort?: GetArtworksSortEnum;
}

export function useArtworkQuery(params: UseArtworkQueryParams) {
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
    staleTime: 0, // 데이터를 항상 fresh 상태로 유지
    gcTime: 1000 * 60 * 5, // 5분 동안은 가비지 콜렉션 되지 않게끔
  });
}
