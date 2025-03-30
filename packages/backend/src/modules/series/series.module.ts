import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/src/modules/auth/auth.module';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import { SeriesController } from '@/src/modules/series/series.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Series, SeriesTranslation, SeriesArtwork]),
    AuthModule,
  ],
  controllers: [SeriesController],
  providers: [],
})
export class SeriesModule {}
