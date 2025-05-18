import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const publicRoutes = ['/api/auth/login', '/api/auth/signup', '/api'];

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();

    // public routes는 pass
    if (publicRoutes.includes(req.url)) return true;
    return super.canActivate(ctx);
  }
}
