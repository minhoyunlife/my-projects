import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/src/modules/auth/auth.module';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import { SeriesController } from '@/src/modules/series/series.controller';
import { SeriesMapper } from '@/src/modules/series/series.mapper';
import { SeriesRepository } from '@/src/modules/series/series.repository';
import { SeriesService } from '@/src/modules/series/series.service';
import { SeriesValidator } from '@/src/modules/series/series.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Series, SeriesTranslation, SeriesArtwork]),
    AuthModule,
  ],
  controllers: [SeriesController],
  providers: [SeriesService, SeriesMapper, SeriesValidator, SeriesRepository],
})
export class SeriesModule {}
