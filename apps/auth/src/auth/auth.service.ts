import { isValidObjectId } from '@maplestory/common';
import {
  CreateUserDto,
  LoginDto,
  LoginResponseDto,
  RefreshToken,
  RefreshTokenDocument,
  Role,
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
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly REFRESH_TOKEN_BYTES = 32;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;
  private readonly REFRESH_TOKEN_SALT_ROUNDS = 10;
  private readonly ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService
  ) {}

  async create(userData: CreateUserDto): Promise<void> {
    try {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new BadRequestException('이미 등록된 이메일입니다');
      }

      // 비밀번호 해싱
      const hashedPassword = await this.hashPassword(userData.password);

      const newUserData = {
        email: userData.email,
        password: hashedPassword,
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

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 올바르지 않습니다'
        );
      }

      // 토큰 생성
      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateAndSaveRefreshToken(user);

      // 마지막 로그인 시간 업데이트
      user.lastLoginAt = new Date();
      await user.save();

      return LoginResponseDto.fromUser(user, accessToken, refreshToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`로그인 오류: ${error.message}`, error.stack);

      throw new InternalServerErrorException(
        '로그인 처리 중 오류가 발생했습니다'
      );
    }
  }

  private async validateUser(
    email: string,
    password: string
  ): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private generateAccessToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private async generateAndSaveRefreshToken(
    user: UserDocument
  ): Promise<string> {
    const rawToken = crypto
      .randomBytes(this.REFRESH_TOKEN_BYTES)
      .toString('hex');
    const hashedToken = await this.hashToken(rawToken);

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.REFRESH_TOKEN_EXPIRY_DAYS * this.ONE_DAY_IN_MS
    );

    const refreshTokenEntity = new this.refreshTokenModel({
      userId: user._id,
      token: hashedToken,
      issuedAt: now,
      expiresAt: expiresAt,
    });

    await refreshTokenEntity.save();
    return rawToken;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, this.REFRESH_TOKEN_SALT_ROUNDS);
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
