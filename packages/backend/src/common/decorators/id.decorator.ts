import { nanoid } from 'nanoid';
import { PrimaryColumn, PrimaryColumnOptions } from 'typeorm';

/**
 * 엔티티 클래스의 ID를 NanoID 형식으로 생성 및 저장하기 위한 데코레이터
 * (본 데코레이터의 테스트는, 엔티티 정의 파일의 테스트에서 수행할 예정)
 * @param length 생성할 ID의 길이
 */
export function NanoId(
  length: number = 21,
  options: PrimaryColumnOptions = {},
): PropertyDecorator {
  return function (target: object, propertyKey: string) {
    PrimaryColumn({
      type: 'varchar',
      length: length,
      default: () => nanoid(length),
      ...options,
    })(target, propertyKey);
  };
}
