import { randomBytes } from 'crypto';

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

import cookieParser from 'cookie-parser';

import { AuthModule } from '@/src/modules/auth/auth.module';
import validationPipeConfig from '@/src/modules/config/settings/validation-pipe.config';
import { TEST_DB_CONFIG, TEST_S3_CONFIG } from '@/test/test.config';

type TestModuleOptions = {
  entities: Type<any>[];
  providers?: Provider[];
  controllers?: Type<any>[];
  imports?: (DynamicModule | Type<any>)[];
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
      testConfigModule,
      TypeOrmModule.forRoot({
        ...TEST_DB_CONFIG,
        entities,
        synchronize: true,
      }),
      TypeOrmModule.forFeature(entities),
      ...imports,
    ],
    providers,
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
    imports: [testConfigModule, ...imports],
    providers,
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
      testConfigModule,
      TypeOrmModule.forRoot({
        ...TEST_DB_CONFIG,
        entities,
        synchronize: true,
      }),
      TypeOrmModule.forFeature(entities),
      AuthModule,
      ...imports,
    ],
    controllers,
    providers,
  }).compile();

  const app = moduleRef.createNestApplication();

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe(configService.get('validation')));

  app.use(cookieParser());

  return app;
}

const testConfigModule = ConfigModule.forRoot({
  load: [
    () => ({
      validation: validationPipeConfig(), // 실제 환경 그대로
      auth: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        callbackUrl: 'http://localhost:3000/auth/github/callback',
        jwtSecret: 'test-secret-key',
        adminWebUrl: 'http://localhost:3000',
        adminEmail: 'test@example.com',
      },
      database: {
        encryptionKey: randomBytes(32).toString('base64'),
      },
      s3: {
        region: TEST_S3_CONFIG.region,
        accessKeyId: TEST_S3_CONFIG.credentials.accessKeyId,
        secretAccessKey: TEST_S3_CONFIG.credentials.secretAccessKey,
        bucket: TEST_S3_CONFIG.bucket,
        endpoint: TEST_S3_CONFIG.endpoint,
        cloudfrontDomain: TEST_S3_CONFIG.cloudfrontDomain,
      },
    }),
  ],
});
