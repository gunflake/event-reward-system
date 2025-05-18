import { RolesGuard } from '@maplestory/common';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import Joi from 'joi';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { ProxyService } from './proxy/proxy.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        AUTH_SERVER_URL: Joi.string().required(),
        EVENT_SERVER_URL: Joi.string().required(),
      }),
    }),
    HttpModule,
    PassportModule,
  ],
  controllers: [AppController],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard, ProxyService],
})
export class AppModule {}
