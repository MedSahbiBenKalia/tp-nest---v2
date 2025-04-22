import { ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import { PaginationInputDto } from "./dtos/pagination-input.dto";
import { PaginationResultDto } from "./dtos/pagination-result.dto";
import { Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class PaginationService {
  /**
   * Paginate a repository with optional user filtering.
   * @param repository - The TypeORM repository to paginate.
   * @param paginationInputDto - The pagination input DTO containing page and limit.
   * @param relations - Optional array of relations to include in the query.
   * @param user - Optional user object for filtering results.
   * @returns A promise that resolves to a PaginationResultDto containing paginated data and metadata.
   */
  async paginate<T extends ObjectLiteral>(
    //repository: Repository<T>,
    query : SelectQueryBuilder<T> ,
    paginationInputDto: PaginationInputDto,
    relations: string[] = [],
  ): Promise<PaginationResultDto<T>> {
    const { page = 1, limit = 10 } = paginationInputDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    const [data,total] = await query.skip(skip).take(limit).getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage,
      },
    };
  }
}
