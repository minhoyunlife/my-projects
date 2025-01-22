import { Injectable } from '@nestjs/common';

import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreResponse } from '@/src/modules/genres/dtos/genre-response.dto';
import { StorageService } from '@/src/modules/storage/storage.service';

@Injectable()
export class ArtworkResponse {
  id: string;
  imageUrl: string;
  createdAt: string;
  playedOn: string;
  rating: number;
  isDraft: boolean;
  translations: ArtworkTranslation[];
  genres: GenreResponse[];

  constructor(storageService: StorageService, artwork: Artwork) {
    this.id = artwork.id;
    this.imageUrl = storageService.getImageUrl(artwork.imageKey);
    this.createdAt = artwork.createdAt?.toISOString() ?? '';
    this.playedOn = artwork.playedOn ?? '';
    this.rating = artwork.rating ?? -1; // 0 이하는 무효한 값이므로, null 일 경우엔 일부러 무효한 값을 지정
    this.isDraft = artwork.isDraft;
    this.translations = artwork.translations ?? [];
    this.genres =
      artwork.genres?.map((genre) => new GenreResponse(genre)) ?? [];
  }
}

@Injectable()
export class ArtworkListResponse {
  items: ArtworkResponse[];
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
      (artwork) => new ArtworkResponse(storageService, artwork),
    );
    this.metadata = {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage,
      pageSize,
    };
  }
}
