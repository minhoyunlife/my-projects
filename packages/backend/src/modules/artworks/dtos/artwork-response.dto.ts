import { Injectable } from '@nestjs/common';

import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreResponseDto } from '@/src/modules/genres/dtos/genre-response.dto';
import { StorageService } from '@/src/modules/storage/storage.service';

@Injectable()
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
  series: string | null; // TODO: SeriesArtworkResponseDto 구현 시 수정할 것

  constructor(storageService: StorageService, artwork: Artwork) {
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
    this.series = null; // TODO: SeriesArtworkResponseDto 구현 시 수정할 것
  }
}

@Injectable()
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
