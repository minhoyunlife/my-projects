import {
  type GetArtworks200ResponseItemsInnerGenresInner as ArtworkGenre,
  type GetArtworks200ResponseItemsInner as ArtworkItem,
  type GetArtworks200ResponseMetadata as PaginationMetadata,
  type GetArtworksSortEnum as SortEnum,
  type GetArtworksPlatformsEnum as PlatformEnum
} from '@minhoyunlife/my-ts-client';

export type Artwork = ArtworkItem;
export type ArtworkPagination = PaginationMetadata;
export type Genre = ArtworkGenre;

export interface ArtworkResponse {
  items: Artwork[];
  metadata: ArtworkPagination;
}

export type { SortEnum as SortOption, PlatformEnum as PlatformOption };

export type TranslatedGenre = Omit<Genre, 'translations'> & { name: string };

export type TranslatedArtwork = Omit<Artwork, 'translations' | 'genres'> & {
  title: string;
  shortReview: string;
  genres: TranslatedGenre[];
};
