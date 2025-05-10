import { HttpException, Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { BaseService } from '../common/base.service';
import { Cv } from './entities/cv.entity';
import { UserService } from '../user/user.service';
import { SkillService } from '../skill/skill.service';
import { CvRepository } from './repositories/cv.repository';
import { FilterDto } from './dto/filter.dto';
import { PaginationInputDto } from '../common/dtos/pagination-input.dto';
import { PaginationService } from '../common/pagination.service';
import { Role } from 'src/enums/role.enum';
import { DeepPartial } from 'typeorm';
import { AppEventService } from '../events/events.service';

@Injectable()
export class CvService extends BaseService<Cv> {
  constructor
    (
      private readonly cvRepository: CvRepository,
      private readonly userService: UserService,
      private readonly skillService: SkillService,
      private readonly paginationService: PaginationService,
      private readonly eventService: AppEventService,
    ) 
    {
      super(cvRepository,eventService, 'userId');
    }
  
  async create(createDto: any): Promise<(DeepPartial<Cv> & Cv)[]> {
    const { userId, skillIds = [], ...cvData } = createDto;

    // Vérifier si l'utilisateur existe
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Vérifier si les compétences existent
    const skills = await this.skillService.findByIds(skillIds);
    if (skills.length !== skillIds.length) {
      throw new Error('Some skills not found');
    }

    return super.create({ ...cvData, user, skills });
    
  }

  async findAllCvs(query : FilterDto & PaginationInputDto, user: any, relations: string[] = []) {   
    let searchquery = await this.cvRepository.search(query ,relations, user);

    return this.paginationService.paginate<Cv>(
      searchquery,
      query as PaginationInputDto,
      relations,
    );
  }
  

  

  async getAll(user: any, relations: string[] = []){

    if(user.role.includes(Role.ADMIN)){
      return this.cvRepository.find({ relations });
    }else{
    const userdb = await this.userService.findOne(user.id);
      if (!userdb) {
        throw new HttpException('User not found', 404);
      } 
      else {
        return this.cvRepository.find({ where: { user: userdb }, relations });
      }
    }
  }

  async getCvById(id: number, user: any, relations: string[] = []) {
    const cv = await this.cvRepository.findOne({ where: { id }, relations });
    if(!cv) {
      throw new HttpException('CV not found', 404);
    }
    if(this.userService.IsOwnerOrAdmin(user , cv)){
      return cv;
    }
    else {
      throw new HttpException('Unauthorized access to this CV', 403);
    }
  }

  async updateCv(id: number, user: any, updateCvDto: UpdateCvDto) {
    const cv = await this.cvRepository.findOne({ where: { id }, relations: ['user'] });
    if (!cv) {
      throw new HttpException('CV not found', 404);
    }
    if (this.userService.IsOwnerOrAdmin(user , cv)) {
      const { skillIds = [], ...cvData } = updateCvDto;
      const skills = await this.skillService.findByIds(skillIds);
      if (skills.length !== skillIds.length) {
        throw new HttpException('Some skills not found', 404);
      }
      return this.update(id, { ...cvData, skills });
    } else {
      throw new HttpException('Unauthorized access to this CV', 403);
    }
  }

  async removeCv(id: number, user: any) {
    const cv = await this.cvRepository.findOne({ where: { id }, relations: ['user'] });
    if (!cv) {
      throw new HttpException('CV not found', 404);
    }
    if (this.userService.IsOwnerOrAdmin(user , cv)) {
      return this.remove(id);
    } else {
      throw new HttpException('Unauthorized access to this CV', 403);
    }
  }


  async uploadFile(id: number, file: Express.Multer.File) {
    const cv = await this.cvRepository.findOne({ where: { id }, relations: ['user'] });
    if (!file) {
      throw new HttpException('No file provided', 400);
    }
    if (!cv) {
      throw new HttpException('CV not found', 404);
    }
    if (!this.userService.IsOwnerOrAdmin(cv.user , cv)) {
      throw new HttpException('Unauthorized access to this CV', 403);
    }
    await this.update(id, { filePath: file.path });
    return cv;
  }
}    
  
