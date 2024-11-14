import { BadRequestException, ValidationError } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

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
      message: '입력 데이터가 유효하지 않습니다.',
      errors,
    });
  },
}));
