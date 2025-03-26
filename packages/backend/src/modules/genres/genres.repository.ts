import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';

import { Transactional } from '@/src/common/interfaces/transactional.interface';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';

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
    const subQuery = this.subQueryForSearch(filters.search);

    this.applySearchSubQuery(query, subQuery);
    this.applyPagination(query, filters.page, filters.pageSize);

    return query.getManyAndCount();
  }

  async findByName(search: string): Promise<Genre[]> {
    const query = this.createBaseGenreQuery();
    const subQuery = this.subQueryForSearch(search).limit(10);

    this.applySearchSubQuery(query, subQuery);

    return query.getMany();
  }

  async findByIds(ids: string[]): Promise<Genre[]> {
    if (ids.length === 0) return [];

    return this.repository.findBy({ id: In(ids) });
  }

  async createOne(genreData: Partial<Genre>): Promise<Genre> {
    this.assertTranslationsExist(genreData);

    await this.checkDuplicateNamesForCreate(
      genreData.translations.map((t) => t.name),
    );
    return this.repository.save(this.repository.create(genreData));
  }

  async updateOne(genreData: Partial<Genre>): Promise<Genre> {
    const genre = await this.repository.findOne({
      where: { id: genreData.id },
      relations: ['translations'],
    });

    this.assertGenreExist(genre);

    await this.checkDuplicateNamesForUpdate(
      genreData.translations.map((t) => t.name),
      genre.id,
    );
    this.replaceTranslations(genreData, genre);

    return this.repository.save(genre);
  }

  async deleteMany(ids: string[]): Promise<void> {
    const genres = await this.repository.find({
      where: { id: In(ids) },
      relations: ['translations', 'artworks'],
    });

    this.assertAllGenresExist(genres, ids);
    this.assertGenresNotInUse(genres);

    await this.repository.remove(genres);
  }

  private createBaseGenreQuery(): SelectQueryBuilder<Genre> {
    return this.repository
      .createQueryBuilder('genre')
      .innerJoinAndSelect('genre.translations', 'translation')
      .orderBy('genre.id', 'ASC');
  }

  private subQueryForSearch(search: string): SelectQueryBuilder<Genre> | null {
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
    existingGenre: Genre,
  ): void {
    newGenreData.translations.forEach((newTranslation) => {
      const existingTranslation = existingGenre.translations.find(
        (t) => t.language === newTranslation.language,
      );

      if (existingTranslation) {
        existingTranslation.name = newTranslation.name;
      }
    });
  }

  private async checkDuplicateNamesForCreate(names: string[]): Promise<void> {
    const query = this.queryForDuplicateNames(names);
    this.assertDuplicatesNotExist(await query.getMany());
  }

  private async checkDuplicateNamesForUpdate(
    names: string[],
    genreIdToExclude: string,
  ): Promise<void> {
    const query = this.queryForDuplicateNames(names);
    let duplicates = (await query.getMany()).filter(
      (g) => g.id !== genreIdToExclude,
    );
    this.assertDuplicatesNotExist(duplicates);
  }

  private queryForDuplicateNames(names: string[]): SelectQueryBuilder<Genre> {
    return this.createBaseGenreQuery().where(
      'translation.name IN (:...names)',
      {
        names,
      },
    );
  }

  private assertTranslationsExist(genreData: Partial<Genre>): void {
    if (
      genreData.translations &&
      genreData.translations.length === Object.values(Language).length
    )
      return;

    const providedLanguages = genreData.translations?.map((t) => t.language);
    const missingLanguages = Object.values(Language).filter(
      (lang) => !providedLanguages.includes(lang),
    );

    throw new GenreException(
      GenreErrorCode.NOT_ENOUGH_TRANSLATIONS,
      'All language translations are required',
      {
        languages: missingLanguages,
      },
    );
  }

  private assertAllGenresExist(genres: Genre[], ids: string[]): void {
    if (genres.length !== ids.length) {
      const foundIds = new Set(genres.map((g) => g.id));
      const notFoundIds = ids.filter((id) => !foundIds.has(id));

      throw new GenreException(
        GenreErrorCode.NOT_FOUND,
        'Some of the provided genres do not exist',
        {
          ids: notFoundIds,
        },
      );
    }
  }

  private assertGenreExist(genre: Genre): void {
    if (!genre) {
      throw new GenreException(
        GenreErrorCode.NOT_FOUND,
        'The genre with the provided ID does not exist',
      );
    }
  }

  private assertGenresNotInUse(genres: Genre[]): void {
    if (genres.every((g) => g.artworks.length === 0)) return;

    throw new GenreException(
      GenreErrorCode.IN_USE,
      'Some of the genres are in use by artworks',
      {
        koNames: genres.map(
          (g) => g.translations.find((t) => t.language === Language.KO)?.name,
        ),
      },
    );
  }

  private assertDuplicatesNotExist(duplicates: Genre[]): void {
    if (duplicates.length === 0) return;

    throw new GenreException(
      GenreErrorCode.DUPLICATE_NAME,
      "Some of the provided genre's names are duplicated",
      {
        names: [
          ...new Set(
            duplicates.flatMap((genre) =>
              genre.translations.map((t) => t.name),
            ),
          ),
        ],
      },
    );
  }
}
