import { PartialType } from '@nestjs/mapped-types';
import { CvEvent } from '../entities/cv-event.entity';
import { CvEventType } from 'src/enums/cv-event';

export class CreateCvEventDto {
    eventType: CvEventType; 
    userId: number; 
    cvId: number; 
    payload?: any;
} 
