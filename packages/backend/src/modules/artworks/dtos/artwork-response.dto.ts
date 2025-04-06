import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreResponseDto } from '@/src/modules/genres/dtos/genre-response.dto';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { StorageService } from '@/src/modules/storage/storage.service';

export class ArtworkSeriesDto {
  id: string;
  order: number;
  translations: SeriesTranslation[];

  constructor(seriesArtwork: SeriesArtwork) {
    this.id = seriesArtwork.seriesId;
    this.order = seriesArtwork.order;
    this.translations = seriesArtwork.series?.translations || [];
  }
}

export class ArtworkResponseDto {
  id: string;
  imageUrl: string;
  createdAt: string;
  playedOn: string;
  rating: number;
  isDraft: boolean;
  isVertical: boolean;
  translations: ArtworkTranslation[];
  genres: GenreResponseDto[];
  series: ArtworkSeriesDto | null;

  constructor(storageService: StorageService, artwork: Artwork) {
    const seriesArtwork =
      artwork.seriesArtworks?.length > 0 ? artwork.seriesArtworks[0] : null; // NOTE: 작품에 연결되는 시리즈는 하나만 존재

    this.id = artwork.id;
    this.imageUrl = storageService.getImageUrl(artwork.imageKey);
    this.createdAt = artwork.createdAt?.toISOString() ?? '';
    this.playedOn = artwork.playedOn ?? '';
    this.rating = artwork.rating;
    this.isDraft = artwork.isDraft;
    this.isVertical = artwork.isVertical;
    this.translations = artwork.translations ?? [];
    this.genres =
      artwork.genres?.map((genre) => new GenreResponseDto(genre)) ?? [];
    this.series = seriesArtwork ? new ArtworkSeriesDto(seriesArtwork) : null;
  }
}

export class ArtworkListResponseDto {
  items: ArtworkResponseDto[];
  metadata: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };

  constructor(
    storageService: StorageService,
    artworks: Artwork[],
    totalCount: number,
    currentPage: number,
    pageSize: number,
  ) {
    this.items = artworks.map(
      (artwork) => new ArtworkResponseDto(storageService, artwork),
    );
    this.metadata = {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage,
      pageSize,
    };
  }
}
