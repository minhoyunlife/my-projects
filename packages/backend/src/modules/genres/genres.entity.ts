import { Entity, Column, Index } from 'typeorm';

import { NanoId } from '@/src/common/decorators/id.decorator';

/**
 * 장르 정보를 DB에서 관리하기 위한 엔티티
 */
@Entity()
export class Genre {
  /**
   * 장르의 고유 ID
   */
  @NanoId()
  @Index()
  id: string;

  /**
   * 장르명
   */
  @Column({ unique: true, nullable: false })
  name: string;
}
