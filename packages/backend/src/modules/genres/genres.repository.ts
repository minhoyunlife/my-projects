import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { TransactionalRepository } from '@/src/common/repositories/transactional.repository';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

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
}
