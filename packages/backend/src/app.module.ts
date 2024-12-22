import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Environment } from '@/src/common/enums/environment.enum';
import { ArtworksModule } from '@/src/modules/artworks/artworks.module';
import { AuthModule } from '@/src/modules/auth/auth.module';
import { AppConfigModule } from '@/src/modules/config/config.module';
import databaseConfig from '@/src/modules/config/settings/database.config';
import { GenresModule } from '@/src/modules/genres/genres.module';
import { HealthModule } from '@/src/modules/health/health.module';
import { SeedModule } from '@/src/modules/seed/seed.module';
import { SeedService } from '@/src/modules/seed/seed.service';

@Module({
  imports: [
    AppConfigModule,
    HealthModule,
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    SeedModule,
    // 이 아래로 프로젝트의 구현과 관련된 모듈을 정의할 것
    AuthModule,
    ArtworksModule,
    GenresModule,
  ],
})
export class AppModule {
  constructor(
    private readonly configService: ConfigService,
    private readonly seedService: SeedService,
  ) {}

  // 개발 환경용 시드 데이터 주입을 위해
  async onModuleInit() {
    const isDevelopment = this.configService.get('app.env') === Environment.DEV;

    if (isDevelopment) {
      try {
        await this.seedService.seed();
        console.log('Seeding data for development has been completed! 👍');
      } catch (error) {
        console.error('⛔️ Got errors while seeding data: ', error);
      }
    }
  }
}
