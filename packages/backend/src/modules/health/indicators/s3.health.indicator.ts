import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { StorageService } from '@/src/modules/storage/storage.service';

@Injectable()
export class S3HealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly storageService: StorageService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.storageService.checkBucketConnection();
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error.message,
      });
    }
  }
}
