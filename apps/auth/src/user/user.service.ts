import { CreateUserDto, Role, User } from '@maplestory/user';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async create(userData: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUserData = {
      email: userData.email,
      password: hashedPassword,
      nickname: userData.nickname,
      role: Role.USER,
    };

    const createdUser = new this.userModel(newUserData);
    return createdUser.save();
  }
}
