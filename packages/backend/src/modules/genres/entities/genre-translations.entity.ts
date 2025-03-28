import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import type { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';

/**
 * 장르명을 다언어로 DB에서 관리하기 위한 엔티티
 */
@Entity()
@Index(['genreId', 'language'], { unique: true })
export class GenreTranslation {
  /**
   * 장르의 고유 ID
   */
  @PrimaryColumn()
  genreId: string;

  /**
   * 장르의 언어 코드
   */
  @PrimaryColumn({ type: 'enum', enum: Language })
  language: Language; // ISO 639-1 언어 코드(ko, en, ja 등)

  /**
   * 장르의 언어별 이름
   */
  @Column({ unique: true })
  name: string;

  /**
   * 관계
   */
  @ManyToOne('Genre', (genre: Genre) => genre.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'genreId' })
  genre: Genre;
}
