import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  PayloadTooLargeException,
} from '@nestjs/common';

import type { Response } from 'express';

import { MAX_IMAGE_SIZE } from '@/src/modules/artworks/artworks.controller';
import {
  UploadImageErrorCode,
  UploadImageException,
} from '@/src/modules/artworks/exceptions/upload-image.exception';

// NOTE: multer 의 limit 초과 에러를 처리하기 위한 메소드 단위의 필터
@Catch(PayloadTooLargeException)
export class UploadImageExceptionFilter implements ExceptionFilter {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const uploadImageException = new UploadImageException(
      UploadImageErrorCode.IMAGE_SIZE_TOO_LARGE,
      'File size exceeds the limit of 100MB.',
      {
        maxSize: [`${MAX_IMAGE_SIZE / 1024 / 1024}MB`],
      },
    );

    return response
      .status(uploadImageException.getStatus())
      .json(uploadImageException.getResponse());
  }
}
