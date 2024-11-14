import { mergeConfig } from 'vitest/config';

import baseConfig from './vitest.config.base';

// 컨테이너 기동이 필요 없는 테스트를 수행하기 위한 설정
export default mergeConfig(baseConfig, {
  test: {
    env: {
      TEST_WITH_DEPS: 'false',
    },
  },
});
