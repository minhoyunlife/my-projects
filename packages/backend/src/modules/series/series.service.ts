import { Injectable } from '@nestjs/common';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { GetSeriesQueryDto } from '@/src/modules/series/dtos/get-series-query.dto';
import { Series } from '@/src/modules/series/entities/series.entity';
import { SeriesMapper } from '@/src/modules/series/series.mapper';
import { SeriesRepository } from '@/src/modules/series/series.repository';
import { SeriesValidator } from '@/src/modules/series/series.validator';
import { TransactionService } from '@/src/modules/transaction/transaction.service';

@Injectable()
export class SeriesService {
  constructor(
    private readonly seriesRepository: SeriesRepository,
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
}
