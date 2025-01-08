import { BadRequestException, ValidationError } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export const INVALID_INPUT_DATA = 'INVALID_INPUT_DATA';

/**
 * ValidationPipe 설정 파일
 */
export default registerAs('validation', () => ({
  whitelist: true,
  forbidNonWhitelisted: true,
  validationError: {
    target: true,
    value: true,
  },
  transform: true, // class-transformer를 이용 가능하도록
  exceptionFactory: (validationErrors: ValidationError[]) => {
    const errors: Record<string, string[]> = {};

    validationErrors.forEach((error) => {
      errors[error.property] = Object.values(error.constraints || {});
    });

    return new BadRequestException({
      message: 'Input data is invalid',
      code: INVALID_INPUT_DATA,
      errors,
    });
  },
}));
