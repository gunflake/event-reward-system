import { BaseUserResponseDto, User } from '@maplestory/user';

export class SignupResponseDto {
  user!: BaseUserResponseDto;

  constructor(partial: Partial<SignupResponseDto>) {
    Object.assign(this, partial);
  }

  static fromUser(user: User): SignupResponseDto {
    return new SignupResponseDto({
      user: BaseUserResponseDto.fromUser(user),
    });
  }
}
