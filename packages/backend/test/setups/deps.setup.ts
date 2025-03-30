import { execSync } from 'child_process';

import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { DataSource } from 'typeorm';

import { TEST_DB_CONFIG, TEST_S3_CONFIG } from '@/test/test.config';

interface TestResources {
  dataSource?: DataSource;
  s3Client?: S3Client;
}

let testResources: TestResources = {};

/**
 * 테스트에 필요한 컨테이너가 준비 상태인지를 확인
 */
async function waitForContainer(
  checkCommand: string,
  serviceName: string,
  maxRetries = 10,
): Promise<Boolean> {
  for (let i = 1; i < maxRetries; i++) {
    try {
      execSync(checkCommand, { stdio: 'ignore' });
      console.log(`${serviceName} container is ready!`);
      return true;
    } catch (error) {
      console.log(
        `Waiting for ${serviceName} ready... attempt ${i}/${maxRetries}`,
      );

      if (i === maxRetries) {
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

/**
 * 데이터베이스 컨테이너의 준비 상태 확인
 */
async function waitForDatabaseContainer(): Promise<Boolean> {
  return waitForContainer(
    'docker compose exec -T test-db pg_isready -U postgres',
    'Test database',
  );
}

/**
 * 로컬스택 컨테이너의 준비 상태 확인
 */
async function waitForLocalStackContainer(): Promise<Boolean> {
  return waitForContainer(
    'docker compose exec -T localstack curl -f http://localhost:4566/_localstack/health',
    'LocalStack',
  );
}

/**
 * 데이터베이스 연결 초기화
 */
async function initializeDatabase(retries = 3): Promise<DataSource> {
  for (let i = 0; i < retries; i++) {
    try {
      const ds = new DataSource({
        ...TEST_DB_CONFIG,
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
 * S3 관련 초기화
 */
export async function initializeS3(retries = 3): Promise<S3Client> {
  for (let i = 0; i < retries; i++) {
    try {
      const client = new S3Client(TEST_S3_CONFIG);
      await client.send(
        new CreateBucketCommand({
          Bucket: TEST_S3_CONFIG.bucket,
        }),
      );
      return client;
    } catch (error) {
      console.error(
        `S3 initialization attempt ${i + 1}/${retries} failed:`,
        error.message,
      );

      if (i === retries - 1) {
        throw new Error(`Failed to initialize S3 after ${retries} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Unexpected error in initializeS3');
}

/**
 * 필요 컨테이너의 준비 및 초기화
 */
export async function setup() {
  try {
    execSync(
      'docker compose --profile test down && docker compose --profile test up -d',
      {
        stdio: 'inherit',
      },
    );

    const [isDBReady, isLocalStackReady] = await Promise.all([
      waitForDatabaseContainer(),
      waitForLocalStackContainer(),
    ]);

    if (!isDBReady) {
      throw new Error('Database container failed to become ready.');
    }
    if (!isLocalStackReady) {
      throw new Error('LocalStack container failed to become ready.');
    }

    const [dataSource, s3Client] = await Promise.all([
      initializeDatabase(),
      initializeS3(),
    ]);

    testResources = { dataSource, s3Client };
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
  if (testResources.dataSource?.isInitialized) {
    await testResources.dataSource.destroy();
  }

  // 로컬스택의 경우 stateless 일 것이므로, 별도 클린업은 수행하지 않음.

  execSync('docker compose --profile test down', {
    stdio: 'inherit',
  });
  console.log('Test environment cleaned up.');
}
