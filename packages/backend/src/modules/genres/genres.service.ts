import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { GetGenresQueryDto } from '@/src/modules/genres/dtos/get-genres-query.dto';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';
import { GenresRepository } from '@/src/modules/genres/genres.repository';

@Injectable()
export class GenresService {
  constructor(
    private readonly genresRepository: GenresRepository,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * 장르 목록을 쿼리의 조건에 맞춰서 조회
   *
   * @param query 장르 목록을 조회하기 위한 쿼리 정보
   * @param query.page 페이지 번호 (기본값: 1)
   * @param query.search 장르명 검색어
   * @returns 장르 목록과 총 장르 수
   */
  async getGenres(query: GetGenresQueryDto): Promise<EntityList<Genre>> {
    const page = query.page ?? 1;
    const search = query.search ?? undefined;

    const [items, totalCount] = await this.genresRepository.getAllWithFilters({
      page,
      pageSize: PAGE_SIZE.CMS,
      search,
    });

    return {
      items,
      totalCount,
    };
  }

  /**
   * 새로운 장르를 생성
   * @param dto - 장르 생성 정보를 담은 DTO
   * @returns 생성된 장르
   */
  async createGenre(dto: CreateGenreDto): Promise<Genre> {
    return this.entityManager.transaction(async (manager) => {
      const genresTxRepo = this.genresRepository.forTransaction(manager);

      const genreData: Partial<Genre> = {
        translations: [
          { language: Language.KO, name: dto.koName },
          { language: Language.EN, name: dto.enName },
          { language: Language.JA, name: dto.jaName },
        ] as GenreTranslation[],
      };

      return await genresTxRepo.createOne(genreData);
    });
  }

  /**
   * 기존 장르를 수정
   * @param id - 수정할 장르의 ID
   * @param dto - 장르명의 수정 정보를 담은 DTO
   * @returns 수정된 장르
   */
  async updateGenre(id: string, dto: UpdateGenreDto): Promise<Genre> {
    if (!dto.koName && !dto.enName && !dto.jaName) {
      throw new GenreException(
        GenreErrorCode.NO_TRANSLATIONS_PROVIDED,
        'At least one translation must be provided',
        {
          translations: [
            'At least one translation is required to update genre',
          ],
        },
      );
    }

    return this.entityManager.transaction(async (manager) => {
      const genresTxRepo = this.genresRepository.forTransaction(manager);

      const translations = [];
      if (dto.koName) {
        translations.push({ language: Language.KO, name: dto.koName });
      }
      if (dto.enName) {
        translations.push({ language: Language.EN, name: dto.enName });
      }
      if (dto.jaName) {
        translations.push({ language: Language.JA, name: dto.jaName });
      }

      const genreData: Partial<Genre> = {
        id,
        translations,
      };

      return await genresTxRepo.updateOne(genreData);
    });
  }
}
