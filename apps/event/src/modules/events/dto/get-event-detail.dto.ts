import { EventStatus } from '../enums/event-status.enum';

export class EventConditionDetailDto {
  type: string;
  value: any;
  description: string;
}

export class EventDetailResponseDto {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  conditions: EventConditionDetailDto[];
  status: EventStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
