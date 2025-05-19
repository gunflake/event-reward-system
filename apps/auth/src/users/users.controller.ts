import { Roles, RolesGuard } from '@maplestory/common';
import {
  Role,
  UpdateUserRoleDto,
  UserRoleUpdateResponseDto,
} from '@maplestory/user';
import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':userId/role')
  @Roles(Role.ADMIN)
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ): Promise<UserRoleUpdateResponseDto> {
    return this.usersService.updateUserRole(userId, updateUserRoleDto);
  }
}
