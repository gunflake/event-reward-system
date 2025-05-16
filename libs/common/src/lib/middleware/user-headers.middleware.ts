// libs/common/src/lib/middleware/user-headers.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class UserHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 헤더에서 사용자 정보 추출
    const userId = req.headers['x-user-id'] as string;
    const email = req.headers['x-user-email'] as string;
    const role = req.headers['x-user-role'] as string;

    // 사용자 객체 생성 및 request에 추가
    if (userId && email && role) {
      (req as any).user = {
        id: userId,
        email: email,
        role: role,
      };
    }

    next();
  }
}
