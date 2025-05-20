import { GetUser, Roles, RolesGuard } from '@maplestory/common';
import { Role } from '@maplestory/user';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateRewardDto } from './dto/create-reward.dto';
import { GetRewardsDto } from './dto/get-rewards.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardsService } from './rewards.service';

@UseGuards(RolesGuard)
@Controller('events/:eventId/rewards')
export class RewardsController {
  private readonly logger = new Logger(RewardsController.name);

  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  async createReward(
    @Param('eventId') eventId: string,
    @Body() createRewardDto: CreateRewardDto,
    @GetUser('id') userId: string
  ) {
    return this.rewardsService.createReward(eventId, createRewardDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR)
  async getRewards(
    @Param('eventId') eventId: string,
    @Query() query: GetRewardsDto
  ) {
    return this.rewardsService.getRewardsByEventId(eventId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  async getRewardById(
    @Param('eventId') eventId: string,
    @Param('id') rewardId: string
  ) {
    return this.rewardsService.getRewardById(eventId, rewardId);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  async updateReward(
    @Param('eventId') eventId: string,
    @Param('id') rewardId: string,
    @Body() updateRewardDto: UpdateRewardDto
  ) {
    return this.rewardsService.updateReward(eventId, rewardId, updateRewardDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  async deleteReward(
    @Param('eventId') eventId: string,
    @Param('id') rewardId: string
  ) {
    return this.rewardsService.deleteReward(eventId, rewardId);
  }
}
