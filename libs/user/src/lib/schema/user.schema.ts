import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CallbackError, HydratedDocument, Types } from 'mongoose';
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
  const user = this;

  // 비밀번호가 변경된 경우에만 해시 (수정 시에도 동작)
  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = 10;
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    return next();
  } catch (error) {
    return next(error as CallbackError);
  }
});
