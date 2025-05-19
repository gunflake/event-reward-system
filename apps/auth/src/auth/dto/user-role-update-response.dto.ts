import { BaseUserResponseDto, User } from '@maplestory/user';

export class UserRoleUpdateResponseDto {
  user!: BaseUserResponseDto;

  static fromUser(user: User): UserRoleUpdateResponseDto {
    const dto = new UserRoleUpdateResponseDto();
    dto.user = BaseUserResponseDto.fromUser(user);
    return dto;
  }
}
