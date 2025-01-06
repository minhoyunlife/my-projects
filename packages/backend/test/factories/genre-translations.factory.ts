import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';

export class GenreTranslationsFactory {
  static createTestData(
    override: Partial<GenreTranslation> = {},
  ): Partial<GenreTranslation> {
    return {
      language: Language.KO,
      name: '액션',
      ...override,
    };
  }
}
