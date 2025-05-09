import { HttpException, Injectable } from '@nestjs/common';
import { CreateCvEventDto } from './dto/create-cv-event.dto';
import { UpdateCvEventDto } from './dto/update-cv-event.dto';
import e from 'express';
import { BaseService } from 'src/common/base.service';
import { CvEvent } from './entities/cv-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvService } from 'src/cv/cv.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CvEventService extends BaseService<CvEvent> {
  constructor(
    @InjectRepository(CvEvent)
    private readonly cvEventRepository: Repository<CvEvent>,
    private readonly cvService: CvService,
    private readonly userService: UserService,
  ) {
    super(cvEventRepository);
  }

  async create(createCvEventDto: CreateCvEventDto) {
    let cv = await this.cvService.findOne(createCvEventDto.cvId);
    if (!cv) {
      throw new HttpException('cv not found', 400);
    }
    let user = await this.userService.findOne(createCvEventDto.userId);
    if (!user) {
      throw new HttpException('user not found', 400);
    }
    let cvEvent = this.cvEventRepository.create({
      cv: cv,
      user: user,
      ...createCvEventDto
    });
    return this.cvEventRepository.save(cvEvent);

  }


}
