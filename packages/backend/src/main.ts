import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';

import { AppModule } from '@/src/app.module';

(async function () {
  const app = await NestFactory.create(AppModule, { logger: false });
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.ADMIN_WEB_URL,
    credentials: true,
  });

  app.enableShutdownHooks();

  await app.listen(configService.get('app').port);
})();
