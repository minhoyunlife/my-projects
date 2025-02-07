import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

import { GithubHealthIndicator } from '@/src/modules/health/indicators/github.health.indicator';
import { S3HealthIndicator } from '@/src/modules/health/indicators/s3.health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly s3: S3HealthIndicator,
    private readonly github: GithubHealthIndicator,
  ) {}

  @Get('/liveness')
  @HealthCheck()
  check() {
    const config = this.configService.get('health');
    const heapLimit = config.containerMemory * config.heapMemoryThresholdRatio;
    const rssLimit = config.containerMemory * config.rssMemoryThresholdRatio;

    return this.health.check([
      // 메모리 체크
      () => this.memory.checkHeap('heap_memory', heapLimit),
      () => this.memory.checkRSS('process_memory', rssLimit),

      // 디스크 체크
      () =>
        this.disk.checkStorage('disk_space', {
          thresholdPercent: config.diskThresholdPercent,
          path: config.diskPath,
        }),
    ]);
  }

  @Get('/readiness')
  @HealthCheck()
  async checkReadiness() {
    return this.health.check([
      // DB 연결 체크
      () => this.db.pingCheck('database'),

      // S3 연결 체크
      () => this.s3.isHealthy('s3'),

      // Github OAuth 연결 체크
      () => this.github.isHealthy('github_oauth'),
    ]);
  }
}
