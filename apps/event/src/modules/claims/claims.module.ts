import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from '../../schemas/event.schema';
import {
  RewardClaim,
  RewardClaimSchema,
} from '../../schemas/reward-claim.schema';
import { Reward, RewardSchema } from '../../schemas/reward.schema';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { AuthIntegrationService } from './services/auth-integration.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: RewardClaim.name, schema: RewardClaimSchema },
      { name: Reward.name, schema: RewardSchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService, AuthIntegrationService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
