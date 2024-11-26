import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';

import { AppModule } from '@/src/app.module';

(async function () {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe(configService.get('validation')));

  app.use(cookieParser());

  await app.listen(configService.get('app').port);
})();
