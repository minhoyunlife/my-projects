import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { ArtworkResponse } from '@/src/modules/artworks/dtos/artwork-response.dto';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';

@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createArtworkDto: CreateArtworkDto,
  ): Promise<ArtworkResponse> {
    const artwork = await this.artworksService.createArtwork(createArtworkDto);
    return new ArtworkResponse(artwork);
  }
}
