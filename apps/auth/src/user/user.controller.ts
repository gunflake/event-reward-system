import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../../../../libs/user/src/lib/dto/create-user.dto';
import { User } from '../../../../libs/user/src/lib/user.schema';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}
