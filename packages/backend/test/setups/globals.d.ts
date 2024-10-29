import { describe } from 'vitest';

declare global {
  var describeWithoutDB: typeof describe;
  var describeWithDB: typeof describe;
}

export {};
