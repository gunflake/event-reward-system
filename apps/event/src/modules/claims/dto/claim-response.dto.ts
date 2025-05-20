import {
  ClaimStatus,
  IssuedReward,
} from '../../../schemas/reward-claim.schema';

/**
 * 보상 청구 응답 DTO
 * 보상 청구 요청 결과를 클라이언트에 반환하는 데이터
 */
export class ClaimResponseDto {
  /**
   * 보상 청구 ID
   */
  id: string;

  /**
   * 이벤트 ID
   */
  eventId: string;

  /**
   * 사용자 ID
   */
  userId: string;

  /**
   * 청구 상태 (PENDING, APPROVED, REJECTED)
   */
  status: ClaimStatus;

  /**
   * 지급된 보상 정보 (승인된 경우)
   */
  rewards: IssuedReward[];

  /**
   * 청구 요청 시간
   */
  createdAt: Date;

  /**
   * 승인/거절 사유 (선택적)
   */
  comment?: string;
}
