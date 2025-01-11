import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/src/hooks/use-debounce";
import { genresApi } from "@/src/lib/api/client";

export function useGenreSearchQuery(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: ["genres", "search", debouncedSearch],
    queryFn: () => genresApi.getGenresByName(debouncedSearch),
    enabled: !!debouncedSearch,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}
