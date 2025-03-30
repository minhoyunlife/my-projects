import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworksController } from '@/src/modules/artworks/artworks.controller';
import { ArtworksMapper } from '@/src/modules/artworks/artworks.mapper';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { ArtworksValidator } from '@/src/modules/artworks/validators/artworks.validator';
import { StatusValidator } from '@/src/modules/artworks/validators/status.validator';
import { AuthModule } from '@/src/modules/auth/auth.module';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { StorageService } from '@/src/modules/storage/storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Artwork,
      ArtworkTranslation,
      Genre,
      SeriesArtwork,
    ]),
    AuthModule,
  ],
  controllers: [ArtworksController],
  providers: [
    ArtworksRepository,
    ArtworksService,
    ArtworksMapper,
    GenresRepository,
    StatusValidator,
    ArtworksValidator,
    StorageService,
  ],
})
export class ArtworksModule {}
