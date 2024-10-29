/// <reference types="./globals" />

import { describe as vitestDescribe } from 'vitest';

/**
 * vitest의 describe 커스텀 래퍼 함수
 * 데이터베이스가 필요한지 아닌지에 따라 그대로 describe를 호출하든지, 아니면 skip을 호출
 * (각 테스트 코드 내의 최상위 describe 에만 사용)
 *
 * @param originalFn - vitest 의 원본 describe
 * @param requireDB - 데이터베이스 접속이 필요한지 여부를 나타내는 플래그
 * @returns - describe 또는 describe.skip
 */
function wrapDescribe(
  originalFn: typeof vitestDescribe,
  requireDB: boolean,
): typeof vitestDescribe {
  const wrapped = function (name: string, ...args: any[]) {
    return requireDB
      ? originalFn(name, ...args)
      : originalFn.skip(name, ...args);
  };
  return Object.assign(wrapped, originalFn);
}

const requireDB = process.env.TEST_WITH_DB === 'true';

globalThis.describeWithDB = wrapDescribe(vitestDescribe, requireDB);
globalThis.describeWithoutDB = wrapDescribe(vitestDescribe, !requireDB);
