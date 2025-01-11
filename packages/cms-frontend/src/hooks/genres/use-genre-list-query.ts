import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/src/hooks/use-debounce";
import { genresApi } from "@/src/lib/api/client";

interface UseGenreListQueryParams {
  page?: number;
  search?: string;
}

export function useGenreListQuery(params: UseGenreListQueryParams) {
  const debouncedSearch = useDebounce(params.search || "", 300);

  return useQuery({
    queryKey: ["genres", { ...params, search: debouncedSearch }],
    queryFn: () =>
      genresApi.getGenres(params.page || 1, debouncedSearch || undefined),
    staleTime: 0, // 데이터를 항상 fresh 상태로 유지
    gcTime: 1000 * 60 * 5, // 5분 동안은 가비지 콜렉션 되지 않게끔
  });
}
