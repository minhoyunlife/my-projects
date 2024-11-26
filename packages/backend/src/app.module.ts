import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworksModule } from '@/src/modules/artworks/artworks.module';
import { AuthModule } from '@/src/modules/auth/auth.module';
import { AppConfigModule } from '@/src/modules/config/config.module';
import databaseConfig from '@/src/modules/config/settings/database.config';
import { GenresModule } from '@/src/modules/genres/genres.module';
import { HealthModule } from '@/src/modules/health/health.module';

@Module({
  imports: [
    AppConfigModule,
    HealthModule,
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    // 이 아래로 프로젝트의 구현과 관련된 모듈을 정의할 것
    AuthModule,
    ArtworksModule,
    GenresModule,
  ],
})
export class AppModule {}
