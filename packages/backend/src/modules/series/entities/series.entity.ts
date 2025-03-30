import { Entity, Index, OneToMany, type Relation } from 'typeorm';

import { NanoId } from '@/src/common/decorators/id.decorator';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';

@Entity()
export class Series {
  /**
   * 시리즈의 고유 ID
   */
  @NanoId()
  @Index()
  id: string;

  /**
   * 시리즈에 포함된 작품들의 연결 정보
   */
  @OneToMany(() => SeriesArtwork, (seriesArtwork) => seriesArtwork.series)
  seriesArtworks: Relation<SeriesArtwork[]>;

  /**
   * 시리즈 타이틀 이름을 다언어로 관리하기 위한 번역 정보
   */
  @OneToMany(() => SeriesTranslation, (translation) => translation.series, {
    cascade: true,
  })
  translations: Relation<SeriesTranslation[]>;
}
