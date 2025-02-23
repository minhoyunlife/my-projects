import { artworksApi } from '$lib/config/api';
import type { ArtworkList, Platform, SortOption } from '$lib/types/artwork';
import type { ArtworksApi } from '@minhoyunlife/my-ts-client';

export class ArtworkService {
	private readonly api: ArtworksApi = artworksApi;

	async getArtworks(
		page?: number,
		sort?: SortOption,
		platforms?: Set<Platform>,
		genreIds?: Set<string>
	): Promise<ArtworkList> {
		try {
			const response = await this.api.getArtworks(page, sort, platforms, genreIds);
			return response.data;
		} catch (error) {
			console.error('Failed to fetch artworks:', error);
			throw error;
		}
	}
}
