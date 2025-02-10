import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export interface ErrorResponse {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}

export abstract class BaseException extends HttpException {
  constructor(
    response: ErrorResponse,
    status: HttpStatus,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger?: Logger,
  ) {
    super(response, status);

    const errorResponse = this.getResponse() as ErrorResponse;

    const logMethod = status >= 500 ? 'error' : 'warn';

    this.logger?.[logMethod](`${this.constructor.name} thrown`, {
      context: 'Exception',
      metadata: {
        code: errorResponse.code,
        message: errorResponse.message,
        status,
        ...(errorResponse.errors && { errors: errorResponse.errors }),
      },
    });
  }

  getCode(): string {
    return (this.getResponse() as ErrorResponse).code;
  }

  getErrors(): Record<string, string[]> | undefined {
    return (this.getResponse() as ErrorResponse).errors;
  }
}

export function addErrorMessages(
  errors: Record<string, string[]>,
  key: string,
  messages: string[],
): void {
  if (!errors[key]) {
    errors[key] = [];
  }
  errors[key].push(...messages);
}
