import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

export class GenresFactory {
  static createTestData(
    override: Partial<Genre> = {},
    translations: Partial<GenreTranslation>[] = [],
  ): Partial<Genre> {
    return {
      translations: translations as GenreTranslation[],
      ...override,
    };
  }
}
