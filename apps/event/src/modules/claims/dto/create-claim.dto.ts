import { IsOptional } from 'class-validator';

/**
 * 보상 청구 생성 DTO
 * 클라이언트에서 보상 청구 요청 시 전달하는 데이터
 */
export class CreateClaimDto {
  /**
   * 조건 충족 증거 (선택적)
   * 사용자가 이벤트 조건을 충족했음을 증명하는 데이터
   *
   * 실제 구현에서는 조건에 따라 다양한 형태가 될 수 있음:
   * - 로그인 일수
   * - 달성한 레벨
   * - 완료한 미션 ID
   * - 구매 금액
   * - 친구 초대 정보 등
   */
  @IsOptional()
  evidence?: any;
}
