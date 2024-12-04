import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum TokenErrorCode {
  NOT_PROVIDED = 'TOKEN_NOT_PROVIDED',
  INVALID_FORMAT = 'INVALID_TOKEN_FORMAT',
  INVALID_TYPE = 'INVALID_TOKEN_TYPE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED = 'TOKEN_EXPIRED',
}

export const TOKEN_ERROR_STATUS_MAP: Record<TokenErrorCode, HttpStatus> = {
  [TokenErrorCode.NOT_PROVIDED]: HttpStatus.BAD_REQUEST,
  [TokenErrorCode.INVALID_FORMAT]: HttpStatus.BAD_REQUEST,
  [TokenErrorCode.INVALID_TYPE]: HttpStatus.BAD_REQUEST,
  [TokenErrorCode.INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
  [TokenErrorCode.EXPIRED]: HttpStatus.UNAUTHORIZED,
};

export class TokenException extends BaseException {
  constructor(
    code: TokenErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(
      { message, code, errors: errors ?? {} },
      TOKEN_ERROR_STATUS_MAP[code],
    );
  }
}
