import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationInputDto {

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @Min(1)
  page? = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  limit? = 10;
}