import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { hash } from 'bcrypt'
import { chain, uniq } from 'lodash'
import { OrganizationType } from 'src/common/enums'
import { DEFAULT_ROLE_NAME } from 'src/constants'
import { buildTree, buildVueRouter } from 'src/helpers'
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm'
import { ActionService } from '../action/action.service'
import { MenuService } from '../menu/menu.service'
import { Organization } from '../organization/entities/organization.entity'
import { OrganizationService } from '../organization/organization.service'
import { Role } from '../role/entities/role.entity'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'
import { AccountProfile } from './entities/account-profile.entity'
import { Account } from './entities/account.entity'

@Injectable()
export class AccountService {
  protected logger: Logger = new Logger(AccountService.name)

  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    // * Inject Service
    private readonly menuService: MenuService,
    private readonly actionService: ActionService,
    private readonly organizationService: OrganizationService
    // private readonly folderService: FolderService
  ) {}

  //#region Hooks
  // * QueryBuilder
  protected createQueryBuilder(): SelectQueryBuilder<Account> {
    return this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.organizations', 'organization')
      .leftJoinAndSelect('account.roles', 'role')
      .leftJoinAndSelect('account.profile', 'profile') // 确保联接到 profile
  }

  // * Filters
  protected applyFilters(
    qb: SelectQueryBuilder<Account>,
    filters: Record<string, any>
  ): void {
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return

      switch (key) {
        case 'organizationId':
          qb.andWhere('organization.id = :organizationId', {
            organizationId: value
          })
          break

        case 'startDate':
          qb.andWhere('account.createdAt >= :startDate', { startDate: value })
          break

        case 'endDate':
          qb.andWhere('account.createdAt <= :endDate', { endDate: value })
          break

        case 'status':
          if (value !== 'ALL') {
            qb.andWhere('profile.status = :status', { status: value })
          }
          break

        case 'gender':
          qb.andWhere('profile.gender = :gender', { gender: value })
          break

        case 'roleId':
          qb.andWhere('role.id = :roleId', { roleId: value })
          break

        case 'text':
          qb.andWhere(
            new Brackets((qb) => {
              qb.orWhere('account.username LIKE :search', {
                search: `%${value}%`
              })
                .orWhere('profile.address LIKE :search', {
                  search: `%${value}%`
                })
                .orWhere('account.name LIKE :search', { search: `%${value}%` })
            })
          )
          break

        default:
          qb.andWhere(`account.${key} LIKE :${key}`, { [key]: `%${value}%` })
          break
      }
    })
  }

  // * Hooks after filters
  protected applyCustomizations(qb: SelectQueryBuilder<Account>): void {
    qb.orderBy('account.createdAt', 'ASC')
  }

  //#endregion

  async findAll(
    page: number = 1,
    itemsPerPage: number = 10,
    filters: Record<string, any> = {}
  ) {
    const qb = this.createQueryBuilder()
    this.applyFilters(qb, filters)
    this.applyCustomizations(qb)

    const totalItems = await qb.getCount()
    const skip = itemsPerPage > 0 ? (page - 1) * itemsPerPage : 0
    const take = itemsPerPage > 0 ? itemsPerPage : totalItems
    const items = await qb.skip(skip).take(take).getMany()

    return {
      items,
      meta: {
        page,
        itemsPerPage,
        itemsLength: totalItems,
        pagesLength: Math.ceil(totalItems / itemsPerPage)
      }
    }
  }

  async findOne(id: string): Promise<Account> {
    const qb = this.createQueryBuilder()
    const account = await qb.where('account.id = :id', { id }).getOne()
    if (!account) {
      throw new NotFoundException('Account not found')
    }
    return account
  }

  async create(entity: CreateAccountDto): Promise<Account> {
    try {
      return await this.dataSource.transaction(
        async (transactionalEntityManager) => {
          const existingAccount = await transactionalEntityManager.findOne(
            Account,
            { where: { username: entity.username } }
          )
          if (existingAccount) {
            throw new BadRequestException('Account already exists')
          }

          const account = transactionalEntityManager.create(Account, {
            ...entity,
            profile: transactionalEntityManager.create(
              AccountProfile,
              entity.profile
            )
          })
          account.password = await hash(entity.password, 10)
          account.originPassword = entity.password

          const [organization, role] = await Promise.all([
            transactionalEntityManager.findOne(Organization, {
              where: { type: OrganizationType.COMPANY }
            }),
            transactionalEntityManager.findOne(Role, {
              where: { name: DEFAULT_ROLE_NAME }
            })
          ])

          if (!organization || !role) {
            throw new BadRequestException(
              'Default organization or role not found'
            )
          }

          if (!entity.organizations || !!!entity.organizations.length) {
            account.organizations = [organization]
          }

          if (!!!entity.roles.length) {
            account.roles = [role]
          }

          return await transactionalEntityManager.save(Account, account)
        }
      )
    } catch (error) {
      this.logger.error('Error creating account', error.stack)
      throw new BadRequestException(error)
    }
  }

  async update(id: string, entity: UpdateAccountDto) {
    const account = await this.findOne(id)
    const { organizationIds, profile, ...updateFields } = entity

    if (organizationIds) {
      const organizations =
        await this.organizationService.findByIds(organizationIds)
      if (organizations.length !== organizationIds.length) {
        throw new BadRequestException('Some organizations not found')
      }
      account.organizations = organizations
    }

    delete updateFields.organizations

    account.profile = { ...account.profile, ...profile }

    return await this.accountRepository.save({
      ...account,
      ...updateFields
    })
  }

  async getAllowActions({ username }: { username: string }): Promise<string[]> {
    const account = await this.accountRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.actions'] // 一次性加载角色及其关联的动作
    })

    if (!account) {
      throw new NotFoundException('Account not found')
    }

    // 使用 Lodash 来简化和优化动作的提取过程
    const allowedActions = account.roles.reduce((actions, role) => {
      role.actions.forEach((action) => actions.add(action.code))
      return actions
    }, new Set<string>())

    const allowedActionsArray = Array.from(allowedActions)

    return allowedActionsArray
  }

  async findPermissions(account: Account) {
    const roleIds = account.roles.map((role) => role.id)

    const actions = await this.actionService.findActionsByRoleIds(roleIds)
    // ? Menu -> N Actions
    const menuIds = uniq(actions.map((action) => action.menuId))
    const paths = await this.menuService.findByIdsSelectPath(menuIds)
    const allMenuIds = chain(paths)
      .flatMap((path) => path.path.split('.'))
      .uniq()
      .value()
    const menus = await this.menuService.findByIds(allMenuIds)
    const routes = buildVueRouter(buildTree(menus))
    return { actions, menus, routes }
  }

  async findByUsername(username: string) {
    const account = await this.accountRepository.findOne({
      where: { username },
      relations: ['roles', 'organizations', 'profile'] // 确保加载 profile
    })
    if (!account) throw new BadRequestException('Account not found')
    return account
  }

  async delete(id: string) {
    const result = await this.accountRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException('Account not found')
    }
    return result
  }
}
