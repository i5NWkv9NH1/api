## RBAC Core

### Table

### Table List

| Schema   | Name                       | Type    | Owner  |
| -------- | -------------------------- | ------- | ------ |
| `public` | `sys_account`              | `table` | `sora` |
| `public` | `sys_account_organization` | `table` | `sora` |
| `public` | `sys_account_role`         | `table` | `sora` |
| `public` | `sys_action`               | `table` | `sora` |
| `public` | `sys_menu`                 | `table` | `sora` |
| `public` | `sys_organization`         | `table` | `sora` |
| `public` | `sys_role`                 | `table` | `sora` |
| `public` | `sys_role_action`          | `table` | `sora` |

### Table: `public.sys_account`

| Column      | Type                          | Collation | Nullable | Default                              | Storage  | Compression | Stats Target | Description |
| ----------- | ----------------------------- | --------- | -------- | ------------------------------------ | -------- | ----------- | ------------ | ----------- |
| `id`        | `uuid`                        |           | not null | `uuid_generate_v4()`                 | plain    |             |              |             |
| `createdAt` | `timestamp without time zone` |           | not null | `now()`                              | plain    |             |              |             |
| `updatedAt` | `timestamp without time zone` |           | not null | `now()`                              | plain    |             |              |             |
| `name`      | `character varying`           |           |          |                                      | extended |             |              |             |
| `username`  | `character varying`           |           | not null |                                      | extended |             |              |             |
| `avatarUrl` | `character varying`           |           |          |                                      | extended |             |              |             |
| `gender`    | `sys_account_gender_enum`     |           | not null | `'PRIVATE'::sys_account_gender_enum` | plain    |             |              |             |
| `status`    | `sys_account_status_enum`     |           | not null | `'ENABLE'::sys_account_status_enum`  | plain    |             |              |             |
| `phone`     | `character varying`           |           |          |                                      | extended |             |              |             |
| `address`   | `character varying`           |           |          |                                      | extended |             |              |             |
| `password`  | `character varying`           |           | not null |                                      | extended |             |              |             |
| `email`     | `character varying`           |           |          |                                      | extended |             |              |             |

**Indexes:**

| Index Name                       | Type                     | Column(s)  |
| -------------------------------- | ------------------------ | ---------- |
| `PK_842d421e858abcfb1723e6b18b7` | PRIMARY KEY, btree       | `id`       |
| `IDX_056ebf4666d45f1ff052ef3c13` | btree                    | `email`    |
| `IDX_842d421e858abcfb1723e6b18b` | btree                    | `id`       |
| `IDX_da69b984c3b2158d7c9608563d` | btree                    | `username` |
| `UQ_056ebf4666d45f1ff052ef3c137` | UNIQUE CONSTRAINT, btree | `email`    |
| `UQ_da69b984c3b2158d7c9608563db` | UNIQUE CONSTRAINT, btree | `username` |

**Referenced by:**

| Table                      | Constraint Name                  | Column(s)   | Referenced Table | Referenced Column(s) |
| -------------------------- | -------------------------------- | ----------- | ---------------- | -------------------- |
| `sys_account_role`         | `FK_2a0a8eb2d1a03609bd35affc04c` | `accountId` | `sys_account`    | `id`                 |
| `sys_account_organization` | `FK_b57f3a2848041d08b0bdc729e44` | `accountId` | `sys_account`    | `id`                 |

**Access Method:** heap

### Table: `public.sys_role`

| Column      | Type                          | Collation | Nullable | Default                          | Storage  | Compression | Stats Target | Description |
| ----------- | ----------------------------- | --------- | -------- | -------------------------------- | -------- | ----------- | ------------ | ----------- |
| `id`        | `uuid`                        |           | not null | `uuid_generate_v4()`             | plain    |             |              |             |
| `createdAt` | `timestamp without time zone` |           | not null | `now()`                          | plain    |             |              |             |
| `updatedAt` | `timestamp without time zone` |           | not null | `now()`                          | plain    |             |              |             |
| `status`    | `sys_role_status_enum`        |           | not null | `'ENABLE'::sys_role_status_enum` | plain    |             |              |             |
| `sort`      | `integer`                     |           | not null | `0`                              | plain    |             |              |             |
| `label`     | `character varying`           |           | not null |                                  | extended |             |              |             |
| `name`      | `sys_role_name_enum`          |           | not null | `'USER'::sys_role_name_enum`     | plain    |             |              |             |

**Indexes:**

| Index Name                        | Type               | Column(s) |
| --------------------------------- | ------------------ | --------- |
| `PK_12875ba0686cf845f353704dc7b`  | PRIMARY KEY, btree | `id`      |
| `IDX_12875ba0686cf845f353704dc7b` | btree              | `id`      |

**Referenced by:**

| Table              | Constraint Name                  | Column(s) | Referenced Table | Referenced Column(s) |
| ------------------ | -------------------------------- | --------- | ---------------- | -------------------- |
| `sys_role_action`  | `FK_9a4cb65c4d619326d76d23910ee` | `roleId`  | `sys_role`       | `id`                 |
| `sys_account_role` | `FK_b7a1a94176cb8fe2fba361c2033` | `roleId`  | `sys_role`       | `id`                 |

**Access Method:** heap

### Table: `public.sys_account_role`

| Column      | Type   | Collation | Nullable | Default | Storage | Compression | Stats Target | Description |
| ----------- | ------ | --------- | -------- | ------- | ------- | ----------- | ------------ | ----------- |
| `accountId` | `uuid` |           | not null |         | plain   |             |              |             |
| `roleId`    | `uuid` |           | not null |         | plain   |             |              |             |

**Indexes:**

| Index Name                       | Type               | Column(s)             |
| -------------------------------- | ------------------ | --------------------- |
| `PK_ef769ec9ffb54d06360f0141001` | PRIMARY KEY, btree | `accountId`, `roleId` |
| `IDX_2a0a8eb2d1a03609bd35affc04` | btree              | `accountId`           |
| `IDX_b7a1a94176cb8fe2fba361c203` | btree              | `roleId`              |

**Foreign-key Constraints:**

| Constraint Name                  | Column(s)   | Referenced Table | Referenced Column(s) |
| -------------------------------- | ----------- | ---------------- | -------------------- |
| `FK_2a0a8eb2d1a03609bd35affc04c` | `accountId` | `sys_account`    | `id`                 |
| `FK_b7a1a94176cb8fe2fba361c2033` | `roleId`    | `sys_role`       | `id`                 |

**Access Method:** heap

### Table: `public.sys_menu`

| Column      | Type                          | Collation | Nullable | Default                         | Storage  | Compression | Stats Target | Description |
| ----------- | ----------------------------- | --------- | -------- | ------------------------------- | -------- | ----------- | ------------ | ----------- |
| `id`        | `uuid`                        |           | not null | `uuid_generate_v4()`            | plain    |             |              |             |
| `createdAt` | `timestamp without time zone` |           | not null | `now()`                         | plain    |             |              |             |
| `updatedAt` | `timestamp without time zone` |           | not null | `now()`                         | plain    |             |              |             |
| `name`      | `character varying`           |           | not null |                                 | extended |             |              |             |
| `router`    | `character varying`           |           | not null |                                 | extended |             |              |             |
| `icon`      | `character varying`           |           | not null |                                 | extended |             |              |             |
| `path`      | `text`                        |           |          |                                 | extended |             |              |             |
| `parentId`  | `uuid`                        |           |          |                                 | plain    |             |              |             |
| `component` | `character varying`           |           |          |                                 | extended |             |              |             |
| `redirect`  | `character varying`           |           |          |                                 | extended |             |              |             |
| `type`      | `sys_menu_type_enum`          |           | not null | `'CATALOG'::sys_menu_type_enum` | plain    |             |              |             |
| `sort`      | `integer`                     |           | not null | `0`                             | plain    |             |              |             |

**Indexes:**

| Index Name                       | Type                     | Column(s) |
| -------------------------------- | ------------------------ | --------- |
| `PK_8b22e66a03950819c40639e58f8` | PRIMARY KEY, btree       | `id`      |
| `IDX_83b806aa0e6194f063a1c86c6a` | btree                    | `router`  |
| `IDX_8b22e66a03950819c40639e58f` | btree                    | `id`      |
| `UQ_83b806aa0e6194f063a1c86c6a1` | UNIQUE CONSTRAINT, btree | `router`  |

**Foreign-key Constraints:**

| Constraint Name                  | Column(s)  | Referenced Table | Referenced Column(s) |
| -------------------------------- | ---------- | ---------------- | -------------------- |
| `FK_c6b53a3ea622c657100014dfa32` | `parentId` | `sys_menu`       | `id`                 |

**Referenced by:**

| Table        | Constraint Name                  | Column(s)  | Referenced Table | Referenced Column(s) |
| ------------ | -------------------------------- | ---------- | ---------------- | -------------------- |
| `sys_action` | `FK_b385308002a42d03d32ed506dde` | `menuId`   | `sys_menu`       | `id`                 |
| `sys_menu`   | `FK_c6b53a3ea622c657100014dfa32` | `parentId` | `sys_menu`       | `id`                 |

**Access Method:** heap

### Table: `public.sys_action`

| Column      | Type                          | Collation | Nullable | Default              | Storage  | Compression | Stats Target | Description |
| ----------- | ----------------------------- | --------- | -------- | -------------------- | -------- | ----------- | ------------ | ----------- |
| `id`        | `uuid`                        |           | not null | `uuid_generate_v4()` | plain    |             |              |             |
| `createdAt` | `timestamp without time zone` |           | not null | `now()`              | plain    |             |              |             |
| `updatedAt` | `timestamp without time zone` |           | not null | `now()`              | plain    |             |              |             |
| `name`      | `character varying`           |           | not null |                      | extended |             |              |             |
| `code`      | `character varying`           |           | not null |                      | extended |             |              |             |
| `icon`      | `character varying`           |           | not null |                      | extended |             |              |             |
| `menuId`    | `uuid`                        |           | not null |                      | plain    |             |              |             |

**Indexes:**

| Index Name                       | Type               | Column(s) |
| -------------------------------- | ------------------ | --------- |
| `PK_43e1cf65c5bc7aba4950d7d200a` | PRIMARY KEY, btree | `id`      |
| `IDX_43e1cf65c5bc7aba4950d7d200` | btree              | `id`      |

**Foreign-key Constraints:**

| Constraint Name                  | Column(s) | Referenced Table | Referenced Column(s) |
| -------------------------------- | --------- | ---------------- | -------------------- |
| `FK_b385308002a42d03d32ed506dde` | `menuId`  | `sys_menu`       | `id`                 |

**Referenced by:**

| Table             | Constraint Name                  | Column(s)  | Referenced Table | Referenced Column(s) |
| ----------------- | -------------------------------- | ---------- | ---------------- | -------------------- |
| `sys_role_action` | `FK_1665ed5b4e15289d81bfa21b08e` | `actionId` | `sys_action`     | `id`                 |

**Access Method:** heap

### Table: `public.sys_role_action`

| Column     | Type   | Collation | Nullable | Default | Storage | Compression | Stats Target | Description |
| ---------- | ------ | --------- | -------- | ------- | ------- | ----------- | ------------ | ----------- |
| `roleId`   | `uuid` |           | not null |         | plain   |             |              |             |
| `actionId` | `uuid` |           | not null |         | plain   |             |              |             |

**Indexes:**

| Index Name                        | Type               | Column(s)            |
| --------------------------------- | ------------------ | -------------------- |
| `PK_57aed3a1f033a17242f717e6a79`  | PRIMARY KEY, btree | `roleId`, `actionId` |
| `IDX_1665ed5b4e15289d81bfa21b08e` | btree              | `actionId`           |
| `IDX_9a4cb65c4d619326d76d23910e`  | btree              | `roleId`             |

**Foreign-key Constraints:**

| Constraint Name                  | Column(s)  | Referenced Table | Referenced Column(s) |
| -------------------------------- | ---------- | ---------------- | -------------------- |
| `FK_1665ed5b4e15289d81bfa21b08e` | `actionId` | `sys_action`     | `id`                 |
| `FK_9a4cb65c4d619326d76d23910ee` | `roleId`   | `sys_role`       | `id`                 |

**Access Method:** heap

## Extended Table Structures

### Role-Menu Table (`sys_role_menu`)

- **Purpose**: Manages the direct relationship between roles and menus, allowing specific roles to access particular menu items.
- **Fields**:

  - `roleId`: Role ID
  - `menuId`: Menu ID

- **Indexes and Constraints**:
  - **Primary Key**: `("roleId", "menuId")`
  - **Foreign Keys**:
    - `FK_role_menu_role` FOREIGN KEY (`roleId`) REFERENCES `sys_role`(`id`)
    - `FK_role_menu_menu` FOREIGN KEY (`menuId`) REFERENCES `sys_menu`(`id`)

## Pros and Cons Analysis

### Pros

1. **Granular Access Control**:

   - **Role-Menu Table**: Allows system administrators to assign specific menu items to roles, enhancing the granularity of access control.
   - **Role-Permission Table**: Direct relationship between roles and permissions provides flexibility and control in permission assignment.

2. **Modular System Design**:

   - **Separation of Menus and Permissions**: Keeping menu and permission management separate allows for easier maintenance and expansion.

3. **Historical Tracking**:
   - **Permission History Table**: Captures changes in permissions, aiding in auditing and troubleshooting, and improving system security and traceability.

### Cons

1. **Increased Management Complexity**:

   - **Role-Menu Table**: Introducing direct associations between roles and menus can complicate management, especially in larger systems.

2. **Data Redundancy**:

   - **Role-Menu Table**: May lead to data redundancy as changes to menu items require updates across multiple role records.

3. **Performance Considerations**:
   - **Complex Queries**: Performing intricate queries across roles, permissions, and menus may impact performance, particularly with large datasets.

### Conclusion

Adding a Role-Menu Table provides finer control over which menu items are accessible to which roles, making permission management more flexible. However, this also introduces complexities in management and potential data redundancy. Balancing these factors based on specific business needs and system scale is essential for effective implementation.

## Guards

```ts
// JwtStrategy
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected configService: ConfigService,
    private accountService: AccountService,
    private readonly blacklistedTokensService: BlacklistedTokensService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')
    })
  }
  async validate(payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(payload)
    if (await this.blacklistedTokensService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been blacklisted')
    }
    const account = await this.accountService.findOne(payload.sub)
    if (!account) {
      throw new UnauthorizedException('Account not found')
    }
    return account
  }
}
```

```ts
// JwtAuthGuard
export class JwtAuthGuard implements CanActivate {
  private logger = new Logger(JwtAuthGuard.name)
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    )
    if (isPublic) {
      return true
    }
    const request: Request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    if (!authHeader) {
      throw new UnauthorizedException('No token provided')
    }
    try {
      const token = authHeader.split(' ')[1]
      const payload = await this.jwtService.verifyAsync(token)
      request.account = payload.account
      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
```

```ts
// RoleGuard
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accountService: AccountService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    )
    if (isPublic) {
      return true
    }
    const requiredActions = this.reflector.get<string[]>(
      'actions',
      context.getHandler()
    )
    if (!requiredActions) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const accountId = request.account?.id
    if (!accountId) {
      throw new ForbiddenException('No account ID found in request')
    }
    const allowedActions = await this.accountService.getAllowActions(accountId)
    const hasPermission = requiredActions.every((action) =>
      allowedActions.includes(action)
    )
    if (!hasPermission) {
      throw new ForbiddenException('Access denied: insufficient permissions')
    }
    return hasPermission
  }
}
```

## Decorator

```ts
// actions
export type ActionCode = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | [add your actions here and database]
export const Actions = (...actions: ActionCode[]) =>
  SetMetadata('actions', actions)
```

```ts
// public(white list)
export const PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(PUBLIC_KEY, true)
```

```ts
// example
// Work only if the `role` has `UPDATE` `action` for menu'/'
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('/')
class Controller {
  @Put(':id')
  @Actions('UPDATE')
  async updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto
  ) {
    return await this.accountService.updateAccount(id, updateAccountDto)
  }
}
```

## Query

```ts
export abstract class BaseService {
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
}
```
