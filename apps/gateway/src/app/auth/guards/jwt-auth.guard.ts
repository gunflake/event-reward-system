import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { appConfig } from '../../app.config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();

    console.log(appConfig.publicRoutes.join(','));
    // public routes는 pass
    if (appConfig.publicRoutes.includes(req.url)) return true;
    return super.canActivate(ctx);
  }
}
