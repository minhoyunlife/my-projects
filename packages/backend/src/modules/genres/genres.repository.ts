import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';

import { Transactional } from '@/src/common/interfaces/transactional.interface';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

@Injectable()
export class GenresRepository implements Transactional<GenresRepository> {
  constructor(
    @InjectRepository(Genre)
    public readonly repository: Repository<Genre>,
  ) {}

  withTransaction(manager: EntityManager): GenresRepository {
    return new GenresRepository(manager.getRepository(Genre));
  }

  async getAllWithFilters(filters: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<[Genre[], number]> {
    const query = this.createBaseGenreQuery();
    const subQuery = this.createSubQueryForSearch(filters.search);

    this.applySearchSubQuery(query, subQuery);
    this.applyPagination(query, filters.page, filters.pageSize);

    return query.getManyAndCount();
  }

  async findByName(search: string): Promise<Genre[]> {
    const query = this.createBaseGenreQuery();
    const subQuery = this.createSubQueryForSearch(search).limit(10);

    this.applySearchSubQuery(query, subQuery);

    return query.getMany();
  }

  async findByIds(ids: string[]): Promise<Genre[]> {
    if (ids.length === 0) return [];

    return this.repository.findBy({ id: In(ids) });
  }

  async findOneWithDetails(id: string): Promise<Genre> {
    return this.repository.findOne({
      where: { id },
      relations: ['translations', 'artworks'],
    });
  }

  async findManyWithDetails(ids: string[]): Promise<Genre[]> {
    return this.repository.find({
      where: { id: In(ids) },
      relations: ['translations', 'artworks'],
    });
  }

  async findDuplicateNameOfGenres(
    names: string[],
    excludingId?: string,
  ): Promise<Genre[]> {
    const result = await this.createQueryForDuplicateNames(names).getMany();

    return excludingId ? result.filter((g) => g.id !== excludingId) : result;
  }

  async createOne(genreData: Partial<Genre>): Promise<Genre> {
    return this.repository.save(this.repository.create(genreData));
  }

  async updateOne(genreData: Partial<Genre>, genre: Genre): Promise<Genre> {
    this.replaceTranslations(genreData, genre);

    return this.repository.save(genre);
  }

  async deleteMany(genres: Genre[]): Promise<void> {
    await this.repository.remove(genres);
  }

  private createBaseGenreQuery(): SelectQueryBuilder<Genre> {
    return this.repository
      .createQueryBuilder('genre')
      .innerJoinAndSelect('genre.translations', 'translation')
      .orderBy('genre.id', 'ASC');
  }

  private createSubQueryForSearch(
    search: string,
  ): SelectQueryBuilder<Genre> | null {
    if (!search) return null;

    return this.repository
      .createQueryBuilder()
      .select('DISTINCT genre.id')
      .from(Genre, 'genre')
      .leftJoin('genre.translations', 'translation')
      .where('translation.name ILIKE :search', {
        search: `%${search}%`,
      });
  }

  private createQueryForDuplicateNames(
    names: string[],
  ): SelectQueryBuilder<Genre> {
    return this.createBaseGenreQuery().where(
      'translation.name IN (:...names)',
      {
        names,
      },
    );
  }

  private applySearchSubQuery(
    baseQuery: SelectQueryBuilder<Genre>,
    subQuery: SelectQueryBuilder<Genre> | null,
  ): void {
    if (!subQuery) return;

    baseQuery
      .where(`genre.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters());
  }

  private applyPagination(
    query: SelectQueryBuilder<Genre>,
    page: number,
    pageSize: number,
  ): void {
    query.skip((page - 1) * pageSize).take(pageSize);
  }

  private replaceTranslations(
    newGenreData: Partial<Genre>,
    genre: Genre,
  ): void {
    newGenreData.translations.forEach((newTranslation) => {
      const existingTranslation = genre.translations.find(
        (t) => t.language === newTranslation.language,
      );

      if (existingTranslation) {
        existingTranslation.name = newTranslation.name;
      }
    });
  }
}
