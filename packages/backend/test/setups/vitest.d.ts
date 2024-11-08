import { Response } from 'supertest';
import { describe } from 'vitest';

declare module 'vitest' {
  // 커스텀 matcher 를 등록
  interface Assertion<T = any> {
    toMatchOpenAPISpec(): Promise<void>;
  }
}

export {};
