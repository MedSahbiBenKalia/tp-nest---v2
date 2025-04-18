import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CvService } from './cv.service';

import { UserModule } from '../user/user.module';

import { SkillModule } from '../skill/skill.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { CvRepository } from './repositories/cv.repository';
import { DataSource } from 'typeorm';
import { CvControllerV2 } from './cv.controller.v2';
import { AuthMiddleware } from '../common/auth.middleware';
import { PaginationService } from '../common/pagination.service';
import { MulterModule } from '@nestjs/platform-express';



@Module({
  imports: [
    UserModule,
    SkillModule, 
    TypeOrmModule.forFeature([Cv]),
    MulterModule.register()
  ],
  controllers: [ CvControllerV2],
  providers: [
    CvService, 
    CvRepository,
    PaginationService
  ],
  exports: [CvService],
})
export class CvModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(AuthMiddleware)
    .forRoutes(
      { path: 'cv/*path', version: '2', method: RequestMethod.ALL },
      { path: 'cv', version: '2', method: RequestMethod.ALL }
    );

      }    
    }
