import {
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common'
import { Actions, SystemController } from 'src/common/decorators'
import { BaseController } from 'src/common/providers/base.controller'
import { DeepPartial } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { ActionService } from './action.service'
import { Action } from './entities/action.entity'

@SystemController('actions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionController extends BaseController<Action> {
  constructor(public readonly actionService: ActionService) {
    super(actionService)
  }

  @Get()
  @Actions('view:sys:actions')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('itemsPerPage', new DefaultValuePipe(-1), ParseIntPipe)
    itemsPerPage: number,
    @Query('filters', new DefaultValuePipe('{}')) filters: string
  ) {
    try {
      return await this.actionService.findAll(
        page,
        itemsPerPage,
        JSON.parse(filters)
      )
    } catch {
      this.logger.debug(filters)
    }
  }

  @Get(':id')
  @Actions('view:sys:actions')
  async findOne(id: string): Promise<Action> {
    return super.findOne(id)
  }

  @Post()
  async create(entity: Action): Promise<Action> {
    return await super.create(entity)
  }

  @Put(':id')
  async update(id: string, entity: DeepPartial<Action>): Promise<Action> {
    return await super.update(id, entity)
  }
}
