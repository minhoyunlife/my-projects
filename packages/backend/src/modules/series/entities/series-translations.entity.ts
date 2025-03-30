import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { Language } from '@/src/modules/genres/enums/language.enum';
import { Series } from '@/src/modules/series/entities/series.entity';

@Entity()
@Index(['seriesId', 'language'], { unique: true })
export class SeriesTranslation {
  /**
   * 시리즈의 고유 ID
   */
  @PrimaryColumn()
  seriesId: string;

  /**
   * 시리즈의 언어 코드
   */
  @PrimaryColumn({ type: 'enum', enum: Language })
  language: Language; // ISO 639-1 언어 코드(ko, en, ja 등)

  /**
   * 시리즈의 언어별 이름
   */
  @Column({ unique: true })
  title: string;

  /**
   * 관계
   */
  @ManyToOne(() => Series, (series: Series) => series.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seriesId' })
  series: Relation<Series>;
}
