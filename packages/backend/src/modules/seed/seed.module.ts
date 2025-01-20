import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { SeedService } from '@/src/modules/seed/seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Artwork,
      ArtworkTranslation,
      Genre,
      GenreTranslation,
      Administrator,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
