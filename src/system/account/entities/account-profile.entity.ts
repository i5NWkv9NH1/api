import { BaseEntity } from 'src/common/entities/base.entity'
import { Gender, Status } from 'src/common/enums'
import { Column, Entity, Index, OneToOne } from 'typeorm'
import { Account } from './account.entity'

@Entity('sys_account_profile')
export class AccountProfile extends BaseEntity {
  //* The account associated with this profile
  @OneToOne(() => Account, (account) => account.profile, {
    nullable: false
  })
  account: Account

  @Index()
  @Column({
    nullable: true,
    unique: true,
    comment: 'The email address of the user'
  })
  email?: string

  @Column({ nullable: true, comment: 'The phone number of the user' })
  phone?: string

  @Column({ nullable: true, comment: 'The address of the user' })
  address?: string

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
    default: Gender.PRIVATE,
    comment: 'The gender of the user'
  })
  gender: Gender

  @Column({
    type: 'enum',
    enum: Status,
    nullable: false,
    default: Status.ENABLED,
    comment: 'The status of the user profile'
  })
  status: Status

  @Column({ nullable: true, comment: "The URL of the user's avatar" })
  avatarUrl: string

  @Column({ nullable: true, comment: "The URL of the user's banner" })
  bannerUrl: string

  @Column({
    nullable: true,
    comment: "The user's bio or personal signature",
    default: 'Type something...'
  })
  bio: string

  @Column({ nullable: true, comment: "The URL of the user's personal website" })
  website: string

  @Column({ nullable: true, comment: 'The location of the user' })
  location: string

  @Column('json', { nullable: true, comment: "The user's social media links" })
  socialMediaLinks: Record<string, string>
}
