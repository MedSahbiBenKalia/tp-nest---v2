import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AppEventService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitEntityModified(entity: string, action: string, data: any, userId: number|null) {
    const eventName = `${entity}.modified`;
    this.eventEmitter.emit(eventName, {
      action,
      data,
      userId,
    });
  }
}