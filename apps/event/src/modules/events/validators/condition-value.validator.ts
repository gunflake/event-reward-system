import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { EventConditionType } from '../enums/event-condition-type.enum';

/**
 * 이벤트 조건 타입에 따라 값 검증
 */
export function ValidateConditionValue(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'validateConditionValue',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const conditionType = (args.object as any).type;

          switch (conditionType) {
            case EventConditionType.LOGIN_DAYS:
            case EventConditionType.INVITE_FRIENDS:
            case EventConditionType.REACH_LEVEL:
            case EventConditionType.PURCHASE_AMOUNT:
              return typeof value === 'number' && value > 0;

            case EventConditionType.COMPLETE_MISSION:
              return typeof value === 'string' && value.trim().length > 0;

            default:
              return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const conditionType = (args.object as any).type;

          switch (conditionType) {
            case EventConditionType.LOGIN_DAYS:
            case EventConditionType.INVITE_FRIENDS:
            case EventConditionType.REACH_LEVEL:
            case EventConditionType.PURCHASE_AMOUNT:
              return `${conditionType} 조건의 값은 양수여야 합니다`;

            case EventConditionType.COMPLETE_MISSION:
              return `${conditionType} 조건의 값은 비어있지 않은 문자열이어야 합니다`;

            default:
              return '조건 값이 유효하지 않습니다';
          }
        },
      },
    });
  };
}
