import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, In, Repository } from 'typeorm';

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
    let query = this.createQueryBuilder('genre').leftJoinAndSelect(
      'genre.translations',
      'translation',
    );

    if (filters.search) {
      // 일단 특정 번역 정보를 가진 장르의 ID만 조회 후,
      const subQuery = this.createQueryBuilder()
        .select('DISTINCT genre.id')
        .from(Genre, 'genre')
        .leftJoin('genre.translations', 'translation')
        .where('translation.name ILIKE :search', {
          search: `%${filters.search}%`,
        });

      // 해당 장르의 ID 목록을 기반으로 모든 정보가 포함된 장르 데이터를 조회
      query = query
        .where(`genre.id IN (${subQuery.getQuery()})`)
        .setParameters(subQuery.getParameters());
    }

    query.orderBy('genre.id', 'ASC');

    query.skip((filters.page - 1) * filters.pageSize).take(filters.pageSize);

    return await query.getManyAndCount();
  }

  /**
   * 장르 데이터를 검색어를 통해 필터링하여 최대 10건까지 조회
   * @param {string} search - 검색어
   * @param {number} limit - 조회 제한 개수
   * @returns {Promise<Genre[]>} - 장르 데이터
   */
  async findByName(search: string): Promise<Genre[]> {
    // 장르 이름이 검색어를 포함하는 장르 ID 목록을 서브쿼리로 조회
    const subQuery = this.createQueryBuilder()
      .subQuery()
      .select('DISTINCT genre.id')
      .from(Genre, 'genre')
      .innerJoin('genre.translations', 'translation')
      .where('translation.name ILIKE :search', { search: `%${search}%` })
      .limit(10)
      .getQuery();

    // 서브쿼리의 ID 목록을 바탕으로 장르 데이터 및 번역 정보의 쌍을 조회
    return this.createQueryBuilder('genre')
      .innerJoinAndSelect('genre.translations', 'translation')
      .where(`genre.id IN ${subQuery}`)
      .setParameter('search', `%${search}%`)
      .orderBy('genre.id', 'ASC')
      .getMany();
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
    await this.checkDuplicateNames(names);

    const genre = this.create(genreData);
    return this.save(genre);
  }

  /**
   * 장르 데이터를 수정
   * @param {Partial<Genre>} genreData - 수정할 장르 데이터
   * @returns {Promise<Genre>} 수정된 장르
   */
  async updateOne(genreData: Partial<Genre>): Promise<Genre> {
    const genre = await this.findOne({
      where: { id: genreData.id },
      relations: ['translations'],
    });

    if (!genre) {
      throw new GenreException(
        GenreErrorCode.NOT_FOUND,
        'The genre with the provided ID does not exist',
      );
    }

    const translationsToUpdate = genreData.translations;
    const names = translationsToUpdate.map((t) => t.name);

    await this.checkDuplicateNames(names, genre.id);

    translationsToUpdate.forEach((newTranslation) => {
      const existingTranslation = genre.translations.find(
        (t) => t.language === newTranslation.language,
      );

      if (existingTranslation) {
        existingTranslation.name = newTranslation.name;
      }
    });

    return this.save(genre);
  }

  /**
   * 복수의 장르 데이터를 삭제
   * @param {string[]} ids - 삭제할 장르 ID 배열
   */
  async deleteMany(ids: string[]): Promise<void> {
    const genres = await this.findBy({ id: In(ids) });
    if (genres.length !== ids.length) {
      const foundIds = new Set(genres.map((g) => g.id));
      const notFoundIds = ids.filter((id) => !foundIds.has(id));

      throw new GenreException(
        GenreErrorCode.NOT_FOUND,
        'Some of the provided genres do not exist',
        {
          ids: notFoundIds,
        },
      );
    }

    const genresInUse = await this.createQueryBuilder('genre')
      .innerJoin('genre.artworks', 'artwork')
      .where('genre.id IN (:...ids)', { ids })
      .getMany();

    if (genresInUse.length > 0) {
      throw new GenreException(
        GenreErrorCode.IN_USE,
        'Some of the genres are in use by artworks',
        {
          ids: genresInUse.map((g) => g.id),
        },
      );
    }

    await this.remove(genres);
  }

  private async checkDuplicateNames(
    names: string[],
    genreIdToExclude?: string,
  ) {
    const query = this.createQueryBuilder('genre')
      .innerJoinAndSelect('genre.translations', 'translation')
      .where('translation.name IN (:...names)', { names });

    // 지정한 장르 ID 에서 이미 등록되어 있는 이름을 제외한 나머지만을 조회하도록
    if (genreIdToExclude) {
      query.andWhere('genre.id != :id', { id: genreIdToExclude });
    }

    const duplicates = await query.getMany();

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
  }
}
