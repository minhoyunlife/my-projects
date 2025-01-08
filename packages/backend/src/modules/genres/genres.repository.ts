import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { TransactionalRepository } from '@/src/common/repositories/transactional.repository';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';

@Injectable()
export class GenresRepository extends TransactionalRepository<Genre> {
  constructor(
    @InjectRepository(Genre)
    repository: Repository<Genre>,
  ) {
    super(Genre, repository);
  }

  /**
   * 트랜잭션용 장르 리포지토리 인스턴스를 반환하기 위한 세컨드 컨스트럭터
   * @param {EntityManager} entityManager - 트랜잭션를 처리하는 엔티티 매니저
   * @returns {GenresRepository} - 트랜잭션용 장르 리포지토리 인스턴스
   */
  forTransaction(entityManager: EntityManager): GenresRepository {
    return new GenresRepository(entityManager.getRepository(Genre));
  }

  /**
   * 장르 데이터를 필터링하여 조회
   * @param {Object} filters - 필터링 조건
   * @returns {Promise<[Genre[], number]>} - 장르 데이터와 총 개수
   */
  async getAllWithFilters(filters: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<[Genre[], number]> {
    const query = this.createQueryBuilder('genre').leftJoinAndSelect(
      'genre.translations',
      'translation',
    );

    if (filters.search) {
      query.andWhere('translation.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    query.orderBy('genre.id', 'ASC');

    query.skip((filters.page - 1) * filters.pageSize).take(filters.pageSize);

    return await query.getManyAndCount();
  }

  /**
   * 장르 데이터를 생성
   * @param {Partial<Genre>} genreData - 생성할 장르 데이터
   * @returns {Promise<Genre>} 생성된 장르
   */
  async createOne(genreData: Partial<Genre>): Promise<Genre> {
    if (
      !genreData.translations ||
      genreData.translations.length !== Object.values(Language).length
    ) {
      const providedLanguages = genreData.translations?.map((t) => t.language);
      const missingLanguages = Object.values(Language).filter(
        (lang) => !providedLanguages.includes(lang),
      );

      throw new GenreException(
        GenreErrorCode.NOT_ENOUGH_TRANSLATIONS,
        'All language translations are required',
        {
          languages: missingLanguages,
        },
      );
    }

    const names = genreData.translations.map((t) => t.name);

    const duplicates = await this.createQueryBuilder('genre')
      .innerJoinAndSelect('genre.translations', 'translation')
      .where('translation.name IN (:...names)', { names })
      .getMany();

    if (duplicates.length > 0) {
      const duplicateNames = duplicates.flatMap((genre) =>
        genre.translations.map((t) => t.name),
      );

      throw new GenreException(
        GenreErrorCode.DUPLICATE_NAME,
        "Some of the provided genre's names are duplicated",
        {
          names: [...new Set(duplicateNames)],
        },
      );
    }

    const genre = this.create(genreData);
    return this.save(genre);
  }
}
