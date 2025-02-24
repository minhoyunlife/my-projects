import {
  type GetArtworks200ResponseItemsInner as ArtworkResponse,
  type GetArtworks200ResponseMetadata as PaginationMetadata,
  type GetArtworksSortEnum,
  type GetArtworksPlatformsEnum
} from '@minhoyunlife/my-ts-client';

export interface ArtworkList {
  items: Artwork[];
  metadata: PaginationMetadata;
}

export type Artwork = ArtworkResponse;

export type { GetArtworksSortEnum as SortOption, GetArtworksPlatformsEnum as Platform };
