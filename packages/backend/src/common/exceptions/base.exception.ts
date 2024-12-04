import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}

export abstract class BaseException extends HttpException {
  constructor(response: ErrorResponse, status: HttpStatus) {
    super(response, status);
  }

  getCode(): string {
    return (this.getResponse() as ErrorResponse).code;
  }

  getErrors(): Record<string, string[]> | undefined {
    return (this.getResponse() as ErrorResponse).errors;
  }
}
