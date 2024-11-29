import {
  Configuration,
  ArtworksApi,
  AuthApi,
} from "@minhoyunlife/my-ts-client";

let accessToken: string | null = null;

const configuration = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL,
  accessToken: () => accessToken ?? "",
});

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export const artworksApi = new ArtworksApi(configuration);

export const authApi = new AuthApi(configuration);
