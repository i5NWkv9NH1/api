import { BaseEntity } from 'src/common/entities/base.entity'
import { MenuType } from 'src/common/enums'
import { Action } from 'src/system/action/entities/action.entity'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from 'typeorm'

@Entity('sys_menu')
export class Menu extends BaseEntity {
  @Column({ comment: 'The name of the menu item' })
  name: string

  @Index()
  @Column({ unique: true, comment: 'The unique router path for the menu' })
  router: string

  @Column({ nullable: true, comment: 'Icon representing the menu item' })
  icon?: string

  @Index()
  @Column({
    nullable: true,
    type: 'text',
    comment: 'The path of the menu item'
  })
  path: string

  @Column({
    nullable: true,
    name: 'parentId',
    comment: 'The ID of the parent menu item'
  })
  parentId: string | null

  @Column({
    nullable: true,
    comment: 'Component associated with the menu item'
  })
  component: string | null

  @Column({ nullable: true, comment: 'Redirect URL for the menu item' })
  redirect: string

  @Column({
    type: 'boolean',
    nullable: true,
    comment: 'Show in drawer'
  })
  hidden: boolean

  @Column({
    type: 'boolean',
    nullable: true,
    comment: 'Show in tabs'
  })
  affix: boolean

  @Column({
    type: 'boolean',
    nullable: true,
    comment: 'Vue Route keepAlive'
  })
  keepAlive: boolean

  @Column({
    type: 'enum',
    enum: MenuType,
    nullable: true,
    default: MenuType.MENU,
    select: false,
    comment: 'Type of the menu item (e.g., CATALOG, MENU, BUTTON)'
  })
  type: MenuType

  @Column({
    type: 'int',
    default: 0,
    comment: 'Sort order of the menu item'
  })
  sort: number

  //* The parent menu item of this menu item
  @ManyToOne(() => Menu, (menu) => menu.children)
  @JoinColumn({ name: 'parentId' })
  parent: Menu

  //* The child menu items of this menu item
  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[]

  //* The actions associated with this menu item
  @OneToMany(() => Action, (action) => action.menu, { onDelete: 'CASCADE' })
  actions: Action[]
}
