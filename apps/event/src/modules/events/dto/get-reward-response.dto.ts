import { RewardType } from '../../../schemas/reward.schema';

export class RewardResponseDto {
  id: string;
  eventId: string;
  name: string;
  type: RewardType;
  value: any;
  quantity: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetRewardsResponseDto {
  rewards: RewardResponseDto[];
  total: number;
  page: number;
  limit: number;
}
