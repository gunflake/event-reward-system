import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../enum/role.enum';

/**
 * 사용자 스키마
 * 시스템에 등록된 사용자 정보를 저장
 */
@Schema({ timestamps: true })
export class User {
  /**
   * MongoDB에서 자동 생성되는 문서의 고유 식별자
   */
  _id!: Types.ObjectId;

  /**
   * 사용자 이메일 주소
   * 로그인 식별자로 사용되며 중복 불가
   */
  @Prop({ required: true, unique: true })
  email!: string;

  /**
   * 사용자 비밀번호
   * argon2 알고리즘으로 해시되어 저장됨
   */
  @Prop({ required: true })
  password!: string;

  /**
   * 사용자 닉네임
   * 시스템 내에서 표시되는 이름
   */
  @Prop({ required: true })
  nickname!: string;

  /**
   * 사용자 역할
   * 시스템 내 권한 수준을 결정 (USER, OPERATOR, ADMIN, AUDITOR)
   */
  @Prop({ type: String, enum: Role, default: Role.USER })
  role!: Role;

  /**
   * 마지막 로그인 시간
   * 사용자가 가장 최근에 로그인한 시간
   */
  @Prop({ type: Date })
  lastLoginAt?: Date;

  /**
   * 사용자 생성 시간 (자동 생성됨)
   */
  createdAt!: Date;

  /**
   * 사용자 정보 마지막 수정 시간 (자동 생성됨)
   */
  updatedAt!: Date;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * 비밀번호를 해시하는 미들웨어
 * 사용자 저장 전에 비밀번호가 변경되었다면
 * argon2id 알고리즘을 사용하여 해시 처리
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // ▶ 파라미터: timeCost=3, memoryCost=2^16(=65 536 KB ≒ 64 MB)
  this.password = await argon2.hash(this.password, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 1 << 16,
    parallelism: 2,
  });
  next();
});
