/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { HttpExceptionFilter, TransformInterceptor } from '@maplestory/common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 유효성 검증 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // 전역 응답 변환 인터셉터 적용
  app.useGlobalInterceptors(new TransformInterceptor());

  // 전역 예외 필터 등록
  app.useGlobalFilters(new HttpExceptionFilter());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 8001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
