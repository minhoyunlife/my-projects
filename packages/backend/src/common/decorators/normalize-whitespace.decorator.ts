import { Transform } from 'class-transformer';

type NormalizeWhitespaceOptions = {
  each?: boolean;
};

/**
 * 화이트 스페이스와 관련해서 정규화를 담당하는 데코레이터
 */
export function NormalizeWhitespace(options: NormalizeWhitespaceOptions = {}) {
  return Transform(({ value }) => {
    if (!value) return value;

    // 배열 정규화
    if (Array.isArray(value) && options.each) {
      return value
        .map((item) => {
          if (typeof item !== 'string') return item;
          return process(item);
        })
        .filter((item) => !!item);
    }

    // 문자열 정규화
    if (typeof value === 'string') {
      return process(value);
    }

    return value;
  });
}

function process(value: string) {
  return value.replace(/\p{White_Space}+/gu, ' ').trim();
}
