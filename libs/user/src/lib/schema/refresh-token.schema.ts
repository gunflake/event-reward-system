import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * 새로고침 토큰 스키마
 * 사용자의 인증 세션 유지를 위한 토큰 정보를 저장
 */
@Schema({ timestamps: true })
export class RefreshToken {
  /**
   * MongoDB에서 자동 생성되는 문서의 고유 식별자
   */
  _id!: Types.ObjectId;

  /**
   * 토큰 소유자인 사용자 ID
   * users 컬렉션의 문서를 참조함
   */
  @Prop({ required: true })
  userId!: Types.ObjectId;

  /**
   * 새로고침 토큰 문자열
   * JWT 토큰을 재발급 받기 위한 고유한 토큰 값
   */
  @Prop({ required: true, unique: true })
  token!: string;

  /**
   * 토큰 발급 시간
   * 토큰이 생성된 시간
   */
  @Prop({ required: true })
  issuedAt!: Date;

  /**
   * 토큰 만료 시간
   * 이 시간 이후로는 토큰이 유효하지 않음
   */
  @Prop({ required: true })
  expiresAt!: Date;

  /**
   * 토큰 폐기 여부
   * 사용자 로그아웃 등으로 토큰을 의도적으로 무효화했는지 여부
   */
  @Prop({ default: false })
  isRevoked!: boolean;

  /**
   * 토큰 폐기 시간
   * 토큰이 폐기된 시간 (로그아웃 시점)
   */
  @Prop()
  revokedAt?: Date;
}

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

/**
 * 만료 시간 기반 인덱스
 * MongoDB TTL 인덱스: 만료된 토큰을 자동으로 삭제
 */
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * 사용자 ID와 폐기 여부로 검색하기 위한 복합 인덱스
 * 특정 사용자의 유효한 토큰을 빠르게 조회할 때 사용
 */
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
