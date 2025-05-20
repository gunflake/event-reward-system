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
import { CreateRewardDto } from './dto/create-reward.dto';
import {
  GetRewardsResponseDto,
  RewardResponseDto,
} from './dto/get-reward-response.dto';
import { GetRewardsDto } from './dto/get-rewards.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>
  ) {}

  async createReward(
    eventId: string,
    createRewardDto: CreateRewardDto,
    userId: string
  ): Promise<RewardResponseDto> {
    try {
      // ID 유효성 검사
      if (!isValidObjectId(eventId)) {
        throw new BadRequestException('유효하지 않은 이벤트 ID 형식입니다');
      }

      if (!isValidObjectId(userId)) {
        throw new BadRequestException('유효하지 않은 사용자 ID 형식입니다');
      }

      // 이벤트 존재 확인
      const eventObjectId = new Types.ObjectId(eventId);
      const eventExists = await this.eventModel.exists({ _id: eventObjectId });

      if (!eventExists) {
        throw new BadRequestException('해당 ID의 이벤트가 존재하지 않습니다');
      }

      // 보상 생성
      const createdReward = new this.rewardModel({
        ...createRewardDto,
        eventId: eventObjectId,
        createdBy: new Types.ObjectId(userId),
      });

      const savedReward = await createdReward.save();

      // 응답 형식 변환
      return this.mapRewardToResponseDto(savedReward);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`보상 생성 중 오류: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        '보상 생성 중 오류가 발생했습니다'
      );
    }
  }

  async getRewardsByEventId(
    eventId: string,
    getRewardsDto: GetRewardsDto
  ): Promise<GetRewardsResponseDto> {
    try {
      // ID 유효성 검사
      if (!isValidObjectId(eventId)) {
        throw new BadRequestException('유효하지 않은 이벤트 ID 형식입니다');
      }

      const {
        page = 1,
        limit = 10,
        type,
        sort = 'createdAt',
        order = 'desc',
      } = getRewardsDto;
      const skip = (page - 1) * limit;

      // 이벤트 존재 확인
      const eventObjectId = new Types.ObjectId(eventId);
      const eventExists = await this.eventModel.exists({ _id: eventObjectId });

      if (!eventExists) {
        throw new NotFoundException('해당 ID의 이벤트가 존재하지 않습니다');
      }

      // 필터 조건 구성
      const filter: Record<string, any> = { eventId: eventObjectId };

      // 타입 필터 적용
      if (type) {
        filter.type = type;
      }

      // 정렬 조건
      const sortOption: Record<string, 1 | -1> = {};
      sortOption[sort] = order === 'asc' ? 1 : -1;

      // 보상 조회 쿼리 실행
      const [rewards, total] = await Promise.all([
        this.rewardModel
          .find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.rewardModel.countDocuments(filter),
      ]);

      // 응답 데이터 형식 변환
      const formattedRewards = rewards.map((reward) =>
        this.mapRewardToResponseDto(reward)
      );

      return {
        rewards: formattedRewards,
        total,
        page: Number(page),
        limit: Number(limit),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `보상 목록 조회 중 오류: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        '보상 목록 조회 중 오류가 발생했습니다'
      );
    }
  }

  async getRewardById(
    eventId: string,
    rewardId: string
  ): Promise<RewardResponseDto> {
    try {
      // ID 유효성 검사
      if (!isValidObjectId(eventId)) {
        throw new BadRequestException('유효하지 않은 이벤트 ID 형식입니다');
      }

      if (!isValidObjectId(rewardId)) {
        throw new BadRequestException('유효하지 않은 보상 ID 형식입니다');
      }

      // ObjectId 변환
      const eventObjectId = new Types.ObjectId(eventId);
      const rewardObjectId = new Types.ObjectId(rewardId);

      // 보상 조회
      const reward = await this.rewardModel
        .findOne({
          _id: rewardObjectId,
          eventId: eventObjectId,
        })
        .exec();

      if (!reward) {
        throw new NotFoundException('해당 ID의 보상을 찾을 수 없습니다');
      }

      // 응답 데이터 형식 변환
      return this.mapRewardToResponseDto(reward);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `보상 상세 조회 중 오류: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        '보상 상세 조회 중 오류가 발생했습니다'
      );
    }
  }

  async updateReward(
    eventId: string,
    rewardId: string,
    updateRewardDto: UpdateRewardDto
  ): Promise<RewardResponseDto> {
    try {
      // ID 유효성 검사
      if (!isValidObjectId(eventId)) {
        throw new BadRequestException('유효하지 않은 이벤트 ID 형식입니다');
      }

      if (!isValidObjectId(rewardId)) {
        throw new BadRequestException('유효하지 않은 보상 ID 형식입니다');
      }

      // ObjectId 변환
      const eventObjectId = new Types.ObjectId(eventId);
      const rewardObjectId = new Types.ObjectId(rewardId);

      // 보상 업데이트
      const updatedReward = await this.rewardModel
        .findOneAndUpdate(
          { _id: rewardObjectId, eventId: eventObjectId },
          { $set: updateRewardDto },
          { new: true }
        )
        .exec();

      if (!updatedReward) {
        throw new NotFoundException('해당 ID의 보상을 찾을 수 없습니다');
      }

      // 응답 데이터 형식 변환
      return this.mapRewardToResponseDto(updatedReward);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`보상 업데이트 중 오류: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        '보상 업데이트 중 오류가 발생했습니다'
      );
    }
  }

  async deleteReward(eventId: string, rewardId: string): Promise<void> {
    try {
      // ID 유효성 검사
      if (!isValidObjectId(eventId)) {
        throw new BadRequestException('유효하지 않은 이벤트 ID 형식입니다');
      }

      if (!isValidObjectId(rewardId)) {
        throw new BadRequestException('유효하지 않은 보상 ID 형식입니다');
      }

      // ObjectId 변환
      const eventObjectId = new Types.ObjectId(eventId);
      const rewardObjectId = new Types.ObjectId(rewardId);

      // 보상 삭제
      const result = await this.rewardModel
        .deleteOne({
          _id: rewardObjectId,
          eventId: eventObjectId,
        })
        .exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException('해당 ID의 보상을 찾을 수 없습니다');
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`보상 삭제 중 오류: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        '보상 삭제 중 오류가 발생했습니다'
      );
    }
  }

  // 헬퍼 메서드: Reward 모델을 응답 DTO로 변환
  private mapRewardToResponseDto(reward: RewardDocument): RewardResponseDto {
    return {
      id: reward._id.toString(),
      eventId: reward.eventId.toString(),
      name: reward.name,
      type: reward.type,
      value: reward.value,
      quantity: reward.quantity,
      description: reward.description,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    };
  }
}
