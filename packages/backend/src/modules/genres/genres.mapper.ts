import { Injectable } from '@nestjs/common';

import { Language } from '@/src/common/enums/language.enum';
import { BaseMapper } from '@/src/common/interfaces/base.mapper';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

@Injectable()
export class GenresMapper
  implements BaseMapper<Genre, CreateGenreDto, UpdateGenreDto>
{
  toEntityForCreate(createDto: CreateGenreDto): Partial<Genre> {
    return {
      translations: [
        { language: Language.KO, name: createDto.koName },
        { language: Language.EN, name: createDto.enName },
        { language: Language.JA, name: createDto.jaName },
      ] as GenreTranslation[],
    };
  }

  toEntityForUpdate(updateDto: UpdateGenreDto, id: string): Partial<Genre> {
    const translations: GenreTranslation[] = [];
    this.addTranslationIfNeeded(translations, Language.KO, updateDto.koName);
    this.addTranslationIfNeeded(translations, Language.EN, updateDto.enName);
    this.addTranslationIfNeeded(translations, Language.JA, updateDto.jaName);

    return { id, translations };
  }

  private addTranslationIfNeeded(
    translations: Partial<GenreTranslation>[],
    language: Language,
    name?: string,
  ): void {
    if (name === undefined) return;

    translations.push({ language, name });
  }
}
