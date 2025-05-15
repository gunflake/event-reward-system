import { CreateUserDto, Role, User } from '@maplestory/user';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async create(userData: CreateUserDto): Promise<void> {
    try {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new BadRequestException('이미 등록된 이메일입니다');
      }

      const newUserData = {
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname,
        role: Role.USER,
      };

      // 사용자 저장
      const createdUser = new this.userModel(newUserData);
      await createdUser.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      //MongoDB 중복 키 오류 처리
      if (error.code === 11000) {
        throw new BadRequestException('이미 등록된 이메일입니다');
      }

      throw new InternalServerErrorException(
        '사용자 등록 중 오류가 발생했습니다'
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
