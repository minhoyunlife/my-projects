import {
  type GetArtworks200ResponseItemsInner as ArtworkItem,
  type GetArtworks200ResponseMetadata as PaginationMetadata,
  type GetArtworksSortEnum as SortEnum,
  type GetArtworksPlatformsEnum as PlatformEnum
} from '@minhoyunlife/my-ts-client';

export type Artwork = ArtworkItem;

export type ArtworkPagination = PaginationMetadata;

export interface ArtworkResponse {
  items: Artwork[];
  metadata: ArtworkPagination;
}

export type { SortEnum as SortOption, PlatformEnum as PlatformOption };
