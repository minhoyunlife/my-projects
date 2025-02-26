import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';

import { AppModule } from '@/src/app.module';

(async function () {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.enableCors({
    origin: [process.env.ADMIN_WEB_URL, process.env.FANARTS_WEB_URL],
    credentials: true,
  });

  app.enableShutdownHooks();

  app.setGlobalPrefix('api');

  await app.listen(configService.get('app').port);

  // test
})();
