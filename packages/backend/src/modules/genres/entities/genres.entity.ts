import { Entity, Index, OneToMany } from 'typeorm';

import { NanoId } from '@/src/common/decorators/id.decorator';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';

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
   * 장르명을 다언어로 관리하기 위한 번역 정보
   */
  @OneToMany(() => GenreTranslation, (translation) => translation.genre, {
    cascade: true,
  })
  translations: GenreTranslation[];
}
