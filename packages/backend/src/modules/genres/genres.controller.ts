import {
  Body,
  Controller,
  Delete,
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
import { DeleteGenresDto } from '@/src/modules/genres/dtos/delete-genres.dto';
import {
  GenreListResponse,
  GenreResponse,
  GenreSearchResponse,
} from '@/src/modules/genres/dtos/genre-response.dto';
import { GetGenresByNameQueryDto } from '@/src/modules/genres/dtos/get-genres-by-name-query.dto';
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

  @Get('/names')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getGenresByName(@Query() query: GetGenresByNameQueryDto) {
    const result = await this.genresService.getGenresByName(query);

    return new GenreSearchResponse(result);
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

  @Delete()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGenre(@Body() dto: DeleteGenresDto): Promise<void> {
    await this.genresService.deleteGenres(dto.ids);
  }
}
