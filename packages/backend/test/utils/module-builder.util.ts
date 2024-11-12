import { INestApplication, Type, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import validationPipeConfig from '@/src/modules/config/settings/validation-pipe.config';
import { TEST_DB_CONFIG } from '@/test/test.config';

type TestModuleOptions = {
  entities: Type<any>[];
  providers?: Type<any>[];
  controllers?: Type<any>[];
  imports?: any[];
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
    providers,
  }).compile();

  const app = moduleRef.createNestApplication();

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe(configService.get('validation')));

  return app;
}
