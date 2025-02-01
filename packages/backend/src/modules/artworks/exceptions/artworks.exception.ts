import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum ArtworkErrorCode {
  NOT_EXISTING_GENRES_INCLUDED = 'NOT_EXISTING_GENRES_INCLUDED',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_PUBLISHED = 'ALREADY_PUBLISHED',
  SOME_FAILED = 'SOME_FAILED',
}

export const ARTWORK_ERROR_STATUS_MAP: Record<ArtworkErrorCode, number> = {
  [ArtworkErrorCode.NOT_EXISTING_GENRES_INCLUDED]: HttpStatus.BAD_REQUEST,
  [ArtworkErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ArtworkErrorCode.ALREADY_PUBLISHED]: HttpStatus.CONFLICT,
  [ArtworkErrorCode.SOME_FAILED]: HttpStatus.MULTI_STATUS,
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
