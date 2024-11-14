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
 * 리포지토리 테스트용 모듈 생성
 */
export async function createRepositoryTestingModule({
  entities,
  providers = [],
}: Omit<TestModuleOptions, 'controllers' | 'imports'>) {
  return Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...TEST_DB_CONFIG,
        entities,
        synchronize: true,
      }),
      TypeOrmModule.forFeature(entities),
    ],
    providers,
  }).compile();
}

/**
 * 서비스 테스트용 모듈 생성
 */
export async function createServiceTestingModule({
  providers = [],
}: Omit<TestModuleOptions, 'entities' | 'controllers' | 'imports'>) {
  return Test.createTestingModule({
    providers: [dummyS3Provider, ...providers],
  }).compile();
}

/**
 * 컨트롤러 테스트용 어플리케이션 생성
 */
export async function createControllerTestingApp({
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
