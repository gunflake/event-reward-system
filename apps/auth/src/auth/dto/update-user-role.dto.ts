import { Role } from '@maplestory/user';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
