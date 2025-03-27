import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworksController } from '@/src/modules/artworks/artworks.controller';
import { ArtworksMapper } from '@/src/modules/artworks/artworks.mapper';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { StatusValidator } from '@/src/modules/artworks/validators/artwork-status.validator';
import { AuthModule } from '@/src/modules/auth/auth.module';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { StorageService } from '@/src/modules/storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, Genre]), AuthModule],
  controllers: [ArtworksController],
  providers: [
    ArtworksRepository,
    ArtworksService,
    ArtworksMapper,
    GenresRepository,
    StatusValidator,
    StorageService,
  ],
})
export class ArtworksModule {}
