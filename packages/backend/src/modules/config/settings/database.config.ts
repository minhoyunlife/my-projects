import { registerAs } from '@nestjs/config';

import { Environment } from '@/src/common/enums/environment.enum';

/**
 * 데이터베이스 설정
 */
export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== Environment.PROD,
  logging: process.env.NODE_ENV !== Environment.PROD,
  ssl: process.env.NODE_ENV === Environment.PROD,
  encryption_key: process.env.DB_ENCRYPTION_KEY,
}));
