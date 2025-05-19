import { GetUser, Roles, RolesGuard } from '@maplestory/common';
import { Role } from '@maplestory/user';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OPERATOR)
  async createNewEvent(
    @Body() createEventDto: CreateEventDto,
    @GetUser('id') userId: string
  ) {
    return this.eventsService.createEvent(createEventDto, userId);
  }
}
