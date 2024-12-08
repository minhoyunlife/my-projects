import {
  Configuration,
  ArtworksApi,
  AuthApi,
} from "@minhoyunlife/my-ts-client";
import axios from "axios";

import { useAuthStore } from "@/src/store/auth";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken, tempToken } = useAuthStore.getState();

  const token = accessToken || tempToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const configuration = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL,
});

export const authApi = new AuthApi(configuration, "", apiClient);

export const artworksApi = new ArtworksApi(configuration, "", apiClient);
