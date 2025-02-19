import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { DataSource, DataSourceOptions } from 'typeorm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 마이그레이션 용 데이터소스 정의
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`${__dirname}/../../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../*{.ts,.js}`],
  ssl: false,
};

export const dataSource = new DataSource(dataSourceOptions);
