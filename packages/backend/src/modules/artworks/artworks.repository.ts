import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';

import { Transactional } from '@/src/common/interfaces/transactional.interface';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Sort } from '@/src/modules/artworks/enums/sort-type.enum';
import { ArtworkFilter } from '@/src/modules/artworks/interfaces/filter.interface';

@Injectable()
export class ArtworksRepository implements Transactional<ArtworksRepository> {
  constructor(
    @InjectRepository(Artwork)
    public readonly repository: Repository<Artwork>,
  ) {}

  withTransaction(manager: EntityManager): ArtworksRepository {
    return new ArtworksRepository(manager.getRepository(Artwork));
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

  async findOneWithDetails(id: string): Promise<Artwork> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'translations',
        'genres',
        'seriesArtworks',
        'seriesArtworks.series',
        'seriesArtworks.series.translations',
      ],
    });
  }

  async findManyWithDetails(ids: string[]): Promise<Artwork[]> {
    if (ids.length === 0) return [];

    return this.repository.find({
      where: { id: In(ids) },
      relations: [
        'translations',
        'genres',
        'seriesArtworks',
        'seriesArtworks.series',
        'seriesArtworks.series.translations',
      ],
    });
  }

  async createOne(artworkData: Partial<Artwork>): Promise<Artwork> {
    return this.repository.save(this.repository.create(artworkData));
  }

  async updateOne(
    artworkData: Partial<Artwork>,
    artwork: Artwork,
  ): Promise<Artwork> {
    this.updateArtworkFields(artworkData, artwork);
    this.replaceTranslations(artworkData, artwork);

    return this.repository.save(artwork);
  }

  async updateManyStatuses(
    ids: string[],
    setPublished: boolean,
  ): Promise<void> {
    if (ids.length === 0) return;
    await this.repository.update({ id: In(ids) }, { isDraft: !setPublished });
  }

  async deleteMany(artworks: Artwork[]): Promise<Artwork[]> {
    return this.repository.remove(artworks);
  }

  private createBaseArtworkQuery(): SelectQueryBuilder<Artwork> {
    return this.repository
      .createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.genres', 'genre')
      .leftJoinAndSelect('genre.translations', 'translation')
      .leftJoinAndSelect('artwork.translations', 'artworkTranslation')
      .leftJoinAndSelect('artwork.seriesArtworks', 'seriesArtwork')
      .leftJoinAndSelect('seriesArtwork.series', 'series')
      .leftJoinAndSelect('series.translations', 'seriesTranslation');
  }

  private applyGenreFilter(
    query: SelectQueryBuilder<Artwork>,
    genreIds: string[],
  ): void {
    if (!genreIds || genreIds.length === 0) return;

    const subQuery = this.repository
      .createQueryBuilder()
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
}
