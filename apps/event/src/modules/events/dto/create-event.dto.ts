import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EventConditionType } from '../enums/event-condition-type.enum';
import { EventStatus } from '../enums/event-status.enum';
import { EventType } from '../enums/event-type.enum';
import { ValidateConditionValue } from '../validators/condition-value.validator';

export class EventConditionDto {
  @IsEnum(EventConditionType)
  @IsNotEmpty()
  type: EventConditionType;

  @IsNotEmpty()
  @ValidateConditionValue()
  value: any;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => EventConditionDto)
  conditions: EventConditionDto[];

  @IsEnum(EventStatus)
  @IsOptional()
  status: EventStatus;

  @IsEnum(EventType)
  type: EventType;
}
