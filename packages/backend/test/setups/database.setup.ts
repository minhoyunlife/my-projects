import { execSync } from 'child_process';

import { DataSource } from 'typeorm';

export const TEST_DB_CONFIG = {
  type: 'postgres' as const, // DataSourceOption 에서 리터럴 타입을 기대
  host: process.env.TEST_DB_HOST || 'localhost',
  port: Number(process.env.TEST_DB_PORT) || 5433,
  username: process.env.TEST_DB_USERNAME || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: process.env.TEST_DB_NAME || 'test_db',
};

let dataSource: DataSource;

/**
 * 테스트 데이터베이스가 준비 상태인지를 확인
 */
async function waitForDatabase(maxRetries = 10) {
  for (let i = 1; i < maxRetries; i++) {
    try {
      execSync('docker compose exec -T db-test pg_isready -U postgres', {
        stdio: 'ignore',
      });
      console.log('Test database is ready!');
      return;
    } catch (error) {
      if (i === maxRetries) {
        throw new Error('Test database failed to become ready in time');
      }

      console.log(`Waiting for database... attempt ${i}/${maxRetries}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/**
 * 테스트 데이터베이스의 준비 및 TypeORM DataSource의 초기화
 */
export async function setup() {
  try {
    execSync('docker compose --profile test up -d db-test', {
      stdio: 'inherit',
    });

    await waitForDatabase();

    dataSource = new DataSource({
      ...TEST_DB_CONFIG,
      synchronize: false, // 일단 셋업 단계에서는 동기화를 비활성화
    });

    await dataSource.initialize();
    console.log('Connection to test database is successful!');
  } catch (error) {
    console.error('Setup failed:', error);
    // 오류가 발생했을 때, 테스트 데이터베이스 컨테이너를 종료합니다.
    await teardown();
    throw error;
  }
}

/**
 * 테스트 환경의 클린업
 */
export async function teardown() {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
  }

  execSync('docker compose --profile test down', {
    stdio: 'inherit',
  });
  console.log('Test environment cleaned up.');
}
