import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum ArtworkErrorCode {
  NOT_EXISTING_GENRES_INCLUDED = 'NOT_EXISTING_GENRES_INCLUDED',
}

export const ARTWORK_ERROR_STATUS_MAP: Record<ArtworkErrorCode, HttpStatus> = {
  [ArtworkErrorCode.NOT_EXISTING_GENRES_INCLUDED]: HttpStatus.BAD_REQUEST,
};

export class ArtworkException extends BaseException {
  constructor(
    code: ArtworkErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(
      { message, code, errors: errors ?? {} },
      ARTWORK_ERROR_STATUS_MAP[code],
    );
  }
}
