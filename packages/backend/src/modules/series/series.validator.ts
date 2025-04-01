import { Injectable } from '@nestjs/common';

import { Language } from '@/src/modules/genres/enums/language.enum';
import { Series } from '@/src/modules/series/entities/series.entity';
import {
  SeriesErrorCode,
  SeriesException,
} from '@/src/modules/series/series.exception';

@Injectable()
export class SeriesValidator {
  assertTranslationsExist(series: Partial<Series>): void {
    if (
      series.translations &&
      series.translations.length === Object.values(Language).length
    )
      return;

    throw new SeriesException(
      SeriesErrorCode.NOT_ENOUGH_TRANSLATIONS,
      'All language translations are required',
      {
        languages: Object.values(Language).filter(
          (lang) => !series.translations?.map((t) => t.language).includes(lang),
        ),
      },
    );
  }

  assertDuplicatesNotExist(duplicates: Series[]): void {
    if (duplicates.length === 0) return;

    throw new SeriesException(
      SeriesErrorCode.DUPLICATE_TITLE,
      "Some of the provided series' title are duplicated",
      {
        titles: [
          ...new Set(
            duplicates.flatMap((series) =>
              series.translations.map((t) => t.title),
            ),
          ),
        ],
      },
    );
  }
}
