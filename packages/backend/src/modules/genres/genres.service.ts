import { Injectable } from '@nestjs/common';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { GetGenresByNameQueryDto } from '@/src/modules/genres/dtos/get-genres-by-name-query.dto';
import { GetGenresQueryDto } from '@/src/modules/genres/dtos/get-genres-query.dto';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';
import { GenresMapper } from '@/src/modules/genres/genres.mapper';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { TransactionService } from '@/src/modules/transaction/transaction.service';

@Injectable()
export class GenresService {
  constructor(
    private readonly genresRepository: GenresRepository,
    private readonly transactionService: TransactionService,
    private readonly genresMapper: GenresMapper,
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
    return this.transactionService.executeInTransaction(async (manager) => {
      const genresTxRepo = this.genresRepository.withTransaction(manager);
      const genreData = this.genresMapper.toEntityForCreate(dto);
      return await genresTxRepo.createOne(genreData);
    });
  }

  async updateGenre(id: string, dto: UpdateGenreDto): Promise<Genre> {
    this.assertAllTranslationNamesExist(dto);

    return this.transactionService.executeInTransaction(async (manager) => {
      const genresTxRepo = this.genresRepository.withTransaction(manager);
      const genreData = this.genresMapper.toEntityForUpdate(dto, id);
      return await genresTxRepo.updateOne(genreData);
    });
  }

  async deleteGenres(ids: string[]): Promise<void> {
    return this.transactionService.executeInTransaction(async (manager) => {
      const genresTxRepo = this.genresRepository.withTransaction(manager);
      await genresTxRepo.deleteMany(ids);
    });
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
