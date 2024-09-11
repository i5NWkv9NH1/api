import { BaseEntity } from 'src/common/entities'
import { Organization } from 'src/system/organization/entities/organization.entity'
import { Role } from 'src/system/role/entities/role.entity'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne
} from 'typeorm'
import { AccountProfile } from './account-profile.entity'

@Entity('sys_account')
export class Account extends BaseEntity {
  @Column({ nullable: true, comment: 'The name of the account holder' })
  name: string

  @Index()
  @Column({
    nullable: false,
    unique: true,
    comment: 'The unique username for login'
  })
  username: string

  @Column({
    nullable: false,
    comment: 'The hashed password for authentication'
  })
  password: string

  @Column({
    select: false,
    nullable: true,
    comment: 'The original password before hashing (optional)'
  })
  originPassword: string | null

  //* The profile associated with the account
  @OneToOne(() => AccountProfile, (profile) => profile.account, {
    cascade: true,
    eager: true,
    nullable: true
  })
  @JoinColumn({ name: 'profileId' })
  profile: AccountProfile

  //* Roles associated with the account
  @ManyToMany(() => Role, (role) => role.accounts, {
    onDelete: 'CASCADE' // 或者在数据库层面设置级联删除
  })
  roles: Role[]

  //* Organizations associated with the account
  @ManyToMany(() => Organization, (organization) => organization.accounts)
  @JoinTable({
    name: 'sys_account_organization',
    joinColumn: { name: 'accountId' },
    inverseJoinColumn: { name: 'organizationId' }
  })
  organizations: Organization[]
}
