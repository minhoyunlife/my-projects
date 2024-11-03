import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/src/app.module';
import { validationConfig } from '@/src/config/validation.config';

(async function () {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(validationConfig));

  await app.listen(process.env.APP_PORT || 3000);
})();
