import { User } from '../schema/user.schema';

export class BaseUserResponseDto {
  id!: string;
  email!: string;
  nickname!: string;
  role!: string;

  static fromUser(user: User): BaseUserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };
  }
}
