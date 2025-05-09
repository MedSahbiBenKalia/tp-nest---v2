import { Test, TestingModule } from '@nestjs/testing';
import { CvEventController } from './cv-event.controller';
import { CvEventService } from './cv-event.service';

describe('CvEventController', () => {
  let controller: CvEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvEventController],
      providers: [CvEventService],
    }).compile();

    controller = module.get<CvEventController>(CvEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
