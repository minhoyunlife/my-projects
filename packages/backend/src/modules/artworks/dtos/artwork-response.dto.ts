import { Artwork } from '@/src/modules/artworks/artworks.entity';
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
    this.imageUrl = artwork.imageUrl;
    this.createdAt = artwork.createdAt?.toISOString() ?? '';
    this.genres =
      artwork.genres?.map((genre) => new GenreResponse(genre)) ?? [];
    this.playedOn = artwork.playedOn ?? '';
    this.rating = artwork.rating ?? -1; // 0 이하는 무효한 값이므로, null 일 경우엔 일부러 무효한 값을 지정
    this.shortReview = artwork.shortReview ?? '';
    this.isDraft = artwork.isDraft;
  }
}
