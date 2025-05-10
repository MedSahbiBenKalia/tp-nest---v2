import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SseGateway } from './sse.gateway';

@Module({
  imports: [EventEmitterModule.forRoot({wildcard: true,})],
  controllers: [SseGateway],
})
export class EventsModule {}