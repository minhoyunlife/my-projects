import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useDebounce } from "@/src/hooks/use-debounce";
import { genresApi } from "@/src/lib/api/client";
import type { CreateGenreFormData } from "@/src/schemas/genres/create";
import type { UpdateGenreFormData } from "@/src/schemas/genres/update";

export interface GenreListParams {
  page?: number;
  search?: string;
}

export interface GenreUpdateParams {
  id: string;
  data: UpdateGenreFormData;
}

export interface GenreDeleteParams {
  ids: Set<string>;
}

export function useGenres() {
  const queryClient = useQueryClient();

  // 리스트 조회
  const useList = (params: GenreListParams) => {
    const debouncedSearch = useDebounce(params.search || "", 300);

    return useQuery({
      queryKey: ["genres", { ...params, search: debouncedSearch }],
      queryFn: () =>
        genresApi.getGenres(params.page || 1, debouncedSearch || undefined),
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
    });
  };

  // 검색
  const useSearch = (search: string) => {
    const debouncedSearch = useDebounce(search, 300);

    return useQuery({
      queryKey: ["genres", "search", debouncedSearch],
      queryFn: () => genresApi.getGenresByName(debouncedSearch),
      enabled: !!debouncedSearch,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    });
  };

  // 생성
  const useCreate = () =>
    useMutation({
      mutationFn: (data: CreateGenreFormData) => genresApi.createGenre(data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["genres"] });
      },
    });

  // 수정
  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: GenreUpdateParams) =>
        genresApi.updateGenre(id, data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["genres"] });
      },
    });

  // 삭제
  const useDelete = () =>
    useMutation({
      mutationFn: ({ ids }: GenreDeleteParams) =>
        genresApi.deleteGenres({ ids: Array.from(ids) }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["genres"] });
      },
    });

  return {
    useList,
    useSearch,
    useCreate,
    useUpdate,
    useDelete,
  };
}
