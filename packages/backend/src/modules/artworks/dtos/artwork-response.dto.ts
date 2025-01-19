<<<<<<< HEAD
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
=======
>>>>>>> 3ddd721 (chore: move current entity to sub folder)
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreResponse } from '@/src/modules/genres/dtos/genre-response.dto';

export class ArtworkResponse {
  id: string;
  imageUrl: string;
  createdAt: string;
  playedOn: string;
  rating: number;
  isDraft: boolean;
  translations: ArtworkTranslation[];
  genres: GenreResponse[];

  constructor(artwork: Artwork) {
    this.id = artwork.id;
    this.imageUrl = 'https://example.com/img.png'; // TODO: 액세스 가능한 URL 로 변환하는 처리 구현 후 수정할 것.
    this.createdAt = artwork.createdAt?.toISOString() ?? '';
    this.playedOn = artwork.playedOn ?? '';
    this.rating = artwork.rating ?? -1; // 0 이하는 무효한 값이므로, null 일 경우엔 일부러 무효한 값을 지정
    this.isDraft = artwork.isDraft;
    this.translations = artwork.translations ?? [];
    this.genres =
      artwork.genres?.map((genre) => new GenreResponse(genre)) ?? [];
  }
}

export class ArtworkListResponse {
  items: ArtworkResponse[];
  metadata: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };

  constructor(
    artworks: Artwork[],
    totalCount: number,
    currentPage: number,
    pageSize: number,
  ) {
    this.items = artworks.map((artwork) => new ArtworkResponse(artwork));
    this.metadata = {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage,
      pageSize,
    };
  }
}
