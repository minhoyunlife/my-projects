import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 데이터베이스 설정
 */
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production',
};
