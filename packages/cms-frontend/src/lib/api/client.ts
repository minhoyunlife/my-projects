import {
  Configuration,
  ArtworksApi,
  AuthApi,
} from "@minhoyunlife/my-ts-client";
import axios from "axios";

import { queryClient } from "@/src/components/providers/query-provider";
import { authQueries } from "@/src/lib/queries/auth";
import { useAuthStore } from "@/src/store/auth";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

/**
 * 리퀘스트에 임시 또는 엑세스 토큰을 헤더에 주입하는 인터셉터
 */
apiClient.interceptors.request.use((config) => {
  const { accessToken, tempToken } = useAuthStore.getState();

  const token = accessToken || tempToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * API 요청 시 토큰 만료가 발생한 경우, 액세스 토큰을 새로 발급 받아 상태에 보존
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data?.code === "TOKEN_EXPIRED") {
      try {
        const response = await queryClient.fetchQuery(authQueries.refresh);
        useAuthStore.getState().setAccessToken(response?.data.accessToken);

        return apiClient(error.config);
      } catch {
        useAuthStore.getState().clearAccessToken();
      }
    }
    return Promise.reject(error);
  },
);

const configuration = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL,
});

export const authApi = new AuthApi(configuration, "", apiClient);

export const artworksApi = new ArtworksApi(configuration, "", apiClient);
