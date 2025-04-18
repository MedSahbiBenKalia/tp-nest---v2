import { Role } from "src/enums/role.enum";

export interface JwtPayloadInterface {
    id: number;
    username: string;
    email: string;
    role: Role[];
}