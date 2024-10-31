import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { TransactionalRepository } from '@/src/common/repositories/transactional.repository';
import { Artwork } from '@/src/modules/artworks/artworks.entity';

@Injectable()
export class ArtworksRepository extends TransactionalRepository<Artwork> {
  constructor(
    @InjectRepository(Artwork)
    private readonly repository: Repository<Artwork>,
  ) {
    super(Artwork, repository);
  }

  /**
   * 트랜잭션용 작품 리포지토리 인스턴스를 반환하기 위한 세컨드 컨스트럭터
   * @param {EntityManager} entityManager - 트랜잭션를 처리하는 엔티티 매니저
   * @returns {ArtworksRepository} - 트랜잭션용 작품 리포지토리 인스턴스
   */
  forTransaction(entityManager: EntityManager): ArtworksRepository {
    return new ArtworksRepository(entityManager.getRepository(Artwork));
  }

  /**
   * 작품 데이터를 생성
   * @param {Partial<Artwork>} artworkData - 생성할 작품 데이터
   * @returns {Promise<Artwork>} 생성된 작품
   */
  async createOne(artworkData: Partial<Artwork>): Promise<Artwork> {
    const artwork = this.create(artworkData);
    return this.save(artwork);
  }
}
