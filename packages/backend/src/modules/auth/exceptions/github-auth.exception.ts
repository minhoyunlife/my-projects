import { HttpStatus } from '@nestjs/common';

import { BaseException } from '@/src/common/exceptions/base.exception';

export enum GithubAuthErrorCode {
  INVALID_PROFILE = 'INVALID_PROFILE',
  NOT_ADMIN = 'NOT_ADMIN',
}

export const GITHUB_AUTH_ERROR_STATUS_MAP: Record<
  GithubAuthErrorCode,
  HttpStatus
> = {
  [GithubAuthErrorCode.INVALID_PROFILE]: HttpStatus.BAD_REQUEST,
  [GithubAuthErrorCode.NOT_ADMIN]: HttpStatus.UNAUTHORIZED,
};

export class GithubAuthException extends BaseException {
  constructor(
    code: GithubAuthErrorCode,
    message: string = 'Invalid Github profile',
    errors?: Record<string, string[]>,
  ) {
    super(
      {
        code,
        message,
        errors: errors ?? {},
      },
      GITHUB_AUTH_ERROR_STATUS_MAP[code],
    );
  }
}
