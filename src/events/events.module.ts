import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SseGateway } from './sse.gateway';
import { AppEventService } from './events.service';
@Global()
@Module({
  imports: [EventEmitterModule.forRoot({wildcard: true,})],
  providers: [AppEventService],
  controllers: [SseGateway],
  exports: [AppEventService],
})
export class EventsModule {}