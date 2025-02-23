import type { PageLoad } from './$types';
import { ArtworkService } from '$lib/services/artwork';

export const load: PageLoad = async () => {
	const artworkService = new ArtworkService();

	try {
		const artworks = await artworkService.getArtworks();
		return { artworks };
	} catch (error) {
		console.error('Failed to fetch artworks:', error);
		throw error;
	}
};
