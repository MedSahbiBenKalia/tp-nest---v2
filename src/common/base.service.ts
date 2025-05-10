import { Injectable } from "@nestjs/common";
import { DeepPartial, Repository } from 'typeorm';
import { AppEventService } from '../events/events.service';

@Injectable()
export class BaseService<T extends { id: number }> { // we extends the entity with id property
  constructor(private readonly repository: Repository<T>, private readonly eventservice:AppEventService,private readonly userIdFieldName?:string) {}

  async findAll(relations: string[] = []): Promise<T[]> {
    return this.repository.find({ relations });
  }

async findOne(id: number, relations: string[] = []): Promise<T | null> {
  const entity = await this.repository.findOne({
    where: { id } as any,
    relations,
  });
  return entity;
}

  async create(createDto: any): Promise<(DeepPartial<T> & T)[]> {

    const createdEntity = await this.repository.save(createDto);
    if (createdEntity){
      const eventName = `${this.repository.metadata.name}.modified`;
      const action = 'create';
      let userId = null;
      if(this.userIdFieldName) userId=createDto[this.userIdFieldName];
      const data = { ...createdEntity };
      if (this.userIdFieldName) delete data[this.userIdFieldName];
      this.eventservice.emitEntityModified(eventName, action, data, userId);
    }
    return createdEntity;
  }

  async update(id: number, updateDto: any): Promise<T | null> {
    await this.repository.update(id, updateDto);
    const updatedEntity = this.findOne(id) as Promise<T | null>;
    if (updatedEntity){
      const eventName = `${this.repository.metadata.name}.modified`;
      const action = 'update';
      let userId = null;
      if (this.userIdFieldName) userId=updateDto[this.userIdFieldName]?? null;
      const data = { ...updatedEntity };
      if (this.userIdFieldName) delete data[this.userIdFieldName];
      this.eventservice.emitEntityModified(eventName, action, data, userId);
    }
    return updatedEntity;

  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    if (entity) {
      const eventName = `${this.repository.metadata.name}.modified`;
      const action = 'delete';
      let userId=null;
      if (this.userIdFieldName) userId = entity[this.userIdFieldName];
      const data = { ...entity };
      if (this.userIdFieldName) delete data[this.userIdFieldName];
      this.eventservice.emitEntityModified(eventName, action, data, userId);
    }
    await this.repository.delete(id);
  }

  async findByIds(ids: number[] , relations : string [] = []): Promise<T[]> {
    let entities: T[] = [];
    for (const id of ids) {
      const entity = await this.findOne(id , relations);
      if (entity) {
        entities.push(entity);
      }
    }
    return entities
    ;
  }

}