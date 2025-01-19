import {
  Entity,
  Column,
  Index,
  Check,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';

import { NanoId } from '@/src/common/decorators/id.decorator';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

/**
 * 작품 정보를 DB에서 관리하기 위한 엔티티
 */
@Entity()
@Check(`"rating" >= 0 AND "rating" <= 20`)
export class Artwork {
  /**
   * 작품의 고유 ID
   */
  @NanoId()
  @Index()
  id: string;

  /**
   * 작품의 S3 이미지 키 값
   */
  @Column({ nullable: false })
  imageKey: string;

  /**
   * 작품 완성 일자
   */
  @Column({ type: 'timestamp', nullable: true })
  createdAt: Date;

  /**
   * 작품 대상 게임을 즐긴 플랫폼
   */
  @Column({
    type: 'enum',
    enum: Platform,
    nullable: true,
  })
  playedOn: Platform;

  /**
   * 작품 대상 게임에 대한 개인적인 평점
   */
  @Column('smallint', {
    nullable: true,
    comment: '0-20 사이의 정수값 (4로 나누면 실제 별점이 됨)',
  })
  rating: number;

  // TODO: 프론트 구현 방식에 따라, 작품 이미지로부터 주요 색상들을 추출한 값을 저장할 칼럼을 추가할지도?
  // colorPalette: string[];

  /**
   * 작품 공개 여부
   */
  @Column({ default: true })
  isDraft: boolean;

  /**
   * 작품 대상 게임의 장르
   */
  @ManyToMany(() => Genre, (genre) => genre.artworks)
  @JoinTable()
  genres: Genre[];

  /**
   * 작품 정보를 다언어로 관리하기 위한 번역 정보
   */
  @OneToMany(() => ArtworkTranslation, (translation) => translation.artwork, {
    cascade: true,
  })
  translations: ArtworkTranslation[];
}
