import { mergeConfig } from 'vitest/config';

import { baseConfig } from './vitest.config.base';

// 데이터베이스를 이용하지 않는 테스트를 수행하기 위한 설정
export default mergeConfig(baseConfig, {
  test: {
    env: {
      TEST_WITH_DB: 'false',
    },
  },
});
