import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';

export class SeriesFactory {
  static createTestData(
    override: Partial<Series> = {},
    translations: Partial<SeriesTranslation>[] = [],
  ): Partial<Series> {
    return {
      translations: translations as SeriesTranslation[],
      ...override,
    };
  }
}
