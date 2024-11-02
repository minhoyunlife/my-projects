export const TEST_DB_CONFIG = {
  type: 'postgres' as const, // DataSourceOption 에서 리터럴 타입을 기대
  host: process.env.TEST_DB_HOST || 'localhost',
  port: Number(process.env.TEST_DB_PORT) || 5433,
  username: process.env.TEST_DB_USERNAME || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: process.env.TEST_DB_NAME || 'test_db',
  entities: ['../src/**/*.entity.ts'],
};
