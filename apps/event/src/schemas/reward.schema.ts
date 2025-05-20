import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

/**
 * 보상 유형 enum
 * - POINT: 포인트 형태의 보상 (게임 내 통화, 경험치 등)
 * - ITEM: 게임 내 아이템 형태의 보상
 * - COUPON: 할인권, 이용권 등의 쿠폰 형태 보상
 */
export enum RewardType {
  POINT = 'POINT',
  ITEM = 'ITEM',
  COUPON = 'COUPON',
}

@Schema({ timestamps: true })
export class Reward {
  /**
   * MongoDB에서 자동 생성되는 문서의 고유 식별자
   */
  _id!: Types.ObjectId;

  /**
   * 이 보상이 연결된 이벤트의 ID
   * events 컬렉션의 문서를 참조함
   */
  @Prop({ type: Types.ObjectId, required: true })
  eventId!: Types.ObjectId;

  /**
   * 보상의 이름
   * 예: "골드 코인", "전설 등급 무기" 등
   */
  @Prop({ required: true })
  name!: string;

  /**
   * 보상의 유형 (POINT, ITEM, COUPON 중 하나)
   * RewardType enum을 사용하여 제한됨
   */
  @Prop({ required: true, type: String, enum: Object.values(RewardType) })
  type!: RewardType;

  /**
   * 보상의 실제 값 (유형에 따라 다름)
   * - POINT: { amount: 1000, currency: 'gold' }
   * - ITEM: { itemId: 'weapon_123', rarity: 'legendary' }
   * - COUPON: { code: 'DISCOUNT20', discountRate: 20 }
   */
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: any;

  /**
   * 보상의 수량
   * 해당 보상을 몇 개 지급할지 지정
   */
  @Prop({ required: true })
  quantity!: number;

  /**
   * 보상에 대한 상세 설명
   * 사용자에게 보여지는 텍스트
   */
  @Prop({ required: true })
  description!: string;

  /**
   * 보상을 생성한 관리자 또는 운영자의 ID
   * users 컬렉션의 문서를 참조함
   */
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  /**
   * 보상 생성 시간 (자동 생성됨)
   */
  createdAt!: Date;

  /**
   * 보상 마지막 수정 시간 (자동 생성됨)
   */
  updatedAt!: Date;
}

export type RewardDocument = HydratedDocument<Reward>;
export const RewardSchema = SchemaFactory.createForClass(Reward);

// 인덱스 생성
/**
 * eventId로 빠르게 검색하기 위한 인덱스
 */
RewardSchema.index({ eventId: 1 });

/**
 * 보상 유형으로 필터링하기 위한 인덱스
 */
RewardSchema.index({ type: 1 });

/**
 * 생성자 ID로 검색하기 위한 인덱스
 */
RewardSchema.index({ createdBy: 1 });
