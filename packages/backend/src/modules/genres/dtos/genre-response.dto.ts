import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenreTranslation } from '@/src/modules/genres/interfaces/genre-translations.interface';

export class GenreResponse {
  id: string;
  translations: GenreTranslation[];

  constructor(genre: Genre) {
    this.id = genre.id;
    this.translations = genre.translations ?? [];
  }
}

export class GenreListResponse {
  items: GenreResponse[];
  metadata: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };

  constructor(
    genres: Genre[],
    totalCount: number,
    currentPage: number,
    pageSize: number,
  ) {
    this.items = genres.map((genre) => new GenreResponse(genre));
    this.metadata = {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage,
      pageSize,
    };
  }
}
