import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../../schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    userId: string
  ): Promise<Event> {
    try {
      // 시작일과 종료일 검증
      if (
        new Date(createEventDto.startDate) > new Date(createEventDto.endDate)
      ) {
        throw new BadRequestException('종료일은 시작일보다 이후여야 합니다.');
      }

      // 이벤트 생성
      const createdEvent = new this.eventModel({
        ...createEventDto,
        createdBy: new Types.ObjectId(userId),
      });

      return await createdEvent.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `이벤트 생성 중 오류가 발생했습니다: ${error.message}`
      );
    }
  }
}
