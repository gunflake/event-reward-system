import { GetUser, Roles, RolesGuard, UserInfo } from '@maplestory/common';
import { BaseUserResponseDto, Role } from '@maplestory/user';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
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

  @Get(':userId/login-history')
  async getUserLoginHistory(
    @Param('userId') userId: string,
    @GetUser() user: UserInfo
  ) {
    if (user.role === Role.USER && user.id !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return this.usersService.getUserLoginHistory(userId);
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
