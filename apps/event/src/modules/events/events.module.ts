import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from '../../schemas/event.schema';
import { Reward, RewardSchema } from '../../schemas/reward.schema';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
    ]),
  ],
  controllers: [EventsController, RewardsController],
  providers: [EventsService, RewardsService],
  exports: [EventsService, RewardsService],
})
export class EventsModule {}
