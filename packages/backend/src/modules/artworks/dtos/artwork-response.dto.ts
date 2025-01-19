import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreResponse } from '@/src/modules/genres/dtos/genre-response.dto';

export class ArtworkResponse {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  genres: GenreResponse[];
  playedOn: string;
  rating: number;
  shortReview: string;
  isDraft: boolean;

  constructor(artwork: Artwork) {
    this.id = artwork.id;
    this.title = artwork.title;
    this.imageUrl = 'https://example.com/img.png'; // TODO: 액세스 가능한 URL 로 변환하는 처리 구현 후 수정할 것.
    this.createdAt = artwork.createdAt?.toISOString() ?? '';
    this.genres =
      artwork.genres?.map((genre) => new GenreResponse(genre)) ?? [];
    this.playedOn = artwork.playedOn ?? '';
    this.rating = artwork.rating ?? -1; // 0 이하는 무효한 값이므로, null 일 경우엔 일부러 무효한 값을 지정
    this.shortReview = artwork.shortReview ?? '';
    this.isDraft = artwork.isDraft;
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
