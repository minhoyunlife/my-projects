import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export class TotpSetupFailedException extends BaseException {
  constructor(
    message: string = 'TOTP setup failed',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(message, status);
  }
}

export class TotpVerificationFailedException extends BaseException {
  constructor(
    message: string = 'TOTP verification failed',
    status: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super(message, status);
  }
}

export class TotpAlreadySetupException extends BaseException {
  constructor(
    message: string = 'TOTP already setup',
    status: HttpStatus = HttpStatus.CONFLICT,
  ) {
    super(message, status);
  }
}

export class TotpNotSetupException extends BaseException {
  constructor(
    message: string = 'TOTP not setup',
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, status);
  }
}

export class TotpMaxAttemptsExceededException extends BaseException {
  constructor(
    message: string = 'TOTP verification tries over max attempt',
    status: HttpStatus = HttpStatus.TOO_MANY_REQUESTS,
  ) {
    super(message, status);
  }
}
