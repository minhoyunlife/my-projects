import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { BearerAuthGuard } from '@/src/modules/auth/guards/token.auth.guard';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import {
  GenreListResponse,
  GenreResponse,
} from '@/src/modules/genres/dtos/genre-response.dto';
import { GetGenresQueryDto } from '@/src/modules/genres/dtos/get-genres-query.dto';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { GenresService } from '@/src/modules/genres/genres.service';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getGenres(
    @Query() query: GetGenresQueryDto,
  ): Promise<GenreListResponse> {
    const result = await this.genresService.getGenres(query);

    return new GenreListResponse(
      result.items,
      result.totalCount,
      query.page ?? 1,
      PAGE_SIZE.CMS,
    );
  }

  @Post()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createGenre(@Body() dto: CreateGenreDto): Promise<GenreResponse> {
    const genre = await this.genresService.createGenre(dto);
    return new GenreResponse(genre);
  }

  @Patch('/:id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateGenre(
    @Param('id') id: string,
    @Body() dto: UpdateGenreDto,
  ): Promise<GenreResponse> {
    const genre = await this.genresService.updateGenre(id, dto);
    return new GenreResponse(genre);
  }
}
