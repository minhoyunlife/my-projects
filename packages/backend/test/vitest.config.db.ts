import { mergeConfig } from 'vitest/config';

import { baseConfig } from './vitest.config.base';

// 데이터베이스를 이용한 테스트를 수행하기 위한 설정
export default mergeConfig(baseConfig, {
  test: {
    globalSetup: 'test/setups/database.setup.ts',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    }, // 테스트 파일 간의 데이터 간섭을 방지하기 위해
    testTimeout: 10000,
    env: {
      TEST_WITH_DB: 'true',
    },
  },
});
