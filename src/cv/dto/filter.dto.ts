import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FilterDto {
    @IsOptional()
    @IsString()
    criteria: string;


    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    age: number;
}