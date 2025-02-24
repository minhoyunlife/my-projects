import { browser } from '$app/environment';

import { Configuration, ArtworksApi } from '@minhoyunlife/my-ts-client';
import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.MODE === 'development') {
    return browser
      ? 'http://localhost:3000/api' // 브라우저
      : 'http://backend:3000/api'; // SSR
  } else {
    return import.meta.env.VITE_API_URL;
  }
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true
});

const configuration = new Configuration({
  basePath: getBaseUrl()
});

export const artworksApi = new ArtworksApi(configuration, '', apiClient);
