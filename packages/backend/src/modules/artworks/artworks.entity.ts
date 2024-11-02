import { Entity, Column, Index, Check, JoinTable, ManyToMany } from 'typeorm';

import { NanoId } from '@/src/common/decorators/id.decorator';
import { Platform } from '@/src/common/enums/platform.enum';
import { Genre } from '@/src/modules/genres/genres.entity';

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
   * 작품 대상인 게임의 제목
   */
  @Column({ nullable: false })
  title: string;

  /**
   * 작품의 이미지 URL
   */
  @Column({ nullable: false })
  imageUrl: string;

  /**
   * 작품 완성 일자
   */
  @Column({ type: 'date', nullable: true })
  createdAt: Date;

  /**
   * 작품 대상 게임의 장르
   */
  @ManyToMany(() => Genre)
  @JoinTable()
  genres: Genre[];

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

  /**
   * 작품 대상 게임에 대한 개인적인 한줄평
   */
  @Column({ nullable: true })
  shortReview: string;

  // TODO: 프론트 구현 방식에 따라, 작품 이미지로부터 주요 색상들을 추출한 값을 저장할 칼럼을 추가할지도?
  // colorPalette: string[];

  /**
   * 작품 공개 여부
   */
  @Column({ default: true })
  isDraft: boolean;
}
