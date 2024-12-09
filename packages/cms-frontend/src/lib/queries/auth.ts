import { authApi } from "@/src/lib/api/client";

export const authQueries = {
  refresh: {
    queryKey: ["auth", "refresh"],
    queryFn: () => authApi.refreshToken(),
  },
};
