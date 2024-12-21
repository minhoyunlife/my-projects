import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum UploadImageErrorCode {
  IMAGE_NOT_PROVIDED = 'IMAGE_NOT_PROVIDED',
  IMAGE_EXTENSION_NOT_SUPPORTED = 'IMAGE_EXTENSION_NOT_SUPPORTED',
  IMAGE_SIZE_TOO_LARGE = 'IMAGE_SIZE_TOO_LARGE',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export const UPLOAD_IMAGE_ERROR_STATUS_MAP: Record<
  UploadImageErrorCode,
  HttpStatus
> = {
  [UploadImageErrorCode.IMAGE_NOT_PROVIDED]: HttpStatus.BAD_REQUEST,
  [UploadImageErrorCode.IMAGE_EXTENSION_NOT_SUPPORTED]: HttpStatus.BAD_REQUEST,
  [UploadImageErrorCode.IMAGE_SIZE_TOO_LARGE]: HttpStatus.PAYLOAD_TOO_LARGE,
  [UploadImageErrorCode.UNEXPECTED_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
};

export class UploadImageException extends BaseException {
  constructor(
    code: UploadImageErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(
      { message, code, errors: errors ?? {} },
      UPLOAD_IMAGE_ERROR_STATUS_MAP[code],
    );
  }
}
