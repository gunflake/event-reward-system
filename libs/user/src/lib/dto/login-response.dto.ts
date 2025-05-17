import { User } from '../schema/user.schema';
import { BaseUserResponseDto } from './base-user-response.dto';

export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: BaseUserResponseDto;

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
      user: BaseUserResponseDto.fromUser(user),
    });
  }
}
