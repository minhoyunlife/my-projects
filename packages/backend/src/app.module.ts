import {
  Inject,
  MiddlewareConsumer,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';

import { Environment } from '@/src/common/enums/environment.enum';
import { ArtworksModule } from '@/src/modules/artworks/artworks.module';
import { AuthModule } from '@/src/modules/auth/auth.module';
import { AppConfigModule } from '@/src/modules/config/config.module';
import { getTypeOrmConfig } from '@/src/modules/config/settings/database.config';
import { GenresModule } from '@/src/modules/genres/genres.module';
import { HealthModule } from '@/src/modules/health/health.module';
import { AppLoggerModule } from '@/src/modules/logger/logger.module';
import { LoggingInterceptor } from '@/src/modules/logger/logging.interceptor';
import { SeedModule } from '@/src/modules/seed/seed.module';
import { SeedService } from '@/src/modules/seed/seed.service';
import { TerminationMiddleware } from '@/src/modules/termination/termination.middleware';
import { TerminationService } from '@/src/modules/termination/termination.service';
import { TransactionModule } from '@/src/modules/transaction/transaction.module';

@Module({
  imports: [
    AppConfigModule,
    HealthModule,
    TypeOrmModule.forRootAsync(getTypeOrmConfig()),
    TransactionModule,
    AppLoggerModule,
    SeedModule,
    // 이 아래로 프로젝트의 구현과 관련된 모듈을 정의할 것
    AuthModule,
    ArtworksModule,
    GenresModule,
  ],
  providers: [
    TerminationService,
    // 글로벌 밸리데이션 파이프는 모듈 외부에서 등록되면 의존성 주입이 불가능(예를 들어 main.ts)
    // main.ts 에서 주입 시, 일부 컨트롤러의 메소드에서 트랜스폼이 이뤄지지 않았으므로, 여기에 설정하여 앱 모듈이 임포트하는 전체 모듈에 적용되도록 함
    // https://docs.nestjs.com/pipes#global-scoped-pipes
    {
      provide: APP_PIPE,
      useFactory: (configService: ConfigService) =>
        new ValidationPipe(configService.get('validation')),
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit, OnApplicationShutdown {
  constructor(
    private readonly configService: ConfigService,
    private readonly seedService: SeedService,
    private readonly dataSource: DataSource,
    private readonly terminationService: TerminationService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // 개발 환경용 시드 데이터 주입을 위해
  async onModuleInit() {
    const isDevelopment = this.configService.get('app.env') === Environment.DEV;

    this.logger.info('Application initialization started', {
      context: 'AppModule',
      metadata: {
        environment: this.configService.get('app.env'),
        port: this.configService.get('app.port'),
      },
    });

    if (isDevelopment) {
      try {
        await this.seedService.seed();
        this.logger.debug('Development seed data injection completed', {
          context: 'AppModule',
        });
      } catch (error) {
        this.logger.error('Failed to seed development data', {
          context: 'AppModule',
          metadata: {
            error: error.message,
            stack: error.stack,
          },
        });
      }
    }
  }

  // Graceful shutdown 을 위한 메소드
  async onApplicationShutdown(signal?: string) {
    this.logger.warn('Application shutdown initiated', {
      context: 'AppModule',
      metadata: { signal },
    });

    try {
      await this.terminationService.initiateShutdown();
      this.logger.info('All pending requests completed', {
        context: 'AppModule',
      });

      await this.dataSource.destroy();
      this.logger.info('Database connections closed', {
        context: 'AppModule',
      });
    } catch (error) {
      this.logger.error('Error during application shutdown', {
        context: 'AppModule',
        metadata: {
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TerminationMiddleware).forRoutes('*');
  }
}
