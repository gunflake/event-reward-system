import { UserHeadersMiddleware } from '@maplestory/common';
import { DatabaseModule } from '@maplestory/database';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AppController } from './app.controller';
import { ClaimsModule, EventsModule } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_EVENT_URI: Joi.string().required(),
        AUTH_SERVER_URL: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRoot(process.env.MONGODB_EVENT_URI, {
      dbName: 'event-db',
      appName: 'event-app',
      autoIndex: false,
    }),
    EventsModule,
    ClaimsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserHeadersMiddleware).forRoutes('*'); // 모든 경로에 적용
  }
}
