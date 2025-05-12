import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CvEventService } from "./cv-event.service";
import { CvEventType } from "src/enums/cv-event";
import { MailerService } from "src/mailer/mailer.service";
import { createCVAddedTemplate } from "src/template.provider.ts/cv-added.templare";

@Injectable()
export class CvEventsListener {
  constructor(private readonly events: CvEventService,
    private readonly mailerService: MailerService
  ) {}

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

  @OnEvent('cv.created')
  async handleCvCreatedEvent(payload: {
    cvId: string;
    userId: string;
    eventType: string;
    metadata?: any;
  }) {
    console.log("cv created event", payload);
    await this.mailerService.sendMail({
      to: "CvMangemantAdmin@gmail.com",
      subject: "New CV Created",
      html: createCVAddedTemplate(
        payload.cvId,payload.userId,
        payload.eventType,payload.metadata
      ),
    });
    console.log("Email sent to admin");
  }
}


