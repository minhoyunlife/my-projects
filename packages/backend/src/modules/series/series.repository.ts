import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';

import { Transactional } from '@/src/common/interfaces/transactional.interface';
import { Series } from '@/src/modules/series/entities/series.entity';

@Injectable()
export class SeriesRepository implements Transactional<SeriesRepository> {
  constructor(
    @InjectRepository(Series)
    public readonly repository: Repository<Series>,
  ) {}

  withTransaction(manager: EntityManager): SeriesRepository {
    return new SeriesRepository(manager.getRepository(Series));
  }

  async getAllWithFilters(filters: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<[Series[], number]> {
    const query = this.createBaseSeriesQuery();
    const subQuery = this.createSubQueryForSearch(filters.search);

    this.applySearchSubQuery(query, subQuery);
    this.applyPagination(query, filters.page, filters.pageSize);

    return query.getManyAndCount();
  }

  async findOneWithDetails(id: string): Promise<Series> {
    return this.repository.findOne({
      where: { id },
      relations: ['translations', 'seriesArtworks'],
    });
  }

  async findManyWithDetails(ids: string[]): Promise<Series[]> {
    if (ids.length === 0) return [];

    return this.repository.find({
      where: { id: In(ids) },
      relations: ['translations', 'seriesArtworks'],
    });
  }

  async findDuplicateTitleOfSeries(
    titles: string[],
    excludingId?: string,
  ): Promise<Series[]> {
    const result = await this.createQueryForDuplicateTitles(titles).getMany();

    return excludingId ? result.filter((g) => g.id !== excludingId) : result;
  }

  async createOne(seriesData: Partial<Series>): Promise<Series> {
    return this.repository.save(this.repository.create(seriesData));
  }

  async updateOne(
    seriesData: Partial<Series>,
    series: Series,
  ): Promise<Series> {
    this.replaceTranslations(seriesData, series);

    return this.repository.save(series);
  }

  async deleteMany(series: Series[]): Promise<void> {
    await this.repository.remove(series);
  }

  private createBaseSeriesQuery(): SelectQueryBuilder<Series> {
    return this.repository
      .createQueryBuilder('series')
      .innerJoinAndSelect('series.translations', 'translation')
      .leftJoinAndSelect('series.seriesArtworks', 'seriesArtwork')
      .leftJoinAndSelect('seriesArtwork.artwork', 'artwork')
      .leftJoinAndSelect('artwork.translations', 'artworkTranslation')
      .orderBy('series.id', 'ASC');
  }

  private createSubQueryForSearch(
    search: string,
  ): SelectQueryBuilder<Series> | null {
    if (!search) return null;

    return this.repository
      .createQueryBuilder()
      .select('DISTINCT series.id')
      .from(Series, 'series')
      .leftJoin('series.translations', 'translation')
      .where('translation.title ILIKE :search', {
        search: `%${search}%`,
      });
  }

  private createQueryForDuplicateTitles(
    titles: string[],
  ): SelectQueryBuilder<Series> {
    return this.createBaseSeriesQuery().where(
      'translation.title IN (:...titles)',
      {
        titles,
      },
    );
  }

  private applySearchSubQuery(
    baseQuery: SelectQueryBuilder<Series>,
    subQuery: SelectQueryBuilder<Series> | null,
  ): void {
    if (!subQuery) return;

    baseQuery
      .where(`series.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters());
  }

  private applyPagination(
    query: SelectQueryBuilder<Series>,
    page: number,
    pageSize: number,
  ): void {
    query.skip((page - 1) * pageSize).take(pageSize);
  }

  private replaceTranslations(
    newSeriesData: Partial<Series>,
    series: Series,
  ): void {
    newSeriesData.translations.forEach((newTranslation) => {
      const existingTranslation = series.translations.find(
        (t) => t.language === newTranslation.language,
      );

      if (existingTranslation) {
        existingTranslation.title = newTranslation.title;
      }
    });
  }
}
