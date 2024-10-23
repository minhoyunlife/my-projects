import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from '@/src/config/database.config';
import { ArtworksModule } from '@/src/modules/artworks/artworks.module';
import { GenresModule } from '@/src/modules/genres/genres.module';
import { HealthModule } from '@/src/modules/health/health.module';

@Module({
  imports: [
    HealthModule,
    TypeOrmModule.forRoot(databaseConfig),
    // 이 아래로 프로젝트의 구현과 관련된 모듈을 정의할 것
    ArtworksModule,
    GenresModule,
  ],
})
export class AppModule {}
