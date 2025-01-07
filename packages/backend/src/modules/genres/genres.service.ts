import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { GetGenresQueryDto } from '@/src/modules/genres/dtos/get-genres-query.dto';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenresController } from '@/src/modules/genres/genres.controller';
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
      pageSize: GenresController.PAGE_SIZE,
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
}
