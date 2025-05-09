import { Module } from '@nestjs/common';
import { CvEventService } from './cv-event.service';
import { CvEventController } from './cv-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from 'src/cv/entities/cv.entity';
import { CvEvent } from './entities/cv-event.entity';
import { CvEventsListener } from './cv-events.listenner';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CvModule } from 'src/cv/cv.module';
import { User } from 'src/decorators/user.decorator';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CvEvent]),
    EventEmitterModule,
    CvModule,
    UserModule,
  ],
  controllers: [CvEventController],
  providers: [
    CvEventService,
     CvEventsListener
  ],
  exports: [CvEventService],
})
export class CvEventModule {}
