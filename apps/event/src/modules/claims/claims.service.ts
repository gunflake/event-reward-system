import { isValidObjectId, UserInfo } from '@maplestory/common';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
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

  async createClaim(
    eventId: string,
    user: UserInfo
  ): Promise<ClaimResponseDto> {
    const userId = user.id;

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

      this.logger.log('중복 요청 확인 결과', existingClaim);

      // 처리가 완료된 claim 객체
      let claimToProcess;

      if (existingClaim) {
        if (existingClaim.status === ClaimStatus.APPROVED) {
          throw new BadRequestException('이미 승인된 보상 요청이 있습니다');
        } else if (existingClaim.status === ClaimStatus.PENDING) {
          throw new BadRequestException('처리 중인 보상 요청이 있습니다');
        } else {
          // 이전에 거절된 요청이 있는 경우 기존 요청을 업데이트
          claimToProcess = existingClaim;
          claimToProcess.status = ClaimStatus.PENDING; // 상태 초기화
          claimToProcess.comment = '';
        }
      } else {
        // 기존 요청이 없는 경우 새로운 claim 생성
        claimToProcess = new this.rewardClaimModel({
          userId: userObjectId,
          eventId: eventObjectId,
          status: ClaimStatus.PENDING,
        });
      }

      // 조건 검증 및 보상 처리
      try {
        const areConditionsMet = await this.verifyEventConditions(event, user);

        this.logger.log('조건 검증 결과', areConditionsMet);

        if (areConditionsMet) {
          // 자동 승인 처리
          claimToProcess.status = ClaimStatus.APPROVED;
          claimToProcess.verifiedAt = new Date();
          claimToProcess.verifiedBy = userObjectId; // 시스템에 의한 자동 검증

          // 보상 정보 추가
          const rewards = await this.rewardModel
            .find({ eventId: eventObjectId })
            .exec();

          // 지급할 보상 정보 설정
          claimToProcess.rewards = rewards.map((reward) => ({
            rewardId: reward._id,
            type: reward.type,
            value: reward.value,
            issuedAt: new Date(),
          }));
        } else {
          // 조건 미충족 처리
          claimToProcess.status = ClaimStatus.REJECTED;
          claimToProcess.verifiedAt = new Date();
          claimToProcess.verifiedBy = userObjectId; // 시스템에 의한 자동 검증
          claimToProcess.comment = '조건 미충족';
        }

        // 검증이 완료된 청구 저장 (새로운 claim이든 기존 claim이든)
        const savedClaim = await claimToProcess.save();
        return this.mapClaimToResponseDto(savedClaim);
      } catch (verificationError) {
        if (verificationError instanceof ServiceUnavailableException) {
          // Auth 서버 장애 등으로 인한 검증 실패는 에러 반환 (저장하지 않음)
          this.logger.warn(
            `외부 서비스 장애로 인한 검증 실패: ${verificationError.message}`
          );
          throw new BadRequestException(
            '서비스 검증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          );
        } else {
          // 그 외 검증 오류도 에러 반환 (저장하지 않음)
          this.logger.error(
            `조건 검증 중 오류 발생: ${verificationError.message}`,
            verificationError.stack
          );
          throw new BadRequestException(
            '보상 조건 검증 중 오류가 발생했습니다.'
          );
        }
      }
    } catch (error) {
      // 중복 키 오류 (이미 청구한 경우)
      if (error.code === 11000) {
        throw new BadRequestException(
          '이미 해당 이벤트에 대한 보상을 요청했습니다'
        );
      }

      // 서비스 장애 오류는 BadRequestException으로 변환
      if (error instanceof ServiceUnavailableException) {
        throw new BadRequestException(
          '서비스 검증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
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

  private async verifyEventConditions(
    event: EventDocument,
    user: UserInfo
  ): Promise<boolean> {
    try {
      // 이벤트 타입에 따른 검증 로직 분기
      switch (event.type) {
        case EventType.LOGIN:
          return await this.verifyLoginCondition(user);

        default:
          this.logger.warn(`지원하지 않는 이벤트 타입: ${event.type}`);
          return false;
      }
    } catch (error) {
      // ServiceUnavailableException은 BadRequestException으로 변환하여 전파
      if (error instanceof ServiceUnavailableException) {
        throw new ServiceUnavailableException(
          '서비스 검증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        );
      }

      this.logger.error(`조건 검증 중 오류: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        '조건 검증 중 오류가 발생했습니다'
      );
    }
  }

  private async verifyLoginCondition(user: UserInfo): Promise<boolean> {
    try {
      // Auth 서버에서 로그인 이력 확인
      const hasLoggedIn = await this.authIntegrationService.hasUserLoggedIn(
        user
      );

      this.logger.log('로그인 이력 확인 결과', hasLoggedIn);
      return hasLoggedIn;
    } catch (serviceError) {
      if (serviceError instanceof ServiceUnavailableException) {
        this.logger.warn(
          `Auth 서비스 일시적 장애로 인한 확인 실패: ${serviceError.message}`
        );
        // 서비스 장애는 BadRequestException으로 변환하여 전파
        throw new ServiceUnavailableException(
          '서비스 검증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        );
      }
      // 그 외 오류는 조건 미충족으로 처리
      return false;
    }
  }

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
