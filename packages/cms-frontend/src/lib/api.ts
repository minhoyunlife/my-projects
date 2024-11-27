import {
  Configuration,
  ArtworksApi,
  AuthApi,
} from "@minhoyunlife/my-ts-client";

const configuration = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL,
});

export const artworksApi = new ArtworksApi(configuration);
export const authApi = new AuthApi(configuration);
