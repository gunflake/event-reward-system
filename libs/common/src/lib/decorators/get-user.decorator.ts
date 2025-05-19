import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Request 객체에서 사용자 정보를 추출하는 데코레이터
 *
 * 사용 예시:
 * - 전체 사용자 객체 추출: @GetUser() user: UserInfo
 * - 특정 속성만 추출: @GetUser('id') userId: string
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // user가 없는 경우 null 반환
    if (!user) {
      return null;
    }

    // data가 제공된 경우 특정 속성만 반환
    // 예: @GetUser('id')는 user.id만 반환
    return data ? user[data] : user;
  }
);
