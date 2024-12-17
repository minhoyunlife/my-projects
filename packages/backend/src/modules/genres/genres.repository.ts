import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, In, Repository } from 'typeorm';

import { TransactionalRepository } from '@/src/common/repositories/transactional.repository';
import { Genre } from '@/src/modules/genres/genres.entity';

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
   * 주어진 이름으로, 데이터베이스에 존재하는 장르의 ID들을 찾음
   * @param {string[]} names - 찾을 장르 이름들
   * @returns {Promise<string[]>} - 찾은 장르의 ID들
   */
  async findGenreIdsByNames(names: string[]): Promise<string[]> {
    const genres = await this.find({
      select: { id: true },
      where: { name: In(names) },
    });
    return genres.map((genre) => genre.id);
  }

  /**
   * 주어진 이름으로, 데이터베이스에 존재하지 않는 장르를 일괄 생성
   * @param {string[]} names - 생성할 장르 이름들
   * @returns {Promise<Genre[]>} - 생성된 장르들
   */
  async bulkCreateIfNotExist(names: string[]): Promise<Genre[]> {
    if (names.length === 0) {
      return [];
    }

    const existingGenres = await this.find({ where: { name: In(names) } });
    const existingNames = existingGenres.map((genre) => genre.name);

    const newGenres = names
      .filter((name) => !existingNames.includes(name))
      .map((name) => this.create({ name }));

    const savedNewGenres = await this.save(newGenres);
    return [...existingGenres, ...savedNewGenres];
  }
}
