import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';

import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Series } from '@/src/modules/series/entities/series.entity';

@Entity()
@Index(['seriesId', 'artworkId'], { unique: true })
export class SeriesArtwork {
  /**
   * 시리즈의 고유 ID
   */
  @PrimaryColumn()
  seriesId: string;

  /**
   * 작품의 고유 ID
   */
  @PrimaryColumn()
  artworkId: string;

  /**
   * 시리즈 내 작품 순서(0부터 시작)
   */
  @Column({ type: 'integer', default: 0 })
  order: number;

  /**
   * 시리즈 관계
   */
  @ManyToOne(() => Series, (series: Series) => series.seriesArtworks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seriesId' })
  series: Relation<Series>;

  /**
   * 작품 관계
   */
  @ManyToOne(() => Artwork, (artwork: Artwork) => artwork.seriesArtworks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artworkId' })
  artwork: Relation<Artwork>;
}
