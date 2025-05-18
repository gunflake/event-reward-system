import { CommonModule, UserHeadersMiddleware } from '@maplestory/common';
import { DatabaseModule } from '@maplestory/database';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRoot(process.env.MONGODB_URI, {
      dbName: 'auth-db',
      appName: 'auth-app',
      autoIndex: false,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserHeadersMiddleware).forRoutes('*'); // 모든 경로에 적용
  }
}
