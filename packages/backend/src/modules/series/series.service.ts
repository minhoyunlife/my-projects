import { Injectable } from '@nestjs/common';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { DeleteSeriesDto } from '@/src/modules/series/dtos/delete-series.dto';
import { GetSeriesQueryDto } from '@/src/modules/series/dtos/get-series-query.dto';
import { UpdateSeriesArtworksDto } from '@/src/modules/series/dtos/update-series-artworks.dto';
import { UpdateSeriesDto } from '@/src/modules/series/dtos/update-series.dto';
import { Series } from '@/src/modules/series/entities/series.entity';
import { SeriesMapper } from '@/src/modules/series/series.mapper';
import { SeriesRepository } from '@/src/modules/series/series.repository';
import { SeriesValidator } from '@/src/modules/series/series.validator';
import { TransactionService } from '@/src/modules/transaction/transaction.service';

@Injectable()
export class SeriesService {
  constructor(
    private readonly seriesRepository: SeriesRepository,
    private readonly artworksRepository: ArtworksRepository,
    private readonly transactionService: TransactionService,
    private readonly seriesMapper: SeriesMapper,
    private readonly seriesValidator: SeriesValidator,
  ) {}

  async getSeries(query: GetSeriesQueryDto): Promise<EntityList<Series>> {
    const page = query.page ?? 1;
    const search = query.search ?? undefined;
    const [items, totalCount] = await this.seriesRepository.getAllWithFilters({
      page,
      pageSize: PAGE_SIZE.CMS,
      search,
    });
    return {
      items,
      totalCount,
    };
  }

  async createSeries(dto: CreateSeriesDto): Promise<Series> {
    return this.transactionService.executeInTransaction(async (manager) => {
      const seriesTxRepo = this.seriesRepository.withTransaction(manager);

      const seriesData = this.seriesMapper.toEntityForCreate(dto);
      this.seriesValidator.assertTranslationsExist(seriesData);

      const duplicates = await seriesTxRepo.findDuplicateTitleOfSeries(
        seriesData.translations.map((t) => t.title),
      );
      this.seriesValidator.assertDuplicatesNotExist(duplicates);

      return seriesTxRepo.createOne(seriesData);
    });
  }

  async updateSeries(id: string, dto: UpdateSeriesDto): Promise<Series> {
    this.seriesValidator.assertAtLeastOneTranslationTitleExist(dto);

    return this.transactionService.executeInTransaction(async (manager) => {
      const seriesTxRepo = this.seriesRepository.withTransaction(manager);

      const series = await seriesTxRepo.findOneWithDetails(id);
      this.seriesValidator.assertSeriesExists(series);

      const seriesData = this.seriesMapper.toEntityForUpdate(dto, id);
      const duplicates = await seriesTxRepo.findDuplicateTitleOfSeries(
        seriesData.translations.map((t) => t.title),
        id,
      );
      this.seriesValidator.assertDuplicatesNotExist(duplicates);

      return await seriesTxRepo.updateOne(seriesData, series);
    });
  }

  async updateSeriesArtworks(
    id: string,
    dto: UpdateSeriesArtworksDto,
  ): Promise<Series> {
    return this.transactionService.executeInTransaction(async (manager) => {
      const seriesTxRepo = this.seriesRepository.withTransaction(manager);
      const artworksTxRepo = this.artworksRepository.withTransaction(manager);

      const series = await seriesTxRepo.findOneWithDetails(id);
      this.seriesValidator.assertSeriesExists(series);

      if (dto.artworks?.length > 0) {
        const artworkIds = dto.artworks.map((artwork) => artwork.id);
        const existingArtworks =
          await artworksTxRepo.findManyWithDetails(artworkIds);
        this.seriesValidator.assertAllArtworksExist(
          existingArtworks,
          artworkIds,
        );
      }

      return seriesTxRepo.updateSeriesArtworks(series, dto.artworks || []);
    });
  }

  async deleteSeries(dto: DeleteSeriesDto): Promise<void> {
    return this.transactionService.executeInTransaction(async (manager) => {
      const seriesTxRepo = this.seriesRepository.withTransaction(manager);

      const series = await seriesTxRepo.findManyWithDetails(dto.ids);
      this.seriesValidator.assertAllSeriesExist(series, dto.ids);
      this.seriesValidator.assertSeriesNotInUse(series);

      await seriesTxRepo.deleteMany(series);
    });
  }
}
