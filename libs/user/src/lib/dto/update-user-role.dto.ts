import { IsEnum } from 'class-validator';
import { Role } from '../enum/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
