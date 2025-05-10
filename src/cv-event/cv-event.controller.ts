import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Sse, ParseIntPipe } from '@nestjs/common';
import { CvEventService } from './cv-event.service';
import { CreateCvEventDto } from './dto/create-cv-event.dto';
import { UpdateCvEventDto } from './dto/update-cv-event.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { fromEvent, map, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/decorators/user.decorator';
import { from } from 'form-data';
import { Role } from 'src/enums/role.enum';
import { CvEventSeeResponse } from 'src/interfaces/cv-event.see';

@UseGuards(JwtAuthGuard)
@Controller('cv-event')
export class CvEventController {
  constructor(private readonly cvEventService: CvEventService,
    private readonly emitter: EventEmitter2, 
  ) {}

  @Get()
  async findAll() { // find all cv events without filtring
   console.log("find all cv events" , await this.cvEventService.findAll(["cv","user",])); 
    return await this.cvEventService.findAll(["cv","user",]);

  }

  @Sse('events')
  stramEvents(@User() user) : Observable<any> {
    console.log("stream events ****************************");
    console.log("user in sse************************", user);
    const source = fromEvent(this.emitter, 'cv.*');
    return source.pipe(
      filter((event: any) =>user.role.includes(Role.ADMIN) ? true : event.userId === user.id),
      map((event: any) => {
        console.log("event in sse ******************************", event);
        let eventType = {
          userId: event.userId,
          cvId: event.cvId,
          eventType: event.eventType,
        } as CvEventSeeResponse;
        console.log("eventType in sse ******************************", eventType);
        return JSON.stringify(eventType);
        }
      )
    );
  }


  @Get(':id') //// find all cv events without filtring
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return await this.cvEventService.findOne(+id,["cv","user",]);
  }

 
  
    
}
 
