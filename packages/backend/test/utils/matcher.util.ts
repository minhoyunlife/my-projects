import { Response } from 'supertest';

import { OpenAPIValidator } from '@/test/utils/openapi-validator.util';

// 향후 커스텀 매쳐가 필요할 시 이곳에서 정의할 것.
expect.extend({
  // 컨트롤러 테스트 시에 사용할, Supertest 의 리스폰스가 OpenAPI 스펙에 부합하는지를 검증하는 매쳐
  async toMatchOpenAPISpec(response: Response) {
    const validator = OpenAPIValidator.getInstance();
    await validator.initialize();

    try {
      validator.validateResponse(response);
      return {
        pass: true,
        message: () => 'Response matches OpenAPI specifications.',
      };
    } catch (error) {
      return {
        pass: false,
        message: () =>
          `${error instanceof Error ? error.message : 'Unknown Error'}`,
      };
    }
  },
});
