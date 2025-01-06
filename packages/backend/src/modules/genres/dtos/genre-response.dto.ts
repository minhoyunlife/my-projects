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
