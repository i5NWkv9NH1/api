import { BaseEntity } from 'src/common/entities/base.entity'
import { Status } from 'src/common/enums'
import { Menu } from 'src/system/menu/entities/menu.entity'
import { Role } from 'src/system/role/entities/role.entity'
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm'

@Entity('sys_action')
export class Action extends BaseEntity {
  @Column({ comment: 'The name of the action' })
  name: string

  @Column({ comment: 'A unique code for the action' })
  code: string

  @Column({
    type: 'enum',
    enum: Status,
    nullable: true,
    default: Status.ENABLED,
    comment: 'The status of the action'
  })
  status: Status

  @Column({ comment: 'An icon representing the action' })
  icon: string

  @Column({
    nullable: true,
    default: 1,
    comment: 'The sort order of the action'
  })
  sort: number

  @Column('uuid', {
    name: 'menuId',
    comment: 'The ID of the menu associated with the action'
  })
  menuId: string

  //* The menu associated with this action
  @ManyToOne(() => Menu, (menu) => menu.actions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuId' })
  menu: Menu

  //* Roles associated with this action
  @ManyToMany(() => Role, (role) => role.actions, { onDelete: 'CASCADE' })
  roles: Role[]
}
