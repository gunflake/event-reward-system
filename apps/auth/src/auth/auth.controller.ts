import { Roles, RolesGuard } from '@maplestory/common';
import {
  CreateUserDto,
  LoginDto,
  LoginResponseDto,
  Role,
  UpdateUserRoleDto,
  UserRoleUpdateResponseDto,
} from '@maplestory/user';
import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.authService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Patch('users/:userId/role')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ): Promise<UserRoleUpdateResponseDto> {
    return this.authService.updateUserRole(userId, updateUserRoleDto);
  }
}
