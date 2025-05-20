import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator';
import { RewardType } from '../../../schemas/reward.schema';

export class GetRewardsDto {
  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string = 'createdAt';

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';
}
