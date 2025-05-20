import { isValidObjectId } from '@maplestory/common';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../../schemas/event.schema';
import { Reward, RewardDocument } from '../../schemas/reward.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { EventDetailResponseDto } from './dto/get-event-detail.dto';
import {
  EventListItemDto,
  GetEventsResponseDto,
} from './dto/get-events-response.dto';
import { GetEventsDto } from './dto/get-events.dto';
import { RewardResponseDto } from './dto/get-reward-response.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>
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

      this.logger.error(error);
      throw new InternalServerErrorException(
        `이벤트 생성 중 오류가 발생했습니다`
      );
    }
  }

  async getEvents(getEventsDto: GetEventsDto): Promise<GetEventsResponseDto> {
    try {
      const { page = 1, limit = 10, status, startDate, endDate } = getEventsDto;
      const skip = (page - 1) * limit;

      // 필터 조건 구성
      const filter: Record<string, any> = {};

      // 활성 필터 적용 (status가 정의된 경우에만)
      if (status !== undefined && status !== null) {
        this.logger.debug(`이벤트 상태 필터 적용: ${status}`);
        filter.status = status;
      }

      // 날짜 필터 적용
      if (startDate) {
        this.logger.debug(`시작일 필터 적용: ${startDate}`);
        filter.startDate = { $gte: startDate };
      }

      if (endDate) {
        this.logger.debug(`종료일 필터 적용: ${endDate}`);
        filter.endDate = { $lte: endDate };
      }

      this.logger.debug(`적용된 필터: ${JSON.stringify(filter)}`);

      // 이벤트 조회 쿼리 실행
      const [events, total] = await Promise.all([
        this.eventModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.eventModel.countDocuments(filter),
      ]);

      // 응답 데이터 형식 변환
      const formattedEvents: EventListItemDto[] = events.map((event) => ({
        id: event._id.toString(),
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      }));

      return {
        data: formattedEvents,
        total,
        page: Number(page),
        limit: Number(limit),
      };
    } catch (error) {
      this.logger.error(
        `이벤트 목록 조회 중 오류: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        `이벤트 목록 조회 중 오류가 발생했습니다`
      );
    }
  }

  async getEventById(eventId: string): Promise<EventDetailResponseDto> {
    try {
      this.logger.debug(`이벤트 ID로 조회: ${eventId}`);

      // ObjectId 유효성 검사
      if (!isValidObjectId(eventId)) {
        throw new BadRequestException('유효하지 않은 이벤트 ID 형식입니다');
      }

      // 이벤트 조회
      const event = await this.eventModel.findById(eventId).exec();

      if (!event) {
        throw new NotFoundException('해당 ID의 이벤트를 찾을 수 없습니다');
      }

      // 이벤트에 연결된 보상 조회
      const eventObjectId = new Types.ObjectId(eventId);
      const rewards = await this.rewardModel
        .find({ eventId: eventObjectId })
        .exec();

      // 보상 데이터 형식 변환
      const rewardResponses: RewardResponseDto[] = rewards.map((reward) => ({
        id: reward._id.toString(),
        eventId: reward.eventId.toString(),
        name: reward.name,
        type: reward.type,
        value: reward.value,
        quantity: reward.quantity,
        description: reward.description,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt,
      }));

      // 응답 데이터 형식 변환
      const eventDetail: EventDetailResponseDto = {
        id: event._id.toString(),
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        conditions: event.conditions.map((condition) => ({
          type: condition.type,
          value: condition.value,
          description: condition.description,
        })),
        status: event.status,
        createdBy: event.createdBy.toString(),
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        rewards: rewardResponses,
      };

      return eventDetail;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `이벤트 상세 조회 중 오류: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        '이벤트 상세 조회 중 오류가 발생했습니다'
      );
    }
  }
}
