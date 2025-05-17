import { registerAs } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { TypeOrmLoggerAdapter } from '@/src/modules/logger/typeorm.logger.adapter';

/**
 * 데이터베이스 설정
 */
const databaseConfig = registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  encryptionKey: process.env.DB_ENCRYPTION_KEY,
}));

export default databaseConfig;

export const getTypeOrmConfig = (): TypeOrmModuleAsyncOptions => ({
  inject: [WINSTON_MODULE_PROVIDER],
  useFactory: (logger: Logger) => {
    return {
      ...databaseConfig(),
      logger: new TypeOrmLoggerAdapter(logger),
    };
  },
});
