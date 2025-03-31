import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { BearerAuthGuard } from '@/src/modules/auth/guards/token.auth.guard';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { SeriesResponseDto } from '@/src/modules/series/dtos/series-response.dto';
import { SeriesService } from '@/src/modules/series/series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSeries(@Body() dto: CreateSeriesDto): Promise<SeriesResponseDto> {
    const series = await this.seriesService.createSeries(dto);
    return new SeriesResponseDto(series);
  }
}
