import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';

import { TransactionalRepository } from '@/src/common/repositories/transactional.repository';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Sort } from '@/src/modules/artworks/enums/sort-type.enum';
import {
  ArtworkErrorCode,
  ArtworkException,
} from '@/src/modules/artworks/exceptions/artworks.exception';
import { ArtworkFilter } from '@/src/modules/artworks/interfaces/filter.interface';
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

  async getAllWithFilters(
    filters: ArtworkFilter,
  ): Promise<[Artwork[], number]> {
    const query = this.createBaseArtworkQuery();

    this.applyGenreFilter(query, filters.genreIds);
    this.applyDraftFilter(query, filters.isDraftIn);
    this.applySearchFilter(query, filters.search);
    this.applyPlatformFilter(query, filters.platforms);
    this.applySort(query, filters.sort);
    this.applyPagination(query, filters.page, filters.pageSize);

    return await query.getManyAndCount();
  }

  async findManyWithDetails(ids: string[]): Promise<Artwork[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.createBaseArtworkQuery()
      .where('artwork.id IN (:...ids)', { ids })
      .getMany();
  }

  async createOne(artworkData: Partial<Artwork>): Promise<Artwork> {
    return this.save(this.create(artworkData));
  }

  async updateOne(artworkData: Partial<Artwork>): Promise<Artwork> {
    const artwork = await this.findOne({
      where: { id: artworkData.id },
      relations: ['translations', 'genres'],
    });

    this.assertArtworkExists(artwork);
    this.assertArtworkDraft(artwork);

    this.updateArtworkFields(artworkData, artwork);
    this.replaceTranslations(artworkData, artwork);

    return this.save(artwork);
  }

  async updateManyStatuses(
    ids: string[],
    setPublished: boolean,
  ): Promise<void> {
    if (ids.length === 0) return;
    await this.update({ id: In(ids) }, { isDraft: !setPublished });
  }

  async deleteMany(ids: string[]): Promise<Artwork[]> {
    const artworks = await this.find({
      where: { id: In(ids) },
      relations: ['translations'],
    });

    this.assertAllProvidedArtworksExist(artworks, ids);
    this.assertAllArtworksDraft(artworks);

    return this.remove(artworks);
  }

  private createBaseArtworkQuery(): SelectQueryBuilder<Artwork> {
    return this.createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.genres', 'genre')
      .leftJoinAndSelect('genre.translations', 'translation')
      .leftJoinAndSelect('artwork.translations', 'artworkTranslation');
  }

  private applyGenreFilter(
    query: SelectQueryBuilder<Artwork>,
    genreIds: string[],
  ): void {
    if (!genreIds || genreIds.length === 0) return;

    const subQuery = this.createQueryBuilder()
      .select('DISTINCT artwork.id')
      .from(Artwork, 'artwork')
      .leftJoin('artwork.genres', 'genre')
      .where('genre.id IN (:...genreIds)', { genreIds });

    query
      .where(`artwork.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters());
  }

  private applyDraftFilter(
    query: SelectQueryBuilder<Artwork>,
    isDraftIn: boolean[],
  ): void {
    query.andWhere('artwork.isDraft IN (:...isDraftIn)', {
      isDraftIn,
    });
  }

  private applySearchFilter(
    query: SelectQueryBuilder<Artwork>,
    search: string,
  ): void {
    if (!search) return;

    query.innerJoin(
      'artwork.translations',
      'searchTranslation',
      'searchTranslation.title ILIKE :search',
      { search: `%${search}%` },
    );
  }

  private applyPlatformFilter(
    query: SelectQueryBuilder<Artwork>,
    platforms: Platform[],
  ): void {
    if (!platforms || platforms.length === 0) return;
    query.andWhere('artwork.playedOn IN (:...platforms)', {
      platforms,
    });
  }

  private applySort(query: SelectQueryBuilder<Artwork>, sort: Sort): void {
    sort.apply(query);
  }

  private applyPagination(
    query: SelectQueryBuilder<Artwork>,
    page: number,
    pageSize: number,
  ): void {
    query.skip((page - 1) * pageSize).take(pageSize);
  }

  private updateArtworkFields(
    newArtworkData: Partial<Artwork>,
    artwork: Artwork,
  ): void {
    const fieldsToUpdate = ['createdAt', 'playedOn', 'rating', 'genres'];
    fieldsToUpdate.forEach((field) => {
      if (newArtworkData[field] !== undefined) {
        artwork[field] = newArtworkData[field];
      }
    });
  }

  private replaceTranslations(
    newArtworkData: Partial<Artwork>,
    existingArtwork: Artwork,
  ): void {
    if (!newArtworkData.translations) return;

    newArtworkData.translations.forEach((newTranslation) => {
      const existingTranslation = existingArtwork.translations.find(
        (t) => t.language === newTranslation.language,
      );

      existingTranslation.title =
        newTranslation.title ?? existingTranslation.title;
      existingTranslation.shortReview =
        newTranslation.shortReview ?? existingTranslation.shortReview;
    });
  }

  private assertArtworkExists(artwork: Artwork): void {
    if (artwork) return;

    throw new ArtworkException(
      ArtworkErrorCode.NOT_FOUND,
      'The artwork with the provided ID does not exist',
    );
  }

  private assertArtworkDraft(artwork: Artwork): void {
    if (artwork.isDraft) return;

    throw new ArtworkException(
      ArtworkErrorCode.ALREADY_PUBLISHED,
      'Cannot update published artwork',
    );
  }

  private assertAllProvidedArtworksExist(
    artworks: Artwork[],
    ids: string[],
  ): void {
    if (artworks.length === ids.length) return;

    throw new ArtworkException(
      ArtworkErrorCode.NOT_FOUND,
      'Some of the provided artworks do not exist',
      {
        ids: ids.filter((id) => !new Set(artworks.map((a) => a.id)).has(id)),
      },
    );
  }

  private assertAllArtworksDraft(artworks: Artwork[]): void {
    if (artworks.every((artwork) => artwork.isDraft)) return;

    throw new ArtworkException(
      ArtworkErrorCode.ALREADY_PUBLISHED,
      'Cannot delete published artworks',
      {
        titles: artworks
          .filter((artwork) => !artwork.isDraft)
          .map(
            (a) =>
              a.translations.find((t) => t.language === Language.KO)?.title,
          ),
      },
    );
  }
}
