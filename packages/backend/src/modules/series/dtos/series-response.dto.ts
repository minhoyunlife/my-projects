import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';

export class SeriesArtworkDto {
  id: string;
  order: number;
  translations: ArtworkTranslation[];

  constructor(seriesArtwork: SeriesArtwork) {
    this.id = seriesArtwork.artworkId;
    this.order = seriesArtwork.order;
    this.translations = seriesArtwork.artwork.translations ?? [];
  }
}

export class SeriesResponseDto {
  id: string;
  translations: SeriesTranslation[];
  seriesArtworks: SeriesArtworkDto[];

  constructor(series: Series) {
    this.id = series.id;
    this.translations = series.translations ?? [];
    this.seriesArtworks = (series.seriesArtworks ?? []).map(
      (seriesArtwork) => new SeriesArtworkDto(seriesArtwork),
    );
  }
}

export class SeriesListResponseDto {
  items: SeriesResponseDto[];
  metadata: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };

  constructor(
    series: Series[],
    totalCount: number,
    currentPage: number,
    pageSize: number,
  ) {
    this.items = series.map((s) => new SeriesResponseDto(s));
    this.metadata = {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage,
      pageSize,
    };
  }
}
