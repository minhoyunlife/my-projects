import { Injectable } from '@nestjs/common';

import { Language } from '@/src/modules/genres/enums/language.enum';
import { UpdateSeriesDto } from '@/src/modules/series/dtos/update-series.dto';
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

  assertAllSeriesExist(series: Series[], ids: string[]): void {
    if (series.length === ids.length) return;

    throw new SeriesException(
      SeriesErrorCode.NOT_FOUND,
      'Some of the provided series do not exist',
      {
        ids: ids.filter((id) => !new Set(series.map((s) => s.id)).has(id)),
      },
    );
  }

  assertSeriesNotInUse(series: Series[]): void {
    const seriesInUse = series.filter((s) => s.seriesArtworks.length > 0);
    if (seriesInUse.length === 0) return;

    throw new SeriesException(
      SeriesErrorCode.IN_USE,
      'Some of the series are in use by artworks',
      {
        koTitles: seriesInUse.map(
          (s) => s.translations.find((t) => t.language === Language.KO)?.title,
        ),
      },
    );
  }

  assertAtLeastOneTranslationTitleExist(dto: UpdateSeriesDto): void {
    if (dto.koTitle || dto.enTitle || dto.jaTitle) return;

    throw new SeriesException(
      SeriesErrorCode.NO_TRANSLATIONS_PROVIDED,
      'At least one translation must be provided',
      {
        translations: ['At least one translation is required to update series'],
      },
    );
  }

  assertSeriesExists(series: Series): void {
    if (series) return;

    throw new SeriesException(
      SeriesErrorCode.NOT_FOUND,
      'The series with the provided ID does not exist',
    );
  }
}
