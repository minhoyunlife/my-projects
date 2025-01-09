import { plainToInstance } from 'class-transformer';

/**
 * DTO 관련 테스트에서 사용할 DTO 인스턴스 생성용 헬퍼 함수
 *
 * @param classType - 생성하려는 DTO 클래스
 * @param defaultData - 테스트 케이스 전반에서 사용할 유효한 기본 데이터
 * @param override - 기본 데이터의 일부를 덮어쓸 데이터
 * @returns DTO 인스턴스
 */
export function createDto<T>(
  classType: new () => T,
  defaultData: Partial<T>,
  override?: Partial<T>,
): T {
  return plainToInstance(classType, {
    ...defaultData,
    ...override,
  });
}
