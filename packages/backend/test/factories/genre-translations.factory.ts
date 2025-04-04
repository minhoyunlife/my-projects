import { Language } from '@/src/common/enums/language.enum';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';

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
