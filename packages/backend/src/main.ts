import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/src/app.module';

(async function () {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: true,
        value: true,
      },
      transform: true, // class-transformer를 이용 가능하도록
    }),
  );

  await app.listen(process.env.APP_PORT || 3000);
})();
