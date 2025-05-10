import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ForbiddenException, UseGuards, ParseIntPipe, BadRequestException, HttpException, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { FilterDto } from './dto/filter.dto';
import { PaginationInputDto } from '../common/dtos/pagination-input.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import * as PATH from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CvEventType } from 'src/enums/cv-event';
import { APP_EVENTS } from '../cv-event/app_events';

@Controller
    (
        {
            path: 'cv',
            version: '2'
        }
    )
export class CvControllerV2 {
    constructor(
      private readonly cvService: CvService,
      private readonly eventEmitter: EventEmitter2,
    ) { }
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@User() user, @Body() createCvDto: CreateCvDto) {
        
        try{
          let cv = await this.cvService.create({ ...createCvDto, userId: user.id }); //mrgl
          if (cv) {
            this.eventEmitter.emit(APP_EVENTS.CV_MODIFIED, {
              cvId: cv.id,
              userId: user.id,
              eventType: CvEventType.CREATE,
              metadata: { ...createCvDto, userId: user.id },
            });
            return cv;
          }
          else {
            throw new HttpException('error in create', 400);
          }

        }catch(e){
          console.log(e);
          throw new HttpException('error in create', 400);
        }
    }

    @Post(':id/upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file',
      {
        storage: diskStorage({
          destination: "./public/uploads",
          filename: (req, file, cb) => {
            if (!file) {
              console.log("No file provided");
              return cb(new HttpException('No file provided', 400),"");
            }
            const id = req.params.id;
            const ext = PATH.extname(file.originalname);
            const filename = `cv-${id}.png`;
            cb(null, filename);
          },
          
        }),
        fileFilter: (req, file, cb) => {
          if (!file) {
            return cb(new BadRequestException('No file provided'), false);
          }
          const allowedExtensions = ['.png', '.jpg', '.jpeg'];
          const ext = PATH.extname(file.originalname).toLowerCase();
          allowedExtensions.includes(ext) ? cb(null, true) : cb(new HttpException('Format de fichier non supporté' ,400), false);
        }
      }))
      async uploadFile(
        @Param('id' , ParseIntPipe) id: number, 
        @UploadedFile(new ParseFilePipe(
          {
            validators: [
              new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
            ]
          }
        )) file: Express.Multer.File) {
          
          
      await this.cvService.uploadFile( id, file);
      return { message: 'File uploaded successfully' , path : file.path };
    }


    
    @UseGuards(JwtAuthGuard)
    @Get() //mrgl
    findAll(@User() user ,@Query() query: FilterDto & PaginationInputDto) {
     
        return this.cvService.findAllCvs(query , user , ['user', 'skills']);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id') //mrgl
    async findOne(@Param('id', ParseIntPipe) id: number , @User() user) {
        let cv = await this.cvService.getCvById(+id , user ,['user', 'skills']);
        if (!cv) {
            throw new ForbiddenException('cv not found or you are not the owner of this cv');
        }
        console.log("emitting event");
        this.eventEmitter.emit(APP_EVENTS.CV_VIEWED, {
              cvId: cv.id,
              userId: user.id,
              eventType: CvEventType.VIEW,
        }
        );
        return cv;
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id') //mrgl
    async update(@User() user, @Param('id' , ParseIntPipe) id: number, @Body() updateCvDto: UpdateCvDto) {
        let oldcv = await this.cvService.getCvById(+id , user , ['user', 'skills']);
        if (!oldcv) {
            throw new ForbiddenException('cv not found or you are not the owner of this cv');
        }
        let newCv = await this.cvService.updateCv(+id, user,updateCvDto);
        if (newCv) {
            this.eventEmitter.emit(APP_EVENTS.CV_MODIFIED, {
              cvId: newCv.id,
              userId: user.id,
              eventType: CvEventType.UPDATE,
              metadata: {
                OldVersion: oldcv, 
                NewVersion: newCv, 
                },
            });
            return newCv;
          }
          else {
            throw new HttpException('error in update', 400);
          }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id') //mrgl
    async remove(@Param('id' , ParseIntPipe) id: number , @User() user) {

     
        try{
          this.cvService.removeCv(+id , user);
          this.eventEmitter.emit(APP_EVENTS.CV_MODIFIED, {
            cvId: id,
            userId: user.id,
            eventType: CvEventType.DELETE,
          });
          return { message: 'cv deleted successfully' };
        }catch(e){
          console.log(e);
          throw new HttpException('error in delete', 400);
        }
    }

}
