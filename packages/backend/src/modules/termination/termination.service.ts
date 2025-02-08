import { Injectable } from '@nestjs/common';

@Injectable()
export class TerminationService {
  private isShuttingDown = false;
  private activeRequests = 0;

  get isTerminating() {
    return this.isShuttingDown;
  }

  beginRequest() {
    if (this.isShuttingDown) {
      return false;
    }
    this.activeRequests++;
    return true;
  }

  endRequest() {
    this.activeRequests--;
  }

  async initiateShutdown() {
    this.isShuttingDown = true;

    while (this.activeRequests > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
