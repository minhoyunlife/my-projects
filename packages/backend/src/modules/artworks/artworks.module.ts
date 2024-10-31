import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworksController } from '@/src/modules/artworks/artworks.controller';
import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, Genre])],
  controllers: [ArtworksController],
  providers: [ArtworksRepository, ArtworksService, GenresRepository],
})
export class ArtworksModule {}
