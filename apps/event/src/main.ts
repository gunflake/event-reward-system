/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { HttpExceptionFilter } from '@maplestory/common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/event';
  app.setGlobalPrefix(globalPrefix);

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 자동으로 타입 변환 활성화
      whitelist: true, // DTO에 정의되지 않은 속성은 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 요청 거부
    })
  );

  // 전역 예외 필터 등록
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.EVENT_SERVER_PORT;

  if (!port) {
    throw new Error('EVENT_SERVER_PORT is not set');
  }

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
