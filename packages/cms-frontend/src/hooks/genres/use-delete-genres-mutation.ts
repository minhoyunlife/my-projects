import { useMutation, useQueryClient } from "@tanstack/react-query";

import { genresApi } from "@/src/lib/api/client";

interface DeleteGenresVariables {
  ids: string[];
}

export function useDeleteGenresMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids }: DeleteGenresVariables) =>
      genresApi.deleteGenres(new Set(ids)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}
