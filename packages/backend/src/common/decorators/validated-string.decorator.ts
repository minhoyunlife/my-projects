import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { NormalizeWhitespace } from '@/src/common/decorators/normalize-whitespace.decorator';

interface ValidatedStringOptions {
  optional?: boolean;
  minLength?: number;
  maxLength?: number;
}

export function ValidatedString(options: ValidatedStringOptions = {}) {
  return function (target: object, propertyKey: string) {
    NormalizeWhitespace()(target, propertyKey);
    IsString()(target, propertyKey);

    if (options.optional) {
      IsOptional()(target, propertyKey);
    }
    if (options.minLength !== undefined) {
      MinLength(options.minLength)(target, propertyKey);
    }
    if (options.maxLength !== undefined) {
      MaxLength(options.maxLength)(target, propertyKey);
    }
  };
}
