import {
  Injectable,
  NestMiddleware,
  ServiceUnavailableException,
} from '@nestjs/common';

import type { Request, Response, NextFunction } from 'express';

import { TerminationService } from '@/src/modules/termination/termination.service';

@Injectable()
export class TerminationMiddleware implements NestMiddleware {
  constructor(private readonly terminationService: TerminationService) {}

  use(_req: Request, res: Response, next: NextFunction) {
    if (!this.terminationService.beginRequest()) {
      throw new ServiceUnavailableException('Server is shutting down');
    }

    res.on('finish', () => {
      this.terminationService.endRequest();
    });

    next();
  }
}
