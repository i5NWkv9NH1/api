import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { BaseService } from 'src/common/providers/base.service'
import { buildTree } from 'src/helpers'
import { DataSource, In, Like, Repository, SelectQueryBuilder } from 'typeorm'
import { v4 as uuid } from 'uuid'
import { Organization } from './entities/organization.entity'

@Injectable()
export class OrganizationService extends BaseService<Organization> {
  protected readonly logger = new Logger(OrganizationService.name)

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectDataSource()
    private readonly dataSource: DataSource // 注入 DataSource
  ) {
    super(organizationRepository)
  }
  //#region Hooks
  protected createQueryBuilder(): SelectQueryBuilder<Organization> {
    return this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.parent', 'parent')
      .leftJoinAndSelect('organization.children', 'children')
  }
  protected applyFilters(
    qb: SelectQueryBuilder<Organization>,
    filters: Record<string, any>
  ): void {
    Object.keys(filters).forEach((key) => {
      const value = filters[key]
      qb.andWhere(`organization.${key} LIKE :${key}`, { [key]: `%${value}%` })
    })
  }

  protected applyCustomizations(qb: SelectQueryBuilder<Organization>): void {
    qb.orderBy('organization.sort', 'ASC')
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
      items: buildTree(items),
      meta: {
        page,
        itemsPerPage,
        itemsLength: totalItems,
        pagesLength: Math.ceil(totalItems / itemsPerPage)
      }
    }
  }

  // ? overwrite query builder
  async findOne(id: string): Promise<Organization> {
    return await this.organizationRepository.findOne({
      where: { id },
      relations: ['accounts', 'parent', 'children']
    })
  }

  async create(entity: Organization): Promise<Organization> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // 如果没有 ID，生成 UUID
        if (!entity.id) {
          entity.id = uuid()
        }

        // 查找父级组织
        const parent = entity.parentId
          ? await transactionalEntityManager.findOne(Organization, {
              where: { id: entity.parentId },
              relations: ['children']
            })
          : null

        // 设置组织路径
        entity.path = parent ? `${parent.path}.${entity.id}` : `${entity.id}`

        // 保存组织实体
        const savedOrg = await transactionalEntityManager.save(
          Organization,
          entity
        )

        // 如果有父组织，将新组织添加到父组织的子组织列表中
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(savedOrg)

          // 更新父组织
          await transactionalEntityManager.save(Organization, parent)
        }
        return savedOrg
      }
    )
  }

  async update(id: string, entity: Organization): Promise<Organization> {
    const existingOrganization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent', 'children'] // 处理父组织和子组织
    })

    if (existingOrganization) {
      return await this.dataSource.transaction(
        async (transactionalEntityManager) => {
          // 处理组织的父组织关系更新
          if (entity.parentId !== existingOrganization.parentId) {
            // 如果组织从一个父组织中移动
            if (existingOrganization.parentId) {
              const oldParent = await transactionalEntityManager.findOne(
                Organization,
                {
                  where: { id: existingOrganization.parentId }
                }
              )
              if (oldParent) {
                oldParent.children = oldParent.children.filter(
                  (child) => child.id !== existingOrganization.id
                )
                await transactionalEntityManager.save(Organization, oldParent)
              }
            }

            // 如果新的父组织存在
            if (entity.parentId) {
              const newParent = await transactionalEntityManager.findOne(
                Organization,
                {
                  where: { id: entity.parentId }
                }
              )
              if (newParent) {
                newParent.children = newParent.children || []
                newParent.children.push(existingOrganization)
                await transactionalEntityManager.save(Organization, newParent)
              }
            }
          }

          // 如果 parentId 为 null，确保组织作为一级组织
          if (entity.parentId === null) {
            existingOrganization.parentId = null
          }

          // 更新组织信息
          Object.assign(existingOrganization, entity)

          // 保存更新后的组织
          const updatedOrganization = await transactionalEntityManager.save(
            Organization,
            existingOrganization
          )
          return updatedOrganization
        }
      )
    }

    throw new BadRequestException('Organization not found')
  }

  async remove(id: string): Promise<void> {
    // 查找要删除的组织
    const OrganizationToRemove = await this.organizationRepository.findOne({
      where: { id }
    })

    if (OrganizationToRemove) {
      // 查找所有相关组织（包括子组织）
      const relatedOrganizations = await this.organizationRepository.find({
        where: { path: Like(`${OrganizationToRemove.path}%`) }
      })
      // 按路径长度降序排序
      relatedOrganizations.sort((a, b) => b.path.length - a.path.length)
      // 执行事务删除
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await Promise.all(
          relatedOrganizations.map((organization) =>
            transactionalEntityManager.remove(Organization, organization)
          )
        )
      })
    }
  }

  async delete(id: string): Promise<void> {
    // 查找要删除的组织
    const OrganizationToRemove = await this.organizationRepository.findOne({
      where: { id }
    })

    if (OrganizationToRemove) {
      // 查找所有相关组织（包括子组织）
      const relatedOrganizations = await this.organizationRepository.find({
        where: { path: Like(`${OrganizationToRemove.path}%`) }
      })

      // 按路径长度降序排序
      relatedOrganizations.sort((a, b) => b.path.length - a.path.length)

      // 执行事务删除
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // 删除所有相关的 actions
        await Promise.all(
          relatedOrganizations.map(async (organization) => {
            // 删除 organization
            await transactionalEntityManager.remove(Organization, organization)
          })
        )
      })
    }
  }

  async findByIds(ids: string[]) {
    return await this.organizationRepository.findBy({
      id: In(ids)
    })
  }
}
