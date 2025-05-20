/**
 * 이벤트 타입 enum
 * 이벤트의 종류와 참여 조건을 결정하는 기준
 */
export enum EventType {
  /**
   * 로그인 이벤트: 사용자가 로그인하면 보상을 지급하는 이벤트
   */
  LOGIN = 'LOGIN',

  // 아래 이벤트는 추후 다른 리소스 서버(게임 서버, 아이템 서버 등)와 연동해서 사용할 이벤트
  /**
   * 레벨업 이벤트: 특정 레벨에 도달하면 보상을 지급하는 이벤트
   */
  LEVEL_UP = 'LEVEL_UP',

  /**
   * 미션 완료 이벤트: 특정 미션을 완료하면 보상을 지급하는 이벤트
   */
  MISSION_COMPLETE = 'MISSION_COMPLETE',

  /**
   * 아이템 수집 이벤트: 특정 아이템을 수집하면 보상을 지급하는 이벤트
   */
  ITEM_COLLECT = 'ITEM_COLLECT',

  /**
   * 친구 초대 이벤트: 친구를 초대하면 보상을 지급하는 이벤트
   */
  FRIEND_INVITE = 'FRIEND_INVITE',
}
