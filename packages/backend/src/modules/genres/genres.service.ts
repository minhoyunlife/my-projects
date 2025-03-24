import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { GetGenresByNameQueryDto } from '@/src/modules/genres/dtos/get-genres-by-name-query.dto';
import { GetGenresQueryDto } from '@/src/modules/genres/dtos/get-genres-query.dto';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';
import { GenresRepository } from '@/src/modules/genres/genres.repository';

@Injectable()
export class GenresService {
  constructor(
    private readonly genresRepository: GenresRepository,
    private readonly entityManager: EntityManager,
  ) {}

  async getGenres(query: GetGenresQueryDto): Promise<EntityList<Genre>> {
    const page = query.page ?? 1;
    const search = query.search ?? undefined;
    const [items, totalCount] = await this.genresRepository.getAllWithFilters({
      page,
      pageSize: PAGE_SIZE.CMS,
      search,
    });
    return {
      items,
      totalCount,
    };
  }

  async getGenresByName(query: GetGenresByNameQueryDto): Promise<Genre[]> {
    return this.genresRepository.findByName(query.search);
  }

  async createGenre(dto: CreateGenreDto): Promise<Genre> {
    return this.entityManager.transaction(async (manager) => {
      const genresTxRepo = this.genresRepository.forTransaction(manager);
      const genreData = this.createGenreDataFromDto(dto, null);
      return await genresTxRepo.createOne(genreData);
    });
  }

  async updateGenre(id: string, dto: UpdateGenreDto): Promise<Genre> {
    this.assertAllTranslationNamesExist(dto);

    return this.entityManager.transaction(async (manager) => {
      const genresTxRepo = this.genresRepository.forTransaction(manager);
      const genreData = this.createGenreDataFromDto(dto, id);
      return await genresTxRepo.updateOne(genreData);
    });
  }

  async deleteGenres(ids: string[]): Promise<void> {
    return this.entityManager.transaction(async (manager) => {
      const genresTxRepo = this.genresRepository.forTransaction(manager);
      await genresTxRepo.deleteMany(ids);
    });
  }

  private createGenreDataFromDto(
    dto: UpdateGenreDto,
    id?: string,
  ): Partial<Genre> {
    return {
      id: id ? id : undefined,
      translations: this.createTranslationsFromDto(dto),
    };
  }

  private createTranslationsFromDto(dto: UpdateGenreDto): GenreTranslation[] {
    const translations = [];
    this.addTranslationIfProvided(translations, Language.KO, dto.koName);
    this.addTranslationIfProvided(translations, Language.EN, dto.enName);
    this.addTranslationIfProvided(translations, Language.JA, dto.jaName);
    return translations;
  }

  private addTranslationIfProvided(
    translations: Partial<GenreTranslation>[],
    language: Language,
    name: string,
  ): void {
    if (!name) return;
    translations.push({ language, name });
  }

  private assertAllTranslationNamesExist(dto: UpdateGenreDto) {
    if (!dto.koName && !dto.enName && !dto.jaName) {
      throw new GenreException(
        GenreErrorCode.NO_TRANSLATIONS_PROVIDED,
        'At least one translation must be provided',
        {
          translations: [
            'At least one translation is required to update genre',
          ],
        },
      );
    }
  }
}
