import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseService } from '../common/base.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/enums/role.enum';
@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
    super(userRepository);
  }
  async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    return user;
  }

  IsOwnerOrAdmin(user , object ): boolean {
      return user.id === object.user.id || user.role.includes(Role.ADMIN);
  }
  

}
