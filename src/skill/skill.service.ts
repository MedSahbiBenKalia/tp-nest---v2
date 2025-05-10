import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { BaseService } from '../common/base.service';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEventService } from '../events/events.service';

@Injectable()
export class SkillService extends BaseService<Skill> {
  constructor(@InjectRepository(Skill)private readonly skillRepository: Repository<Skill>,private readonly eventService: AppEventService) {
    super(skillRepository,eventService);
  }
}
