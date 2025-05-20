import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export enum RewardType {
  POINT = 'POINT',
  ITEM = 'ITEM',
  COUPON = 'COUPON',
}

@Schema({ timestamps: true })
export class Reward {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  eventId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, type: String, enum: Object.values(RewardType) })
  type!: RewardType;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: any;

  @Prop({ required: true })
  quantity!: number;

  @Prop()
  description!: string;

  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  createdAt!: Date;

  updatedAt!: Date;
}

export type RewardDocument = HydratedDocument<Reward>;
export const RewardSchema = SchemaFactory.createForClass(Reward);

// 인덱스 생성
RewardSchema.index({ eventId: 1 });
RewardSchema.index({ type: 1 });
RewardSchema.index({ createdBy: 1 });
