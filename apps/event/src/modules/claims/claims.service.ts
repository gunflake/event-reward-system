import { isValidObjectId } from '@maplestory/common';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../../schemas/event.schema';
import {
  ClaimStatus,
  RewardClaim,
  RewardClaimDocument,
} from '../../schemas/reward-claim.schema';
import { Reward, RewardDocument } from '../../schemas/reward.schema';
import { EventStatus } from '../events/enums/event-status.enum';
import { EventType } from '../events/enums/event-type.enum';
import { ClaimResponseDto } from './dto/claim-response.dto';
import { AuthIntegrationService } from './services/auth-integration.service';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(RewardClaim.name)
    private rewardClaimModel: Model<RewardClaimDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    private readonly authIntegrationService: AuthIntegrationService
  ) {}

  /**
   * 보상 청구 요청 생성
   *
   * @param eventId 이벤트 ID
   * @param userId 사용자 ID
   * @returns 생성된 보상 청구 정보
   */
  async createClaim(
    eventId: string,
    userId: string
  ): Promise<ClaimResponseDto> {
    try {
      // ObjectId 유효성 검사
      if (!isValidObjectId(eventId)) {
        throw new BadRequestException('유효하지 않은 이벤트 ID 형식입니다');
      }

      if (!isValidObjectId(userId)) {
        throw new BadRequestException('유효하지 않은 사용자 ID 형식입니다');
      }

      const eventObjectId = new Types.ObjectId(eventId);
      const userObjectId = new Types.ObjectId(userId);

      // 이벤트 존재 여부 확인
      const event = await this.eventModel.findById(eventObjectId).exec();
      if (!event) {
        throw new NotFoundException('해당 ID의 이벤트를 찾을 수 없습니다');
      }

      // 이벤트 활성화 상태 확인
      if (event.status !== EventStatus.ACTIVE) {
        throw new BadRequestException(
          '활성화 상태의 이벤트만 보상 요청이 가능합니다'
        );
      }

      // 이벤트 기간 확인
      const now = new Date();
      if (now < event.startDate || now > event.endDate) {
        throw new BadRequestException('이벤트 진행 기간이 아닙니다');
      }

      // 중복 요청 확인
      const existingClaim = await this.rewardClaimModel
        .findOne({
          userId: userObjectId,
          eventId: eventObjectId,
        })
        .exec();

      if (existingClaim) {
        if (existingClaim.status === ClaimStatus.APPROVED) {
          throw new BadRequestException('이미 승인된 보상 요청이 있습니다');
        } else if (existingClaim.status === ClaimStatus.PENDING) {
          throw new BadRequestException('처리 중인 보상 요청이 있습니다');
        } else {
          // 이전에 거절된 요청이 있는 경우 새로운 요청 허용 (추가 이벤트 조건 달성 등)
        }
      }

      // 보상 청구 생성
      const newClaim = new this.rewardClaimModel({
        userId: userObjectId,
        eventId: eventObjectId,
        status: ClaimStatus.PENDING,
      });

      // 조건 검증 및 보상 처리
      const areConditionsMet = await this.verifyEventConditions(
        event,
        userObjectId
      );

      if (areConditionsMet) {
        // 자동 승인 처리
        newClaim.status = ClaimStatus.APPROVED;
        newClaim.verifiedAt = new Date();
        newClaim.verifiedBy = userObjectId; // 시스템에 의한 자동 검증

        // 보상 정보 추가
        const rewards = await this.rewardModel
          .find({ eventId: eventObjectId })
          .exec();

        // 지급할 보상 정보 설정
        newClaim.rewards = rewards.map((reward) => ({
          rewardId: reward._id,
          type: reward.type,
          value: reward.value,
          issuedAt: new Date(),
        }));
      } else {
        // 조건 미충족 처리
        newClaim.status = ClaimStatus.REJECTED;
        newClaim.verifiedAt = new Date();
        newClaim.verifiedBy = userObjectId; // 시스템에 의한 자동 검증
        newClaim.comment = '조건 미충족';
      }

      // 저장
      const savedClaim = await newClaim.save();

      // 응답 형식 반환
      return this.mapClaimToResponseDto(savedClaim);
    } catch (error) {
      // 중복 키 오류 (이미 청구한 경우)
      if (error.code === 11000) {
        throw new BadRequestException(
          '이미 해당 이벤트에 대한 보상을 요청했습니다'
        );
      }

      // 이미 처리된 예외는 그대로 전달
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(
        `보상 청구 생성 중 오류: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        '보상 청구 생성 중 오류가 발생했습니다'
      );
    }
  }

  /**
   * 이벤트 조건 충족 여부 검증
   *
   * Auth 서버에서 사용자의 로그인 이력을 확인하여 조건 충족 여부 판단
   *
   * @param event 이벤트 정보
   * @param userId 사용자 ID
   * @returns 조건 충족 여부
   */
  private async verifyEventConditions(
    event: EventDocument,
    userId: Types.ObjectId
  ): Promise<boolean> {
    try {
      this.logger.debug(`사용자 ${userId}의 이벤트 조건 충족 여부 검증 시작`);

      // 이벤트 타입에 따른 검증 로직 분기
      switch (event.type) {
        case EventType.LOGIN:
          // Auth 서버에서 로그인 이력 확인
          const hasLoggedIn = await this.authIntegrationService.hasUserLoggedIn(
            userId.toString()
          );
          this.logger.debug(
            `사용자 ${userId}의 로그인 이력 확인 결과: ${hasLoggedIn}`
          );
          return hasLoggedIn;

        default:
          this.logger.warn(`지원하지 않는 이벤트 타입: ${event.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error(`조건 검증 중 오류: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        '조건 검증 중 오류가 발생했습니다'
      );
    }
  }

  /**
   * 보상 청구 정보를 응답 DTO로 변환
   *
   * @param claim 보상 청구 문서
   * @returns 변환된 응답 DTO
   */
  private mapClaimToResponseDto(claim: RewardClaimDocument): ClaimResponseDto {
    return {
      id: claim._id.toString(),
      eventId: claim.eventId.toString(),
      userId: claim.userId.toString(),
      status: claim.status,
      rewards: claim.rewards,
      createdAt: claim.createdAt,
      comment: claim.comment,
    };
  }
}
