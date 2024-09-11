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
  Query,
  UseGuards
} from '@nestjs/common'
import { Actions, SystemController } from 'src/common/decorators'
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'
// import { RolesGuard } from '../auth/roles.guard'
import { DeleteResult } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { AccountService } from './account.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'
import { Account } from './entities/account.entity'

@SystemController('accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountController {
  protected logger = new Logger(AccountController.name)

  constructor(private readonly accountService: AccountService) {}

  @Get()
  @Actions('view:sys:accounts')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('itemsPerPage', new DefaultValuePipe(-1), ParseIntPipe)
    itemsPerPage: number,
    @Query('filters', new DefaultValuePipe('{}')) filters: string
  ) {
    return await this.accountService.findAll(
      page,
      itemsPerPage,
      JSON.parse(filters)
    )
  }

  @Get(':id')
  @Actions('view:sys:accounts')
  async findOne(@Param('id') id: string): Promise<Account> {
    return await this.accountService.findOne(id)
  }

  @Post()
  @Actions('create:sys:accounts')
  async create(@Body() entity: CreateAccountDto): Promise<Account> {
    return await this.accountService.create(entity)
  }

  @Put(':id')
  @Actions('update:sys:accounts')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto
  ) {
    return await this.accountService.update(id, updateAccountDto)
  }

  @Delete(':id')
  @Actions('delete:sys:accounts')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.accountService.delete(id)
  }
}
