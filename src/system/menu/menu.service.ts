import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { buildTree } from 'src/helpers'
import {
  DataSource,
  FindOptionsWhere,
  In,
  Like,
  Repository,
  SelectQueryBuilder
} from 'typeorm'
import { v4 as uuid } from 'uuid'
import { Action } from '../action/entities/action.entity'
import { Menu } from './entities/menu.entity'

@Injectable()
export class MenuService {
  protected readonly logger = new Logger(MenuService.name)

  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  //#region Hooks
  protected createQueryBuilder(): SelectQueryBuilder<Menu> {
    return this.menuRepo
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.parent', 'parent')
      .leftJoinAndSelect('menu.children', 'children')
      .leftJoinAndSelect('menu.actions', 'actions')
    // .leftJoinAndSelect('actions.menu', 'actionMenu')
  }

  protected applyFilters(
    qb: SelectQueryBuilder<Menu>,
    filters: Record<string, any>
  ): void {
    Object.keys(filters).forEach((key) => {
      if (key) {
        const value = filters[key]
        if (value) {
          qb.andWhere(`menu.${key} LIKE :${key}`, { [key]: `%${value}%` })
        }
      }
    })
  }
  protected applyCustomizations(qb: SelectQueryBuilder<Menu>): void {
    qb.orderBy('menu.sort', 'ASC')
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

    // this.logger.debug(buildTree(items))

    return {
      items: buildTree(items),
      meta: {
        page,
        itemsPerPage,
        itemsLength: totalItems,
        pagesLength: Math.ceil(totalItems / itemsPerPage)
      }
    }
  }

  async findOne(id: string): Promise<Menu> {
    return await this.createQueryBuilder()
      .where('menu.id = :id', { id })
      .getOne()
  }

  async findByIds(ids: string[]) {
    return await this.createQueryBuilder()
      .where('menu.id IN (:...ids)', { ids })
      .getMany()
  }

  async create(entity: Menu): Promise<Menu> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        if (!entity.id) {
          entity.id = uuid()
        }

        const parent = entity.parentId
          ? await transactionalEntityManager.findOne(Menu, {
              where: { id: entity.parentId },
              // ! Should be joinin
              relations: ['children']
            })
          : null

        entity.path = parent ? `${parent.path}.${entity.id}` : `${entity.id}`

        const savedMenu = await transactionalEntityManager.save(Menu, entity)

        if (parent) {
          parent.children = parent.children || []
          parent.children.push(savedMenu)
          // entity.parent = parent

          await transactionalEntityManager.save(Menu, parent)
        }

        return savedMenu
      }
    )
  }

  async update(id: string, entity: Menu): Promise<Menu> {
    const existingMenu = await this.menuRepo.findOne({
      where: { id },
      relations: ['parent', 'children']
    })

    if (existingMenu) {
      return await this.dataSource.transaction(
        async (transactionalEntityManager) => {
          // 处理菜单的父菜单关系更新
          if (entity.parentId !== existingMenu.parentId) {
            // 如果菜单从一个父菜单中移动
            if (existingMenu.parentId) {
              const oldParent = await transactionalEntityManager.findOne(Menu, {
                where: { id: existingMenu.parentId }
              })
              if (oldParent) {
                oldParent.children = oldParent.children.filter(
                  (child) => child.id !== existingMenu.id
                )
                await transactionalEntityManager.save(Menu, oldParent)
              }
            }

            // 如果新的父菜单存在
            if (entity.parentId) {
              const newParent = await transactionalEntityManager.findOne(Menu, {
                where: { id: entity.parentId }
              })
              if (newParent) {
                newParent.children = newParent.children || []
                newParent.children.push(existingMenu)
                await transactionalEntityManager.save(Menu, newParent)
              }
            }
          }

          // 如果 parentId 为 null，确保菜单作为一级菜单
          if (entity.parentId === null) {
            existingMenu.parentId = null
          }

          // 更新菜单信息
          Object.assign(existingMenu, entity)

          // 保存更新后的菜单
          const updatedMenu = await transactionalEntityManager.save(
            Menu,
            existingMenu
          )
          return updatedMenu
        }
      )
    }

    throw new BadRequestException('Menu not found')
  }

  async delete(id: string): Promise<void> {
    // 查找要删除的菜单
    const menuToRemove = await this.menuRepo.findOne({ where: { id } })

    if (menuToRemove) {
      // 查找所有相关菜单（包括子菜单）
      const relatedMenus = await this.menuRepo.find({
        where: { path: Like(`${menuToRemove.path}%`) }
      })

      // 按路径长度降序排序
      relatedMenus.sort((a, b) => b.path.length - a.path.length)

      // 执行事务删除
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // 删除所有相关的 actions
        await Promise.all(
          relatedMenus.map(async (menu) => {
            // 查找相关的 actions
            const actions = await transactionalEntityManager.find(Action, {
              where: {
                menuId: id
              } as FindOptionsWhere<Action>
            })

            await Promise.all(
              actions.map((action) =>
                transactionalEntityManager.remove(Action, action)
              )
            )

            await transactionalEntityManager.remove(Menu, menu)
          })
        )
      })
    }
  }

  async findByIdsSelectPath(ids: string[]) {
    return await this.menuRepo.find({
      where: {
        id: In(ids)
      },
      select: ['path']
    })
  }
}
