import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { EventStatus } from '../modules/events/enums/event-status.enum';

@Schema({ timestamps: true })
export class EventCondition {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: any;

  @Prop({ required: true })
  description: string;
}

@Schema({ timestamps: true })
export class Event {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ type: [{ type: Object }] })
  conditions: EventCondition[];

  @Prop({ required: true, type: String, enum: Object.values(EventStatus) })
  status!: EventStatus;

  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  createdAt!: Date;

  updatedAt!: Date;
}

export type EventDocument = HydratedDocument<Event>;
export const EventSchema = SchemaFactory.createForClass(Event);

// 인덱스 생성
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ endDate: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ status: 1, startDate: 1, endDate: 1 });
