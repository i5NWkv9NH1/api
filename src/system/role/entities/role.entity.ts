import { BaseEntity } from 'src/common/entities/base.entity'
import { Status } from 'src/common/enums'
import { Account } from 'src/system/account/entities/account.entity'
import { Action } from 'src/system/action/entities/action.entity'
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'

@Entity('sys_role')
export class Role extends BaseEntity {
  @Column({ comment: 'The label of the role' })
  label: string

  @Column({
    nullable: false,
    type: 'varchar',
    length: 255,
    comment: 'The name of the role'
  })
  name: string

  @Column({
    type: 'enum',
    enum: Status,
    nullable: true,
    default: Status.ENABLED,
    comment: 'The status of the role (DISABLE or ENABLE)'
  })
  status: Status

  @Column({
    type: 'int',
    default: 0,
    comment: 'Sort order of the role'
  })
  sort: number

  // ? Unbind from accounts when the role is deleted
  //* The accounts associated with this role
  @ManyToMany(() => Account, (account) => account.roles, {
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'sys_account_role',
    joinColumn: { name: 'roleId' },
    inverseJoinColumn: { name: 'accountId' }
  })
  accounts: Account[]

  //* The actions associated with this role
  @ManyToMany(() => Action, (action) => action.roles)
  @JoinTable({
    name: 'sys_role_action',
    joinColumn: { name: 'roleId' },
    inverseJoinColumn: { name: 'actionId' }
  })
  actions: Action[]
}
