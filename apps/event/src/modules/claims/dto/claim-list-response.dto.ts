import { ClaimStatus } from './claim-list-query.dto';

export class RewardDto {
  id: string;
  name: string;
  type: string;
  value: string;
}

export class ClaimDto {
  id: string;
  userId: string;
  eventId: string;
  eventName: string;
  rewards: RewardDto[];
  status: ClaimStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ClaimListResponseDto {
  data: ClaimDto[];
  total: number;
  page: number;
  limit: number;
}
