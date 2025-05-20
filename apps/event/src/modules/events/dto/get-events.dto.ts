import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { EventStatus } from '../enums/event-status.enum';

export class GetEventsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(EventStatus, {
    message: `상태는 ${Object.values(EventStatus).join(
      ', '
    )} 중 하나여야 합니다.`,
  })
  status?: EventStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}
