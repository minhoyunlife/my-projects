import { useMutation, useQueryClient } from "@tanstack/react-query";

import { genresApi } from "@/src/lib/api/client";
import type { CreateGenreFormData } from "@/src/schemas/genres/create";

export function useCreateGenreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGenreFormData) => genresApi.createGenre(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}
