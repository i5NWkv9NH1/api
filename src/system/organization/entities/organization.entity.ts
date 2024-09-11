import { BaseEntity } from 'src/common/entities/base.entity'
import { OrganizationType, Status } from 'src/common/enums'
import { Account } from 'src/system/account/entities/account.entity'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany
} from 'typeorm'

@Entity('sys_organization')
export class Organization extends BaseEntity {
  @Column({ comment: 'The label of the organization' })
  label: string

  @Index()
  @Column({ unique: true, comment: 'Unique name of the organization' })
  name: string

  @Column({
    type: 'enum',
    enum: OrganizationType,
    default: OrganizationType.GROUP,
    comment: 'Type of the organization (e.g., GROUP, DEPARTMENT, COMPANY)',
    select: false
  })
  type: OrganizationType

  @Column({
    type: 'enum',
    enum: Status,
    nullable: true,
    default: Status.DISABLED,
    comment: 'Status of the organization (DISABLE or ENABLE)'
  })
  status: Status

  @Column({
    type: 'int',
    default: 0,
    comment: 'Sort order of the organization'
  })
  sort: number

  @Column({ nullable: true, comment: 'Icon representing the organization' })
  icon: string

  @Column({
    nullable: true,
    type: 'text',
    comment: 'Path related to the organization'
  })
  path: string

  @Column({
    nullable: true,
    default: null,
    name: 'parentId',
    comment: 'Parent organization ID'
  })
  parentId: string | null

  //* The parent organization of this organization
  @ManyToOne(() => Organization, (organization) => organization.children)
  @JoinColumn({ name: 'parentId' })
  parent: Organization

  //* The child organizations of this organization
  @OneToMany(() => Organization, (organization) => organization.parent)
  children: Organization[]

  //* The accounts associated with this organization
  @ManyToMany(() => Account, (account) => account.organizations)
  accounts: Account[]
}
