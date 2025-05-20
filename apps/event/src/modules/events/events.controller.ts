import { GetUser, Roles, RolesGuard } from '@maplestory/common';
import { Role } from '@maplestory/user';
import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsResponseDto } from './dto/get-events-response.dto';
import { GetEventsDto } from './dto/get-events.dto';
import { EventsService } from './events.service';

@UseGuards(RolesGuard)
@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  async createNewEvent(
    @Body()
    createEventDto: CreateEventDto,
    @GetUser('id') userId: string
  ) {
    return this.eventsService.createEvent(createEventDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR)
  async getEvents(@Query() query: GetEventsDto): Promise<GetEventsResponseDto> {
    return this.eventsService.getEvents(query);
  }
}
