import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ForbiddenException, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { FilterDto } from './dto/filter.dto';
import { PaginationInputDto } from '../common/dtos/pagination-input.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller
    (
        {
            path: 'cv',
            version: '2'
        }
    )
export class CvControllerV2 {
    constructor(private readonly cvService: CvService) { }
/*
    @Get('paginate')
    async findAllPaginated(@Query() paginationInputDto: PaginationInputDto) {
        return await this.cvService.findAllPaginated(paginationInputDto);
    }  
*/
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@User() user, @Body() createCvDto: CreateCvDto) {
        console.log(createCvDto)
        return this.cvService.create({ ...createCvDto, userId: user.id }); //mrgl
    }


    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@User() user ,@Query() query: FilterDto | PaginationInputDto) {
        if ('page' in query || 'limit' in query) {
            console.log("Query is PaginationInputDto:", query);
            return this.cvService.findAllPaginated(query as PaginationInputDto , user , ['user', 'skills']);
        } else if (query && Object.keys(query).length > 0) {
            console.log("Query is FilterDto:", query);
            return this.cvService.search(query as FilterDto, user , ['user', 'skills']);
        }
        console.log("No query provided");
        return this.cvService.getAll( user ,['user', 'skills']); //mrgl
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id') //mrgl
    findOne(@Param('id', ParseIntPipe) id: number , @User() user) {
        return this.cvService.getCvById(+id , user ,['user', 'skills']);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id') //mrgl
    async update(@User() user, @Param('id' , ParseIntPipe) id: number, @Body() updateCvDto: UpdateCvDto) {
        
        return this.cvService.updateCv(+id, user,updateCvDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id') //mrgl
    async remove(@Param('id' , ParseIntPipe) id: number , @User() user) {
       
        return this.cvService.removeCv(+id , user);
    }

}
