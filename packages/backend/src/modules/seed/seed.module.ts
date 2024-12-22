import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Genre } from '@/src/modules/genres/genres.entity';
import { SeedService } from '@/src/modules/seed/seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, Genre, Administrator])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
