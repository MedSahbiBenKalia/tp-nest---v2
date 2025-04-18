import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCvDto {
    @IsString()
    @IsNotEmpty()
    name: string; 

    @IsString()
    @IsNotEmpty()
    firstname: string; 

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    age: number; 

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    Cin: number; 

    @IsString()
    @IsNotEmpty()
    job: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    userId: number; 

    
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    skillIds: number[] = [];
}
