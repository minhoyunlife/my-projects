import { Controller, Get } from '@nestjs/common';

import { ArtworksService } from './artworks.service';

@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  getArtworks() {
    return this.artworksService.getArtworks();
  }
}
