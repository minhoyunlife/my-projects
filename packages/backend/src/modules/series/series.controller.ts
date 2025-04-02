import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { BearerAuthGuard } from '@/src/modules/auth/guards/token.auth.guard';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { DeleteSeriesDto } from '@/src/modules/series/dtos/delete-series.dto';
import { GetSeriesQueryDto } from '@/src/modules/series/dtos/get-series-query.dto';
import {
  SeriesListResponseDto,
  SeriesResponseDto,
} from '@/src/modules/series/dtos/series-response.dto';
import { SeriesService } from '@/src/modules/series/series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSeries(
    @Query() dto: GetSeriesQueryDto,
  ): Promise<SeriesListResponseDto> {
    const result = await this.seriesService.getSeries(dto);
    return new SeriesListResponseDto(
      result.items,
      result.totalCount,
      dto.page ?? 1,
      PAGE_SIZE.CMS,
    );
  }

  @Post()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSeries(@Body() dto: CreateSeriesDto): Promise<SeriesResponseDto> {
    const series = await this.seriesService.createSeries(dto);
    return new SeriesResponseDto(series);
  }

  @Delete()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSeries(@Body() dto: DeleteSeriesDto): Promise<void> {
    await this.seriesService.deleteSeries(dto);
  }
}
