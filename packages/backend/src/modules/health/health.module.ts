import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from '@/src/modules/health/health.controller';
import { GithubHealthIndicator } from '@/src/modules/health/indicators/github.health.indicator';
import { S3HealthIndicator } from '@/src/modules/health/indicators/s3.health.indicator';
import { StorageModule } from '@/src/modules/storage/storage.module';

@Module({
  imports: [
    TerminusModule.forRoot({ gracefulShutdownTimeoutMs: 3000 }),
    StorageModule,
  ],
  controllers: [HealthController],
  providers: [S3HealthIndicator, GithubHealthIndicator],
})
export class HealthModule {}
