import { IsInt, IsOptional, Max, Min } from 'class-validator';

interface ValidatedIntOptions {
  optional?: boolean;
  min?: number;
  max?: number;
}

export function ValidatedInt(options: ValidatedIntOptions = {}) {
  return function (target: object, propertyKey: string) {
    IsInt()(target, propertyKey);

    if (options.optional) {
      IsOptional()(target, propertyKey);
    }
    if (options.min !== undefined) {
      Min(options.min)(target, propertyKey);
    }
    if (options.max !== undefined) {
      Max(options.max)(target, propertyKey);
    }
  };
}
