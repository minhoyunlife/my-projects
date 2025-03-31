import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/src/common/interfaces/base.mapper';
import { Language } from '@/src/modules/genres/enums/language.enum';
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

  // TODO: 미구현 단계로, 시리즈 업데이트 구현 시 작업할 것.
  toEntityForUpdate(updateDto: UpdateSeriesDto, id: string): Partial<Series> {
    return {};
  }
}
