import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { appConfig } from '../../app.config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();

    const apiPath = req.originalUrl.split('?')[0];

    // public routes는 pass
    if (
      appConfig.publicRoutes.some((route) => {
        return apiPath === route;
      })
    )
      return true;
    return super.canActivate(ctx);
  }
}
