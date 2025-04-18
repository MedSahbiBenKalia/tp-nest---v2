import { Brackets, DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { Cv } from "../entities/cv.entity";
import { FilterDto } from "../dto/filter.dto";
import { Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class CvRepository extends Repository<Cv> {
    constructor(private dataSource: DataSource) {
        super(Cv, dataSource.createEntityManager());
      }
    
    async search(filter: FilterDto, relations: string[] = [] , user? : User): Promise<SelectQueryBuilder<Cv>> {
        const query = this.createQueryBuilder('cv');

        if (user && Object.keys(user).length > 0) {
            query.where('cv.user = :user', { user: user.id });
        }
       
        query.andWhere(new Brackets(subquery => {
       
        if (filter.criteria) {
            subquery.andWhere(
                new Brackets(qb => {
                    qb.where('cv.name LIKE :name', { name: `%${filter.criteria}%` })
                        .orWhere('cv.firstname LIKE :firstname', { firstname: `%${filter.criteria}%` })
                        .orWhere('cv.job LIKE :job', { job: `%${filter.criteria}%` });
                })
            );
        }

        if (filter.age) {
            subquery.orWhere('cv.age = :age', { age: filter.age });
        }
       }));
        relations.forEach(relation => {
            query.leftJoinAndSelect(`cv.${relation}`, relation);
        });

        return query;
    }
  
}