import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

interface ValidatedStringArrayOptions {
  optional?: boolean;
  notEmpty?: boolean;
}

export function ValidatedStringArray(
  options: ValidatedStringArrayOptions = {},
) {
  return function (target: object, propertyKey: string) {
    IsArray()(target, propertyKey);
    IsString({ each: true })(target, propertyKey);

    if (options.optional) {
      IsOptional()(target, propertyKey);
    }
    if (options.notEmpty) {
      ArrayNotEmpty()(target, propertyKey);
    }
  };
}

interface ValidatedEnumArrayOptions {
  optional?: boolean;
}

export function ValidatedEnumArray<T extends object>(
  enumType: T,
  options: ValidatedEnumArrayOptions = {},
) {
  return function (target: object, propertyKey: string) {
    IsArray()(target, propertyKey);
    IsEnum(enumType, { each: true })(target, propertyKey);

    if (options.optional) {
      IsOptional()(target, propertyKey);
    }
  };
}
