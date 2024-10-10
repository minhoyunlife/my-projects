import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './config/database.config';
import { ArtworksModule } from './modules/artworks/artworks.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    HealthModule,
    TypeOrmModule.forRoot(databaseConfig),
    // 이 아래로 프로젝트의 구현과 관련된 모듈을 정의할 것
    ArtworksModule,
  ],
})
export class AppModule {}
