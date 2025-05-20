import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

/**
 * 보상 청구 상태 enum
 */
export enum ClaimStatus {
  PENDING = 'PENDING', // 대기중 (검증 전)
  APPROVED = 'APPROVED', // 승인됨 (보상 지급)
  REJECTED = 'REJECTED', // 거절됨 (조건 미충족)
}

/**
 * 지급된 보상 정보 스키마
 */
@Schema({ _id: false })
export class IssuedReward {
  /**
   * 보상 ID (rewards 컬렉션 참조)
   */
  @Prop({ type: Types.ObjectId, required: true })
  rewardId: Types.ObjectId;

  /**
   * 보상 유형 (POINT, ITEM, COUPON)
   */
  @Prop({ required: true })
  type: string;

  /**
   * 보상 값 (보상 유형에 따라 다름)
   */
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: any;

  /**
   * 보상 지급 시간
   */
  @Prop({ type: Date, default: Date.now })
  issuedAt: Date;
}

/**
 * 보상 청구 스키마
 * 사용자의 보상 요청 및 지급 이력 관리
 */
@Schema({ timestamps: true })
export class RewardClaim {
  /**
   * MongoDB에서 자동 생성되는 문서의 고유 식별자
   */
  _id!: Types.ObjectId;

  /**
   * 보상을 요청한 사용자 ID
   * users 컬렉션의 문서를 참조함
   */
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  /**
   * 보상 요청 대상 이벤트 ID
   * events 컬렉션의 문서를 참조함
   */
  @Prop({ type: Types.ObjectId, required: true })
  eventId!: Types.ObjectId;

  /**
   * 보상 요청 상태
   * PENDING: 대기중, APPROVED: 승인됨, REJECTED: 거절됨
   */
  @Prop({
    type: String,
    enum: Object.values(ClaimStatus),
    default: ClaimStatus.PENDING,
  })
  status!: ClaimStatus;

  /**
   * 조건 충족 증거
   * 사용자가 제공한 조건 충족 증거 데이터
   */
  @Prop({ type: MongooseSchema.Types.Mixed })
  evidence?: any;

  /**
   * 지급된 보상 정보 배열
   * 승인된 경우 지급된 보상 목록
   */
  @Prop({ type: [Object], default: [] })
  rewards: IssuedReward[];

  /**
   * 검증 시간
   * 보상 요청이 검증된 시간
   */
  @Prop({ type: Date })
  verifiedAt?: Date;

  /**
   * 검증자 ID
   * 자동 또는 운영자에 의한 검증 수행자 ID
   */
  @Prop({ type: Types.ObjectId })
  verifiedBy?: Types.ObjectId;

  /**
   * 승인/거절 사유
   * 보상 요청 처리에 대한 설명
   */
  @Prop()
  comment?: string;

  /**
   * 생성 시간 (자동 생성됨)
   */
  createdAt!: Date;

  /**
   * 최종 수정 시간 (자동 생성됨)
   */
  updatedAt!: Date;
}

export type RewardClaimDocument = HydratedDocument<RewardClaim>;
export const RewardClaimSchema = SchemaFactory.createForClass(RewardClaim);

// 인덱스 생성
/**
 * 사용자 ID와 이벤트 ID로 복합 검색하기 위한 인덱스
 * 중복 청구 방지에 사용
 */
RewardClaimSchema.index({ userId: 1, eventId: 1 }, { unique: true });

/**
 * 이벤트 ID로 검색하기 위한 인덱스
 */
RewardClaimSchema.index({ eventId: 1 });

/**
 * 사용자 ID로 검색하기 위한 인덱스
 */
RewardClaimSchema.index({ userId: 1 });

/**
 * 상태로 검색하기 위한 인덱스
 */
RewardClaimSchema.index({ status: 1 });
