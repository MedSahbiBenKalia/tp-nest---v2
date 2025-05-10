import { Role } from "src/enums/role.enum";
import { User } from "../user/entities/user.entity"
import { SelectQueryBuilder } from "typeorm"

export function filterByUser(query: SelectQueryBuilder<any>, user: User) {
    if (!user.role.includes(Role.ADMIN)) {
        let alias = query.alias; 
        query.andWhere(`${alias}.user = :userId`, { userId: user.id }); //user -> userId
    }
    
    return query;

}