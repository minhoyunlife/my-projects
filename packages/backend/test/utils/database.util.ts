import { Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { TEST_DB_CONFIG } from '@/test/setups/database.setup';

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
 * 컨트롤러 테스트용 모듈 생성
 */
export async function createControllerTestingModule({
  entities,
  controllers = [],
  providers = [],
  imports = [],
}: TestModuleOptions) {
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
    controllers,
    providers,
  }).compile();
}

/**
 * 테이블 데이터 초기화
 */
export async function clearTables(
  dataSource: DataSource,
  entities: Type<any>[],
) {
  for (const entity of entities) {
    const tableName = dataSource.getMetadata(entity).tableName;
    await dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
  }
}
