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
import { PaginationResultDto } from '../common/dtos/pagination-result.dto';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class CvService extends BaseService<Cv> {
  constructor
    (
      private readonly cvRepository: CvRepository,
      private readonly userService: UserService,
      private readonly skillService: SkillService,
      private readonly paginationService: PaginationService,
    ) 
    {
      super(cvRepository);
    }
  
  async create(createCvDto: CreateCvDto) {
    const { userId, skillIds = [], ...cvData } = createCvDto;

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

    
  async search(filter: FilterDto ,user : any ,relations: string[] = []): Promise<Cv[] | null> { 
    if(user.role === Role.ADMIN){
      return (await this.cvRepository.search(filter , relations)).getMany();
    }
      const userdb = await this.userService.findOne(user.id) || undefined;
      return (await this.cvRepository.search(filter , relations , userdb)).getMany();
  }

  async findAllPaginated(
    paginationInputDto : PaginationInputDto,
    user : any,
    relations: string[] = [],
  ): Promise<PaginationResultDto<Cv>> {

    if(user.role === Role.ADMIN){
      return await this.paginationService.paginate<Cv>(
        this.cvRepository,
        paginationInputDto,
        relations,
      );
    }

    const userdb = await this.userService.findOne(user.id) || undefined;

   return await this.paginationService.paginate<Cv>(
    this.cvRepository,
    paginationInputDto,
    relations,
    userdb,
    
   
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
      return this.cvRepository.save({ ...cv, ...cvData, skills });
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
      return this.cvRepository.remove(cv);
    } else {
      throw new HttpException('Unauthorized access to this CV', 403);
    }
  }


  async uploadFile(id: number, file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file provided', 400);
    }
    const cv = await this.findOne(id);
    if (!cv) {
      throw new HttpException('CV not found', 404);
    }
    this.update(id, { filePath: file.path });
    return cv;
  }

}    
  
