import { Role } from '../enum/role.enum';
import { User } from '../schema/user.schema';
import { BaseUserResponseDto } from './base-user-response.dto';

export class UserRoleUpdateResponseDto {
  user!: BaseUserResponseDto;

  static fromUser(user: User): UserRoleUpdateResponseDto {
    const dto = new UserRoleUpdateResponseDto();
    dto.user = BaseUserResponseDto.fromUser(user);
    return dto;
  }
}
