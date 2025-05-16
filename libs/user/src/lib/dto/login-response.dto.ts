import { User } from '../user.schema';

export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    nickname: string;
    role: string;
  };

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }

  static fromUser(
    user: User,
    accessToken: string,
    refreshToken: string
  ): LoginResponseDto {
    return new LoginResponseDto({
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    });
  }
}
