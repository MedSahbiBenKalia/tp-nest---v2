import { CvEventType } from "src/enums/cv-event";

export class CvEventSeeResponse {
    userId: number;
    cvId?: number;
    eventType: CvEventType;
}