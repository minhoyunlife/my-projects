/// <reference types="vitest/globals" />

import { describe as vitestDescribe } from 'vitest';

declare global {
  var describeWithDeps: typeof describe;
  var describeWithoutDeps: typeof describe;
}

/**
 * vitest의 describe 커스텀 래퍼 함수
 * 컨테이너 기동이 필요한지 아닌지에 따라 그대로 describe를 호출하든지, 아니면 skip을 호출
 * (각 테스트 코드 내의 최상위 describe 에만 사용)
 *
 * @param originalFn - vitest 의 원본 describe
 * @param requireDeps - 컨테이너 기동이 필요한지 여부를 나타내는 플래그
 * @returns - describe 또는 describe.skip
 */
function wrapDescribe(
  originalFn: typeof vitestDescribe,
  requireDeps: boolean,
): typeof vitestDescribe {
  const wrapped = function (name: string, ...args: any[]) {
    return requireDeps
      ? originalFn(name, ...args)
      : originalFn.skip(name, ...args);
  };
  return Object.assign(wrapped, originalFn);
}

const requireDeps = process.env.TEST_WITH_DEPS === 'true';

globalThis.describeWithDeps = wrapDescribe(vitestDescribe, requireDeps);
globalThis.describeWithoutDeps = wrapDescribe(vitestDescribe, !requireDeps);
