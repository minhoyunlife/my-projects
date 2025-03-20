import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenreTranslation } from '@/src/modules/genres/interfaces/genre-translations.interface';

/**
 * 단일 장르 응답용 DTO
 */
export class GenreResponse {
  id: string;
  translations: GenreTranslation[];

  constructor(genre: Genre) {
    this.id = genre.id;
    this.translations = genre.translations ?? [];
  }
}

/**
 * 페이지네이션을 포함한 장르 리스트 응답용 DTO
 */
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

/**
 * 페이지네이션을 포함하지 않는, 장르 검색 결과 리스트 응답용 DTO
 */
export class GenreSearchResponse {
  items: GenreResponse[];

  constructor(genres: Genre[]) {
    this.items = genres.map((genre) => new GenreResponse(genre));
  }
}
