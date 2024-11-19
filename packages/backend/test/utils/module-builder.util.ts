import {
  DynamicModule,
  INestApplication,
  Provider,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import validationPipeConfig from '@/src/modules/config/settings/validation-pipe.config';
import { TEST_DB_CONFIG, TEST_S3_CONFIG } from '@/test/test.config';

type TestModuleOptions = {
  entities: Type<any>[];
  providers?: Provider[];
  controllers?: Type<any>[];
  imports?: (DynamicModule | Type<any>)[];
};

const dummyS3Provider = {
  provide: ConfigService,
  useValue: {
    get: (key: string) => {
      const {
        region,
        credentials: { accessKeyId, secretAccessKey },
        bucket,
        endpoint,
      } = TEST_S3_CONFIG;

      const config = {
        's3.region': region,
        's3.accessKeyId': accessKeyId,
        's3.secretAccessKey': secretAccessKey,
        's3.bucket': bucket,
        's3.endpoint': endpoint,
      };
      return config[key];
    },
  },
};

/**
 * 실제 DB 연결이 필요한 테스트를 위한, DB 의존성이 포함된 테스트 모듈
 */
export async function createTestingModuleWithDB({
  imports = [],
  entities,
  providers = [],
}: Omit<TestModuleOptions, 'controllers'>) {
  return Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...TEST_DB_CONFIG,
        entities,
        synchronize: true,
      }),
      TypeOrmModule.forFeature(entities),
      ...imports,
    ],
    providers: [dummyS3Provider, ...providers],
  }).compile();
}

/**
 * DB 연결 없는 단위 테스트를 위한, 단순 의존성 주입만 필요한 테스트 모듈
 */
export async function createTestingModuleWithoutDB({
  imports = [],
  providers = [],
}: Omit<TestModuleOptions, 'entities' | 'controllers'>) {
  return Test.createTestingModule({
    imports,
    providers: [dummyS3Provider, ...providers],
  }).compile();
}

/**
 * 컨트롤러 엔드포인트 테스트 등을 위한, 통합 테스트용 애플리케이션
 * - ValidationPipe 등 전체 앱 컨텍스트 포함
 */
export async function createTestingApp({
  entities,
  controllers = [],
  providers = [],
  imports = [],
}: TestModuleOptions): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [validationPipeConfig],
      }),
      TypeOrmModule.forRoot({
        ...TEST_DB_CONFIG,
        entities,
        synchronize: true,
      }),
      TypeOrmModule.forFeature(entities),
      ...imports,
    ],
    controllers,
    providers: [dummyS3Provider, ...providers],
  }).compile();

  const app = moduleRef.createNestApplication();

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe(configService.get('validation')));

  return app;
}
