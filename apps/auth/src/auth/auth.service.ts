import {
  CreateUserDto,
  LoginDto,
  LoginResponseDto,
  RefreshToken,
  RefreshTokenDocument,
  Role,
  User,
  UserDocument,
} from '@maplestory/user';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
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

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);

      // 토큰 생성
      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateAndSaveRefreshToken(user);

      // 마지막 로그인 시간 업데이트
      user.lastLoginAt = new Date();
      await user.save();

      return LoginResponseDto.fromUser(user, accessToken, refreshToken);
    } catch (error) {
      if (error instanceof HttpException) {
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
      throw new BadRequestException('해당 이메일로 가입된 계정이 없습니다');
    }

    const isValidated = await argon2.verify(user.password, password);

    if (!isValidated) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다'
      );
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

  private async hashToken(token: string): Promise<string> {
    return argon2.hash(token, {
      type: argon2.argon2id,
      timeCost: 3,
      memoryCost: 1 << 16,
      parallelism: 2,
    });
  }
}
