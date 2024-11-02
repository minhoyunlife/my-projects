import { mergeConfig } from 'vitest/config';

import { baseConfig } from './vitest.config.base';

// 데이터베이스를 이용한 테스트를 수행하기 위한 설정
export default mergeConfig(baseConfig, {
  test: {
    globalSetup: 'test/setups/database.setup.ts',
    setupFiles: ['test/utils/matcher.util.ts'],
    fileParallelism: false, // 테스트 파일 간 병렬 실행을 방지 (순차 실행하도록)
    testTimeout: 10000,
    env: {
      TEST_WITH_DB: 'true',
    },
  },
});
