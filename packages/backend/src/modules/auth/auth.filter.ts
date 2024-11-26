import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { Response } from 'express';

export interface ErrorResponse {
  message: string;
  code: string; // 각 예외명이 식별 코드가 됨
  errors?: {
    [key: string]: string[];
  };
}

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();

    const errorResponse: ErrorResponse = {
      message: exception.message,
      code: exception.name,
    };

    response.status(status).json(errorResponse);
  }
}
