import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export class TokenNotProvidedException extends BaseException {
  constructor(
    message: string = 'Token not provided',
    status: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super(message, status);
  }
}

export class InvalidTokenFormatException extends BaseException {
  constructor(
    message: string = 'Invalid token format',
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, status);
  }
}

export class InvalidTokenTypeException extends BaseException {
  constructor(
    message: string = 'Invalid token type',
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, status);
  }
}

export class InvalidTokenException extends BaseException {
  constructor(
    message: string = 'Invalid token',
    status: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super(message, status);
  }
}
