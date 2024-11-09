import { execSync } from 'child_process';

import { DataSource } from 'typeorm';

import { TEST_DB_CONFIG } from '@/test/test.config';

let dataSource: DataSource;

/**
 * 테스트 데이터베이스 컨테이너가 준비 상태인지를 확인
 */
async function waitForDatabaseContainer(maxRetries = 10): Promise<Boolean> {
  for (let i = 1; i < maxRetries; i++) {
    try {
      execSync('docker compose exec -T db-test pg_isready -U postgres', {
        stdio: 'ignore',
      });
      console.log('Test database is ready!');
      return true;
    } catch (error) {
      console.log(`Waiting for database ready... attempt ${i}/${maxRetries}`);

      if (i === maxRetries) {
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

/**
 * 데이터베이스 연결 초기화
 */
async function initializeDatabase(retries = 3): Promise<DataSource> {
  for (let i = 0; i < retries; i++) {
    try {
      const ds = new DataSource({
        ...TEST_DB_CONFIG,
        entities: [],
        synchronize: false, // 일단 셋업 단계에서는 동기화를 비활성화
      });

      await ds.initialize();
      return ds;
    } catch (error) {
      console.error(
        `Database connection attempt ${i + 1}/${retries} failed:`,
        error.message,
      );

      if (i === retries - 1) {
        throw new Error(
          `Failed to initialize database after ${retries} attempts`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Unexpected error in initializeDatabase');
}

/**
 * 테스트 데이터베이스의 준비 및 TypeORM DataSource의 초기화
 */
export async function setup() {
  try {
    execSync('docker compose --profile test up -d db-test', {
      stdio: 'inherit',
    });

    const isContainerReady = await waitForDatabaseContainer();
    if (!isContainerReady) {
      throw new Error('Postgres container failed to become ready.');
    }

    dataSource = await initializeDatabase();

    console.log('Connection to test database is successful!');
  } catch (error) {
    console.error('Setup failed:', error);
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
