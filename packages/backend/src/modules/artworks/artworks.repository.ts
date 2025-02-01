import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, In, Repository } from 'typeorm';

import { TransactionalRepository } from '@/src/common/repositories/transactional.repository';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import {
  ArtworkErrorCode,
  ArtworkException,
} from '@/src/modules/artworks/exceptions/artworks.exception';
import { Language } from '@/src/modules/genres/enums/language.enum';

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
    let query = this.createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.genres', 'genre')
      .leftJoinAndSelect('genre.translations', 'translation')
      .leftJoinAndSelect('artwork.translations', 'artworkTranslation');

    if (filters.genreIds?.length) {
      // 일단 특정 장르를 가진 작품의 ID만 조회 후,
      const subQuery = this.createQueryBuilder()
        .select('DISTINCT artwork.id')
        .from(Artwork, 'artwork')
        .leftJoin('artwork.genres', 'genre')
        .where('genre.id IN (:...genreIds)', { genreIds: filters.genreIds });

      // 해당 작품의 ID 목록을 기반으로 모든 정보가 포함된 작품 데이터를 조회
      query = query
        .where(`artwork.id IN (${subQuery.getQuery()})`)
        .setParameters(subQuery.getParameters());
    }

    query.andWhere('artwork.isDraft IN (:...isDraftIn)', {
      isDraftIn: filters.isDraftIn,
    });

    if (filters.search) {
      query.innerJoin(
        'artwork.translations',
        'searchTranslation',
        'searchTranslation.title ILIKE :search',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.platforms?.length) {
      query.andWhere('artwork.playedOn IN (:...platforms)', {
        platforms: filters.platforms,
      });
    }

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

    query.skip((filters.page - 1) * filters.pageSize).take(filters.pageSize);

    return await query.getManyAndCount();
  }

  /**
   * ID 목록으로 작품 상세 정보를 조회
   * @param {string[]} ids - 조회할 작품 ID 배열
   * @returns {Promise<Artwork[]>} 작품 상세 정보 배열
   */
  async findManyWithDetails(ids: string[]): Promise<Artwork[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.translations', 'translation')
      .leftJoinAndSelect('artwork.genres', 'genre')
      .where('artwork.id IN (:...ids)', { ids })
      .getMany();
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

  /**
   * 작품들의 상태(isDraft)를 업데이트
   * @param {string[]} ids - 상태를 변경할 작품 ID들
   * @param {boolean} setPublished - 변경할 상태 값
   */
  async updateManyStatuses(
    ids: string[],
    setPublished: boolean,
  ): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await this.repository
      .createQueryBuilder()
      .update(Artwork)
      .set({ isDraft: !setPublished })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  /**
   * 복수의 작품 데이터를 삭제
   * @param {string[]} ids - 삭제할 작품 ID 배열
   */
  async deleteMany(ids: string[]): Promise<Artwork[]> {
    const artworks = await this.find({
      where: { id: In(ids) },
      relations: ['translations'],
    });

    if (artworks.length !== ids.length) {
      const foundIds = new Set(artworks.map((a) => a.id));
      const notFoundIds = ids.filter((id) => !foundIds.has(id));

      throw new ArtworkException(
        ArtworkErrorCode.NOT_FOUND,
        'Some of the provided artworks do not exist',
        {
          ids: notFoundIds,
        },
      );
    }

    const publishedArtworks = artworks.filter((artwork) => !artwork.isDraft);
    if (publishedArtworks.length > 0) {
      throw new ArtworkException(
        ArtworkErrorCode.ALREADY_PUBLISHED,
        'Cannot delete published artworks',
        {
          titles: publishedArtworks.map(
            (a) =>
              a.translations.find((t) => t.language === Language.KO)?.title,
          ),
        },
      );
    }

    const deletedArtworks = await this.remove(artworks);
    return deletedArtworks;
  }
}
