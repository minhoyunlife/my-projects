import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { TransactionalRepository } from '@/src/common/repositories/transactional.repository';
import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';

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
   * 작품 데이터를 필터링하여 조회
   * @param {Object} filters - 필터링 조건
   * @returns {Promise<[Artwork[], number]>} - 작품 데이터와 총 개수
   */
  async getAllWithFilters(filters: {
    page: number;
    pageSize: number;
    sort: SortType;
    platforms?: Platform[];
    genreIds?: string[];
    search?: string;
    isDraftIn: boolean[];
  }): Promise<[Artwork[], number]> {
    const query = this.createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.genres', 'genre')
      .leftJoinAndSelect('genre.translations', 'translation');

    // 상태를 기반으로 필터
    query.where('artwork.isDraft IN (:...isDraftIn)', {
      isDraftIn: filters.isDraftIn,
    });

    // 검색어를 기반으로 필터
    if (filters.search) {
      query.andWhere('artwork.title ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    // 플랫폼 필터
    if (filters.platforms?.length) {
      query.andWhere('artwork.playedOn IN (:...platforms)', {
        platforms: filters.platforms,
      });
    }

    // 장르 필터
    if (filters.genreIds?.length) {
      query.andWhere('genre.id IN (:...genreIds)', {
        genreIds: filters.genreIds,
      });
    }

    // 정렬
    switch (filters.sort) {
      case SortType.CREATED_DESC:
        query.orderBy('artwork.createdAt', 'DESC');
        break;
      case SortType.CREATED_ASC:
        query.orderBy('artwork.createdAt', 'ASC');
        break;
      case SortType.RATING_DESC:
        query.orderBy('artwork.rating', 'DESC');
        break;
      case SortType.RATING_ASC:
        query.orderBy('artwork.rating', 'ASC');
        break;
    }

    // 페이지네이션
    query.skip((filters.page - 1) * filters.pageSize).take(filters.pageSize);

    return await query.getManyAndCount();
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
