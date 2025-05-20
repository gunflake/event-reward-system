import { GetUser, Roles, RolesGuard, UserInfo } from '@maplestory/common';
import { Role } from '@maplestory/user';
import { Controller, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { ClaimResponseDto } from './dto/claim-response.dto';

@UseGuards(RolesGuard)
@Controller('events/:eventId/claim')
export class ClaimsController {
  private readonly logger = new Logger(ClaimsController.name);

  constructor(private readonly claimsService: ClaimsService) {}

  /**
   * 이벤트 보상 요청 API
   *
   * 사용자가 이벤트 보상을 요청하는 엔드포인트
   * Auth 서버에서 사용자의 로그인 이력을 확인하여 자동으로 조건 충족 여부를 판단
   *
   * @param eventId 이벤트 ID
   * @param userId 로그인한 사용자 ID
   * @returns 보상 청구 결과
   */
  @Post()
  @Roles(Role.USER, Role.ADMIN)
  async claimEventReward(
    @Param('eventId') eventId: string,
    @GetUser() user: UserInfo
  ): Promise<ClaimResponseDto> {
    return this.claimsService.createClaim(eventId, user);
  }
}
