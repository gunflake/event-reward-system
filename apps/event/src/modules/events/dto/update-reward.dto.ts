import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RewardType } from '../../../schemas/reward.schema';

export class UpdateRewardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(RewardType)
  @IsOptional()
  type?: RewardType;

  @IsOptional()
  value?: any;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
