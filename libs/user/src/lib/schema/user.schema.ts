import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../enum/role.enum';

@Schema({ timestamps: true })
export class User {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  nickname!: string;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role!: Role;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

// 비밀번호를 해시하는 미들웨어 추가
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
