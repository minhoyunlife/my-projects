import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum GenreErrorCode {
  NOT_ENOUGH_TRANSLATIONS = 'NOT_ENOUGH_TRANSLATIONS',
  NO_TRANSLATIONS_PROVIDED = 'NO_TRANSLATIONS_PROVIDED',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_NAME = 'DUPLICATE_NAME',
  IN_USE = 'IN_USE',
}

export const GENRE_ERROR_STATUS_MAP: Record<GenreErrorCode, HttpStatus> = {
  [GenreErrorCode.NOT_ENOUGH_TRANSLATIONS]: HttpStatus.BAD_REQUEST,
  [GenreErrorCode.NO_TRANSLATIONS_PROVIDED]: HttpStatus.BAD_REQUEST,
  [GenreErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [GenreErrorCode.DUPLICATE_NAME]: HttpStatus.CONFLICT,
  [GenreErrorCode.IN_USE]: HttpStatus.CONFLICT,
};

export class GenreException extends BaseException {
  constructor(
    code: GenreErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(
      { message, code, errors: errors ?? {} },
      GENRE_ERROR_STATUS_MAP[code],
    );
  }
}
