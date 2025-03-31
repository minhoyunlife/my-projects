import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum SeriesErrorCode {
  NOT_ENOUGH_TRANSLATIONS = 'NOT_ENOUGH_TRANSLATIONS',
  DUPLICATE_TITLE = 'DUPLICATE_TITLE',
}

export const SERIES_ERROR_STATUS_MAP: Record<SeriesErrorCode, HttpStatus> = {
  [SeriesErrorCode.NOT_ENOUGH_TRANSLATIONS]: HttpStatus.BAD_REQUEST,
  [SeriesErrorCode.DUPLICATE_TITLE]: HttpStatus.CONFLICT,
};

export class SeriesException extends BaseException {
  constructor(
    code: SeriesErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(
      { message, code, errors: errors ?? {} },
      SERIES_ERROR_STATUS_MAP[code],
    );
  }
}
