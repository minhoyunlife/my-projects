import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import type { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';

/**
 * 작품 정보를 다언어로 DB에서 관리하기 위한 엔티티
 */
@Entity()
@Index(['artworkId', 'language'], { unique: true })
export class ArtworkTranslation {
  /**
   * 작품의 고유 ID
   */
  @PrimaryColumn()
  artworkId: string;

  /**
   * 작품의 언어 코드
   */
  @PrimaryColumn({ type: 'enum', enum: Language })
  language: Language; // ISO 639-1 언어 코드(ko, en, ja 등)

  /**
   * 작품 대상인 게임의 제목
   */
  @Column({ nullable: false })
  title: string;

  /**
   * 작품 대상 게임에 대한 개인적인 한줄평
   */
  @Column({ nullable: true })
  shortReview: string;

  /**
   * 관계
   */
  @ManyToOne('Artwork', (artwork: Artwork) => artwork.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artworkId' })
  artwork: Artwork;
}
