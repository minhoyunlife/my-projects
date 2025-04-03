import { Injectable } from '@nestjs/common';

import { Language } from '@/src/common/enums/language.enum';
import { BaseMapper } from '@/src/common/interfaces/base.mapper';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { UpdateSeriesDto } from '@/src/modules/series/dtos/update-series.dto';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';

@Injectable()
export class SeriesMapper
  implements BaseMapper<Series, CreateSeriesDto, UpdateSeriesDto>
{
  toEntityForCreate(createDto: CreateSeriesDto): Partial<Series> {
    return {
      translations: [
        { language: Language.KO, title: createDto.koTitle },
        { language: Language.EN, title: createDto.enTitle },
        { language: Language.JA, title: createDto.jaTitle },
      ] as SeriesTranslation[],
      seriesArtworks: [], // 신규 작성 시에는 연결된 아트워크가 없음
    };
  }

  toEntityForUpdate(updateDto: UpdateSeriesDto, id: string): Partial<Series> {
    const translations: SeriesTranslation[] = [];
    this.addTranslationIfNeeded(translations, Language.KO, updateDto.koTitle);
    this.addTranslationIfNeeded(translations, Language.EN, updateDto.enTitle);
    this.addTranslationIfNeeded(translations, Language.JA, updateDto.jaTitle);

    return { id, translations };
  }

  private addTranslationIfNeeded(
    translations: Partial<SeriesTranslation>[],
    language: Language,
    title?: string,
  ): void {
    if (title === undefined) return;

    translations.push({ language, title });
  }
}
