import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum SeriesErrorCode {
  NOT_ENOUGH_TRANSLATIONS = 'NOT_ENOUGH_TRANSLATIONS',
  DUPLICATE_TITLE = 'DUPLICATE_TITLE',
  NOT_FOUND = 'NOT_FOUND',
  IN_USE = 'IN_USE',
}

export const SERIES_ERROR_STATUS_MAP: Record<SeriesErrorCode, HttpStatus> = {
  [SeriesErrorCode.NOT_ENOUGH_TRANSLATIONS]: HttpStatus.BAD_REQUEST,
  [SeriesErrorCode.DUPLICATE_TITLE]: HttpStatus.CONFLICT,
  [SeriesErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [SeriesErrorCode.IN_USE]: HttpStatus.CONFLICT,
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
