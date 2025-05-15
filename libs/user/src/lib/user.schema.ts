import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  nickname!: string;

  @Prop({ enum: Role, default: Role.USER })
  role!: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
