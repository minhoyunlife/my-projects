import { ArtworkService } from '$lib/services/artwork';

import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const artworkService = new ArtworkService();

  try {
    const artworks = await artworkService.getArtworks();
    return { artworks };
  } catch (error) {
    console.error('Failed to fetch artworks:', error);
    return { artworks: null };
  }
};
