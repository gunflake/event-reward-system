import { EventStatus } from '../enums/event-status.enum';

export class EventListItemDto {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class GetEventsResponseDto {
  data: EventListItemDto[];
  total: number;
  page: number;
  limit: number;
}
