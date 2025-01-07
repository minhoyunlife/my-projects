import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { BearerAuthGuard } from '@/src/modules/auth/guards/token.auth.guard';
import { GenreListResponse } from '@/src/modules/genres/dtos/genre-response.dto';
import { GetGenresQueryDto } from '@/src/modules/genres/dtos/get-genres-query.dto';
import { GenresService } from '@/src/modules/genres/genres.service';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  static PAGE_SIZE = 20;

  @Get()
  @UseGuards(BearerAuthGuard)
  async getGenres(
    @Query() query: GetGenresQueryDto,
  ): Promise<GenreListResponse> {
    const result = await this.genresService.getGenres(query);

    return new GenreListResponse(
      result.items,
      result.totalCount,
      query.page ?? 1,
      GenresController.PAGE_SIZE,
    );
  }
}
