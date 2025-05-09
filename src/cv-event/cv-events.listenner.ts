import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CvEventService } from "./cv-event.service";
import { CvEventType } from "src/enums/cv-event";

@Injectable()
export class CvEventsListener {
  constructor(private readonly events: CvEventService) {}

  @OnEvent('cv.*')
  async handleCvEvent(payload: {
    cvId: string;
    userId: string;
    eventType: string;
    metadata?: any;
  }) {
    console.log("cv event", payload);
    await this.events.create({
      cvId: Number(payload.cvId),
      userId:Number(payload.userId),
      eventType: payload.eventType as CvEventType,
      payload: payload.metadata || null,
    });
  }
}


