import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export class InvalidTokenException extends BaseException {
  constructor(
    message: string = 'Invalid token',
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, status);
  }
}

export class JwtAuthFailedException extends BaseException {
  constructor(
    message: string = 'JWT auth failed',
    status: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super(message, status);
  }
}

export class RefreshTokenNotProvidedException extends BaseException {
  constructor(
    message: string = 'Refresh token not provided',
    status: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super(message, status);
  }
}
