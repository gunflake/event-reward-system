import { isValidObjectId } from '@maplestory/common';
import {
  BaseUserResponseDto,
  UpdateUserRoleDto,
  User,
  UserDocument,
  UserRoleUpdateResponseDto,
} from '@maplestory/user';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async findById(userId: string): Promise<BaseUserResponseDto> {
    try {
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('유효하지 않은 사용자 ID 형식입니다.');
      }

      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new BadRequestException('사용자를 찾을 수 없습니다.');
      }

      return BaseUserResponseDto.fromUser(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `사용자 조회 중 오류 발생: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        '사용자 조회 중 오류가 발생했습니다.'
      );
    }
  }

  async updateUserRole(
    userId: string,
    updateUserRoleDto: UpdateUserRoleDto
  ): Promise<UserRoleUpdateResponseDto> {
    try {
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('유효하지 않은 사용자 ID 형식입니다.');
      }

      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new BadRequestException('사용자를 찾을 수 없습니다.');
      }

      user.role = updateUserRoleDto.role;
      user.updatedAt = new Date();

      await user.save();

      return UserRoleUpdateResponseDto.fromUser(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `사용자 역할 업데이트 중 오류 발생: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        '사용자 역할 업데이트 중 오류가 발생했습니다.'
      );
    }
  }
}
