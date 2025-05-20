import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { RewardType } from '../../../schemas/reward.schema';

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(RewardType)
  @IsNotEmpty()
  type: RewardType;

  @IsNotEmpty()
  value: any;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
