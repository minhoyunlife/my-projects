import { Injectable } from '@nestjs/common';

import { Language } from '@/src/common/enums/language.enum';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';

@Injectable()
export class GenresValidator {
  assertAtLeastOneTranslationNameExist(dto: UpdateGenreDto) {
    if (dto.koName || dto.enName || dto.jaName) return;
    throw new GenreException(
      GenreErrorCode.NO_TRANSLATIONS_PROVIDED,
      'At least one translation must be provided',
      {
        translations: ['At least one translation is required to update genre'],
      },
    );
  }

  assertTranslationsExist(genre: Partial<Genre>): void {
    if (
      genre.translations &&
      genre.translations.length === Object.values(Language).length
    )
      return;

    throw new GenreException(
      GenreErrorCode.NOT_ENOUGH_TRANSLATIONS,
      'All language translations are required',
      {
        languages: Object.values(Language).filter(
          (lang) => !genre.translations?.map((t) => t.language).includes(lang),
        ),
      },
    );
  }

  assertGenreExist(genre: Genre): void {
    if (genre) return;

    throw new GenreException(
      GenreErrorCode.NOT_FOUND,
      'The genre with the provided ID does not exist',
    );
  }

  assertAllGenresExist(genres: Genre[], ids: string[]): void {
    if (genres.length === ids.length) return;

    throw new GenreException(
      GenreErrorCode.NOT_FOUND,
      'Some of the provided genres do not exist',
      {
        ids: ids.filter((id) => !new Set(genres.map((g) => g.id)).has(id)),
      },
    );
  }

  assertGenresNotInUse(genres: Genre[]): void {
    const genresInUse = genres.filter((g) => g.artworks.length > 0);
    if (genresInUse.length === 0) return;

    throw new GenreException(
      GenreErrorCode.IN_USE,
      'Some of the genres are in use by artworks',
      {
        koNames: genresInUse.map(
          (g) => g.translations.find((t) => t.language === Language.KO)?.name,
        ),
      },
    );
  }

  assertDuplicatesNotExist(duplicates: Genre[]): void {
    if (duplicates.length === 0) return;

    throw new GenreException(
      GenreErrorCode.DUPLICATE_NAME,
      "Some of the provided genre's names are duplicated",
      {
        names: [
          ...new Set(
            duplicates.flatMap((genre) =>
              genre.translations.map((t) => t.name),
            ),
          ),
        ],
      },
    );
  }
}
