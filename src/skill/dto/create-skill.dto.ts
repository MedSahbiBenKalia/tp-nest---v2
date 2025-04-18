import { IsNotEmpty, IsString } from "class-validator";

export class CreateSkillDto {
    @IsString()
    @IsNotEmpty()
    designation: string; // Name of the skill
}
