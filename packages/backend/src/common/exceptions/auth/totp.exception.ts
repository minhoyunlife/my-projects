import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum TotpErrorCode {
  SETUP_FAILED = 'TOTP_SETUP_FAILED',
  CODE_MALFORMED = 'TOTP_CODE_MALFORMED',
  VERIFICATION_FAILED = 'TOTP_VERIFICATION_FAILED',
  NOT_SETUP = 'TOTP_NOT_SETUP',
  MAX_ATTEMPTS_EXCEEDED = 'TOTP_MAX_ATTEMPTS_EXCEEDED',
}

export const TOTP_ERROR_STATUS_MAP: Record<TotpErrorCode, HttpStatus> = {
  [TotpErrorCode.SETUP_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
  [TotpErrorCode.CODE_MALFORMED]: HttpStatus.BAD_REQUEST,
  [TotpErrorCode.VERIFICATION_FAILED]: HttpStatus.UNAUTHORIZED,
  [TotpErrorCode.NOT_SETUP]: HttpStatus.BAD_REQUEST,
  [TotpErrorCode.MAX_ATTEMPTS_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
};

export class TotpException extends BaseException {
  constructor(
    code: TotpErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super({ message, code, errors: errors ?? {} }, TOTP_ERROR_STATUS_MAP[code]);
  }
}
