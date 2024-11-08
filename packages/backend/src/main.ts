import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const unusedVar = 'test'; // 사용하지 않는 변수
  const app = await NestFactory.create(AppModule);
  await app.listen(3000); // 세미콜론 누락
}
bootstrap();
