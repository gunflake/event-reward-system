import { GetUser, Roles, RolesGuard, UserInfo } from '@maplestory/common';
import { Role } from '@maplestory/user';
import {
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { ClaimListQueryDto } from './dto/claim-list-query.dto';
import { ClaimListResponseDto } from './dto/claim-list-response.dto';
import { ClaimResponseDto } from './dto/claim-response.dto';

@UseGuards(RolesGuard)
@Controller('events')
export class ClaimsController {
  private readonly logger = new Logger(ClaimsController.name);

  constructor(private readonly claimsService: ClaimsService) {}

  @Post(':eventId/claim')
  @Roles(Role.USER, Role.ADMIN, Role.OPERATOR, Role.AUDITOR)
  async claimEventReward(
    @Param('eventId') eventId: string,
    @GetUser() user: UserInfo
  ): Promise<ClaimResponseDto> {
    return this.claimsService.createClaim(eventId, user);
  }

  @Get('claims/me')
  @Roles(Role.USER, Role.ADMIN, Role.OPERATOR, Role.AUDITOR)
  async getUserClaims(
    @Query() queryDto: ClaimListQueryDto,
    @GetUser() user: UserInfo
  ): Promise<ClaimListResponseDto> {
    return this.claimsService.getUserClaims(queryDto, user.id);
  }
}
