import {
  Configuration,
  ArtworksApi,
  AuthApi,
  GenresApi,
} from "@minhoyunlife/my-ts-client";
import axios from "axios";

import { ROUTES } from "@/src/routes";
import { useAuthStore } from "@/src/store/auth";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

/**
 * 리퀘스트에 임시 또는 엑세스 토큰을 헤더에 주입하는 인터셉터
 */
apiClient.interceptors.request.use(async (config) => {
  // 리프레시 요청 자체에는 아래의 처리가 실행되지 않도록
  if (config.url?.includes("/auth/refresh")) {
    return config;
  }

  const { accessToken, tempToken } = useAuthStore.getState();

  if (config.url?.includes("/auth")) {
    if (tempToken) {
      config.headers.Authorization = `Bearer ${tempToken}`;
    }
    return config;
  }

  if (!accessToken && !tempToken) {
    try {
      const { data } = await authApi.refreshToken();
      useAuthStore.getState().setAccessToken(data.accessToken);
      config.headers.Authorization = `Bearer ${data.accessToken}`;
      return config;
    } catch {
      return config;
    }
  }

  // 토큰이 있는 경우 헤더 설정
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
        const { data } = await authApi.refreshToken();
        useAuthStore.getState().setAccessToken(data.accessToken);

        return apiClient(error.config);
      } catch {
        window.location.href = ROUTES.LOGIN;
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
export const genresApi = new GenresApi(configuration, "", apiClient);
