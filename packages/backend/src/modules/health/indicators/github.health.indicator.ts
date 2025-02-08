import * as net from 'net';

import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class GithubHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const socket = net.createConnection(443, 'github.com');

      socket.on('connect', () => {
        socket.end();
      });
      socket.on('error', (error) => {
        throw new Error(`GitHub OAuth port check failed: ${error.message}`);
      });

      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error.message,
      });
    }
  }
}
