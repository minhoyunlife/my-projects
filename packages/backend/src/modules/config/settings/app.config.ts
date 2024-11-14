import { registerAs } from '@nestjs/config';

/**
 * 애플리케이션 설정
 */
export default registerAs('app', () => ({
  port: parseInt(process.env.SERVER_PORT, 10),
  env: process.env.NODE_ENV,
}));
