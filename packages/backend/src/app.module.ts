import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
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
  providers: [
    // 글로벌 밸리데이션 파이프는 모듈 외부에서 등록되면 의존성 주입이 불가능(예를 들어 main.ts)
    // main.ts 에서 주입 시, 일부 컨트롤러의 메소드에서 트랜스폼이 이뤄지지 않았으므로, 여기에 설정하여 앱 모듈이 임포트하는 전체 모듈에 적용되도록 함
    // https://docs.nestjs.com/pipes#global-scoped-pipes
    {
      provide: APP_PIPE,
      useFactory: (configService: ConfigService) =>
        new ValidationPipe(configService.get('validation')),
      inject: [ConfigService],
    },
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
