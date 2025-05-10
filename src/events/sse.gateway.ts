import {
  Controller,
  Sse,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventEmitter2 } from 'eventemitter2';

// Helper function to support wildcard events
function fromWildcardEvent<T = any>(
  emitter: EventEmitter2,
  pattern: string,
): Observable<{ event: string; payload: T }> {
  return new Observable((subscriber) => {
    const handler = (eventName: string, payload: T) => {
      subscriber.next({ event: eventName, payload });
    };

    emitter.on(pattern, handler);

    return () => {
      emitter.off(pattern, handler);
    };
  });
}

@Controller('sse')
export class SseGateway {
  constructor(private eventEmitter: EventEmitter2) {}

  @Sse()
  @UseGuards(JwtAuthGuard)
  sse(@Req() req: Request): Observable<MessageEvent> {
    const user = req.user as any;

    // Subscribe to all *.modified events
    const modified$ = fromWildcardEvent(this.eventEmitter, '*.modified').pipe(
      filter(({ payload }) =>
        user.role.includes('admin') || user.id === payload.userId,
      ),
      map(({ event, payload }) => ({
        type: event,
        data: payload,
      })),
    );

    return modified$ as any;
  }
}
