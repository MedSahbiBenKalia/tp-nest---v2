import { Test, TestingModule } from '@nestjs/testing';
import { CvEventService } from './cv-event.service';

describe('CvEventService', () => {
  let service: CvEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvEventService],
    }).compile();

    service = module.get<CvEventService>(CvEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
