import { RolesGuard } from '@maplestory/common';
import { All, Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ProxyService } from './proxy/proxy.service';

@UseGuards(JwtAuthGuard, RolesGuard) // 전역 가드
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private proxy: ProxyService) {}

  @Get()
  getData() {
    return { message: 'Hello gateway API' };
  }

  @All('auth/*')
  async authProxy(@Req() req: Request & { user?: any }) {
    const extra = req.user
      ? {
          'x-user-id': req.user['id'],
          'x-user-email': req.user['email'],
          'x-user-role': req.user['role'],
        }
      : {};

    this.logger.log(`authProxy: ${req.originalUrl}`);

    return this.proxy.forward('auth', req, extra);
  }

  @All('event/*')
  async eventProxy(@Req() req: Request & { user?: any }) {
    const extra = {
      'x-user-id': req.user['id'],
      'x-user-email': req.user['email'],
      'x-user-role': req.user['role'],
    };
    return this.proxy.forward('event', req, extra);
  }
}
