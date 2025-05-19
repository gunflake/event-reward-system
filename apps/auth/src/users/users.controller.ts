import { GetUser, Roles, RolesGuard } from '@maplestory/common';
import { BaseUserResponseDto, Role } from '@maplestory/user';
import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UpdateUserRoleDto, UserRoleUpdateResponseDto } from '../auth/dto';
import { UsersService } from './users.service';

@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@GetUser('id') userId: string): Promise<BaseUserResponseDto> {
    return this.usersService.findById(userId);
  }

  @Patch(':userId/role')
  @Roles(Role.ADMIN)
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ): Promise<UserRoleUpdateResponseDto> {
    return this.usersService.updateUserRole(userId, updateUserRoleDto);
  }
}
