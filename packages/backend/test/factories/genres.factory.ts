import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';

export class GenresFactory {
  static createTestData(override: Partial<Genre> = {}): Partial<Genre> {
    return {
      translations: [
        { language: Language.KO, name: '액션' } as GenreTranslation,
        { language: Language.EN, name: 'Action' } as GenreTranslation,
        { language: Language.JA, name: 'アクション' } as GenreTranslation,
      ],
      ...override,
    };
  }
}
