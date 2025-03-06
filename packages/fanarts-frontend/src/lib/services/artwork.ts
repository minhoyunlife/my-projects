import type { ArtworksApi } from '@minhoyunlife/my-ts-client';

import { artworksApi } from '$lib/config/api';
import type { ArtworkResponse, PlatformOption, SortOption } from '$lib/types/artwork';

export class ArtworkService {
  private readonly api: ArtworksApi = artworksApi;

  async getArtworks(
    page?: number,
    sort?: SortOption,
    platforms?: Set<PlatformOption>,
    genreIds?: Set<string>
  ): Promise<ArtworkResponse> {
    try {
      const response = await this.api.getArtworks(page, sort, platforms, genreIds);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
      throw error;
    }
  }
}

export const artworkService = new ArtworkService();
