export const TEST_DB_CONFIG = {
  type: 'postgres' as const, // DataSourceOption 에서 리터럴 타입을 기대
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'password',
  database: 'test_db',
  entities: ['../src/**/*.entity.ts'],
};

export const TEST_S3_CONFIG = {
  endpoint: 'http://localhost:4566',
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  cloudfrontDomain: 'test.example.com',
  bucket: 'test-bucket',
  forcePathStyle: true,
};
