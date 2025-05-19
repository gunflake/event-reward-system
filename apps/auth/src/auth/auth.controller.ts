import { LoginDto, LoginResponseDto } from '@maplestory/user';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, RefreshTokenDto } from './dto';
import { SignupResponseDto } from './dto/signup-response.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto
  ): Promise<SignupResponseDto> {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<LoginResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}
