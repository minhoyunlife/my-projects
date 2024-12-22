import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworksController } from '@/src/modules/artworks/artworks.controller';
import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { AuthModule } from '@/src/modules/auth/auth.module';
import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { StorageService } from '@/src/modules/storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, Genre]), AuthModule],
  controllers: [ArtworksController],
  providers: [
    ArtworksRepository,
    ArtworksService,
    GenresRepository,
    StorageService,
  ],
})
export class ArtworksModule {}
