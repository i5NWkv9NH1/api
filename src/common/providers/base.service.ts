import { Logger } from '@nestjs/common'
import { Account } from 'src/system/account/entities/account.entity'
import {
  DeepPartial,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder
} from 'typeorm'
import { BaseEntity } from '../entities/base.entity'

export abstract class BaseService<T extends BaseEntity> {
  protected readonly logger = new Logger(BaseService.name)
  constructor(private readonly repository: Repository<T>) {}

  /**
   * @description Query hooks
   */
  // alias, and (options: joinin, anything)
  protected abstract createQueryBuilder(): SelectQueryBuilder<T>
  // controller filters
  protected abstract applyFilters(
    qb: SelectQueryBuilder<T>,
    filters: Record<string, any>
  ): void
  // Anything after fitlers, such as orderby
  protected abstract applyCustomizations(qb: SelectQueryBuilder<T>): void

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

  async findOne(id: string): Promise<T> {
    return await this.repository.findOne({
      where: {
        id
      } as FindOptionsWhere<T>
    })
  }

  async create(entity: T): Promise<T> {
    // Create a single entity
    const item = this.repository.create(entity)
    return await this.repository.save(item)
  }

  async update(
    id: string,
    updateData: DeepPartial<Account>
  ): Promise<T | null> {
    try {
      // Fetch the existing entity
      const item = await this.repository.findOne({
        where: { id } as FindOptionsWhere<T>
      })

      if (!item) {
        console.warn(`Entity with ID ${id} not found`)
        return null
      }

      // Apply the updates to the fetched entity
      for (const [key, value] of Object.entries(updateData)) {
        ;(item as any)[key] = value // Explicitly set each field
      }

      // Save the updated entity
      const result = await this.repository.save(item)

      return result
    } catch (error) {
      console.error('Error saving entity:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
