import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';

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

  private createBaseSeriesQuery(): SelectQueryBuilder<Series> {
    return this.repository
      .createQueryBuilder('series')
      .innerJoinAndSelect('series.translations', 'translation')
      .leftJoinAndSelect('series.seriesArtworks', 'artwork')
      .orderBy('series.id', 'ASC');
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
}
