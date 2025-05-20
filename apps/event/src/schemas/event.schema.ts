import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { EventStatus } from '../modules/events/enums/event-status.enum';
import { EventType } from '../modules/events/enums/event-type.enum';

/**
 * 이벤트 조건 스키마
 * 이벤트 달성을 위한 각종 조건들을 정의함
 */
export class EventCondition {
  /**
   * 조건의 유형 (LOGIN_DAYS, REACH_LEVEL, COMPLETE_MISSION 등)
   * 이벤트 참여 조건의 종류를 지정
   */
  @Prop({ required: true })
  type: string;

  /**
   * 조건의 값 (조건 유형에 따라 다름)
   * - LOGIN_DAYS: 로그인 일수 (예: 7)
   * - REACH_LEVEL: 도달해야 하는 레벨 (예: 30)
   * - COMPLETE_MISSION: 완료해야 하는 미션 ID
   */
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: any;

  /**
   * 조건에 대한 설명
   * 사용자에게 보여지는 조건 설명 텍스트
   */
  @Prop({ required: true })
  description: string;
}

/**
 * 이벤트 스키마
 * 게임 내 각종 이벤트 정보를 저장
 */
@Schema({ timestamps: true })
export class Event {
  /**
   * MongoDB에서 자동 생성되는 문서의 고유 식별자
   */
  _id!: Types.ObjectId;

  /**
   * 이벤트 이름
   * 사용자에게 표시되는 이벤트의 제목
   */
  @Prop({ required: true })
  name!: string;

  /**
   * 이벤트 설명
   * 이벤트에 대한 상세한 설명 텍스트
   */
  @Prop({ required: true })
  description!: string;

  /**
   * 이벤트 타입
   * 이벤트의 종류를 나타내며, 검증 방식 결정에 사용됨
   */
  @Prop({
    required: true,
    type: String,
    enum: Object.values(EventType),
  })
  type!: EventType;

  /**
   * 이벤트 시작일
   * 이벤트가 활성화되는 시작 날짜 및 시간
   */
  @Prop({ required: true })
  startDate!: Date;

  /**
   * 이벤트 종료일
   * 이벤트가 종료되는 날짜 및 시간
   */
  @Prop({ required: true })
  endDate!: Date;

  /**
   * 이벤트 달성 조건 목록
   * 이벤트 참여/완료를 위해 사용자가 충족해야 하는 조건들
   */
  @Prop({ type: [{ type: Object }] })
  conditions: EventCondition[];

  /**
   * 이벤트 상태 (DRAFT, SCHEDULED, ACTIVE, ENDED, CANCELLED)
   * 현재 이벤트의 진행 상태
   */
  @Prop({ required: true, type: String, enum: Object.values(EventStatus) })
  status!: EventStatus;

  /**
   * 이벤트를 생성한 관리자 또는 운영자의 ID
   * users 컬렉션의 문서를 참조함
   */
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  /**
   * 이벤트 생성 시간 (자동 생성됨)
   */
  createdAt!: Date;

  /**
   * 이벤트 마지막 수정 시간 (자동 생성됨)
   */
  updatedAt!: Date;
}

export type EventDocument = HydratedDocument<Event>;
export const EventSchema = SchemaFactory.createForClass(Event);

// 인덱스 생성
/**
 * 이벤트 상태로 필터링하기 위한 인덱스
 */
EventSchema.index({ status: 1 });

/**
 * 이벤트 타입으로 필터링하기 위한 인덱스
 */
EventSchema.index({ type: 1 });

/**
 * 시작일로 검색하기 위한 인덱스
 */
EventSchema.index({ startDate: 1 });

/**
 * 종료일로 검색하기 위한 인덱스
 */
EventSchema.index({ endDate: 1 });

/**
 * 생성자 ID로 검색하기 위한 인덱스
 */
EventSchema.index({ createdBy: 1 });

/**
 * 상태, 시작일, 종료일로 복합 검색하기 위한 인덱스
 * 활성 이벤트 목록 등을 빠르게 조회할 때 사용
 */
EventSchema.index({ status: 1, startDate: 1, endDate: 1 });

/**
 * 타입, 상태로 복합 검색하기 위한 인덱스
 * 특정 타입의 활성 이벤트를 빠르게 조회할 때 사용
 */
EventSchema.index({ type: 1, status: 1 });
