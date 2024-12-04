import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { Response } from 'express';

// TODO: 다른 엔드포인트 구현 시에 확장할 가능성
@Catch(HttpException)
export class ArtworksExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return response.status(exception.getStatus()).json(exception.getResponse());
  }
}
