import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class GithubHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly httpService: HttpService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.httpService.axiosRef.get('https://api.github.com/meta', {
        timeout: 5000,
      });

      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error.message,
      });
    }
  }
}
