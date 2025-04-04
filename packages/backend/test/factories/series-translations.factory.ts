import { Language } from '@/src/common/enums/language.enum';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';

export class SeriesTranslationsFactory {
  static createTestData(
    override: Partial<SeriesTranslation> = {},
  ): Partial<SeriesTranslation> {
    return {
      language: Language.KO,
      title: 'title',
      ...override,
    };
  }
}
