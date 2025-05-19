/**
 * 이벤트 조건 타입 열거형
 */
export enum EventConditionType {
  LOGIN_DAYS = 'LOGIN_DAYS', // 연속 로그인 일수
  INVITE_FRIENDS = 'INVITE_FRIENDS', // 친구 초대 수
  COMPLETE_MISSION = 'COMPLETE_MISSION', // 특정 미션 완료
  REACH_LEVEL = 'REACH_LEVEL', // 특정 레벨 도달
  PURCHASE_AMOUNT = 'PURCHASE_AMOUNT', // 구매 금액
}
