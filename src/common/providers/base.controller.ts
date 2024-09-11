import {
  Body,
  DefaultValuePipe,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { DeepPartial } from 'typeorm'
import { BaseEntity } from '../entities/base.entity'
import { BaseService } from './base.service'

export abstract class BaseController<T extends BaseEntity> {
  protected readonly logger = new Logger(BaseController.name)
  constructor(private readonly service: BaseService<T>) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('itemsPerPage', new DefaultValuePipe(-1), ParseIntPipe)
    itemsPerPage: number,
    @Query('filters', new DefaultValuePipe('{}')) filters: string
  ) {
    return await this.service.findAll(page, itemsPerPage, JSON.parse(filters))
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id)
  }

  @Post()
  async create(@Body() entity: T) {
    return await this.service.create(entity)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() entity: DeepPartial<T>) {
    return await this.service.update(id, entity)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id)
  }
}
