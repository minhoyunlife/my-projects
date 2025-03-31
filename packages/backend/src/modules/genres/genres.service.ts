import { Injectable } from '@nestjs/common';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { GetGenresByNameQueryDto } from '@/src/modules/genres/dtos/get-genres-by-name-query.dto';
import { GetGenresQueryDto } from '@/src/modules/genres/dtos/get-genres-query.dto';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenresMapper } from '@/src/modules/genres/genres.mapper';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { GenresValidator } from '@/src/modules/genres/genres.validator';
import { TransactionService } from '@/src/modules/transaction/transaction.service';

@Injectable()
export class GenresService {
  constructor(
    private readonly genresRepository: GenresRepository,
    private readonly transactionService: TransactionService,
    private readonly genresMapper: GenresMapper,
    private readonly genresValidator: GenresValidator,
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
      this.genresValidator.assertTranslationsExist(genreData);

      const duplicates = await genresTxRepo.findDuplicateNameOfGenres(
        genreData.translations.map((t) => t.name),
      );
      this.genresValidator.assertDuplicatesNotExist(duplicates);

      return genresTxRepo.createOne(genreData);
    });
  }

  async updateGenre(id: string, dto: UpdateGenreDto): Promise<Genre> {
    this.genresValidator.assertAtLeastOneTranslationNameExist(dto);

    return this.transactionService.executeInTransaction(async (manager) => {
      const genresTxRepo = this.genresRepository.withTransaction(manager);

      const genre = await genresTxRepo.findOneWithDetails(id);
      this.genresValidator.assertGenreExist(genre);

      const genreData = this.genresMapper.toEntityForUpdate(dto, id);
      const duplicates = await genresTxRepo.findDuplicateNameOfGenres(
        genreData.translations.map((t) => t.name),
        id,
      );
      this.genresValidator.assertDuplicatesNotExist(duplicates);

      return await genresTxRepo.updateOne(genreData, genre);
    });
  }

  async deleteGenres(ids: string[]): Promise<void> {
    return this.transactionService.executeInTransaction(async (manager) => {
      const genresTxRepo = this.genresRepository.withTransaction(manager);

      const genres = await genresTxRepo.findManyWithDetails(ids);
      this.genresValidator.assertAllGenresExist(genres, ids);
      this.genresValidator.assertGenresNotInUse(genres);

      await genresTxRepo.deleteMany(genres);
    });
  }
}
