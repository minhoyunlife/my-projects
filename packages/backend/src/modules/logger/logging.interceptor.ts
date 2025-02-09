import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable, tap } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, query } = req;

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    this.logger.info(`${method} ${url}`, {
      context: controllerName,
      request: {
        id: req.id,
        method,
        path: url,
      },
      metadata: {
        handler: handlerName,
        query: Object.keys(query).length > 0 ? query : undefined,
        body: body && !this.containsSensitiveData(body) ? body : undefined,
      },
    });

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const response = context.switchToHttp().getResponse();

          this.logger.info(`${method} ${url} completed`, {
            context: controllerName,
            request: {
              id: req.id,
              method,
              path: url,
              duration: Date.now() - now,
              statusCode: response.statusCode,
            },
            metadata: {
              handler: handlerName,
            },
          });
        },
        error: (error) => {
          this.logger.error(`${method} ${url} failed`, {
            context: controllerName,
            request: {
              id: req.id,
              method,
              path: url,
              duration: Date.now() - now,
            },
            metadata: {
              handler: handlerName,
              error: error.message,
              stack: error.stack,
              code: error.code || error.status,
            },
          });
        },
      }),
    );
  }

  private containsSensitiveData(body: any): boolean {
    const sensitiveFields = ['password', 'token', 'secret', 'credential'];
    return Object.keys(body).some((key) =>
      sensitiveFields.some((field) => key.toLowerCase().includes(field)),
    );
  }
}
