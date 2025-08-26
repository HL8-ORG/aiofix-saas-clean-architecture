# 领域实体生成提示词

## 🎯 生成目标

生成符合DDD规范的充血模型领域实体，确保业务逻辑完整、架构清晰、代码质量高。

## 📋 生成标准

### 实体设计原则

```typescript
/**
 * ✅ 充血模型实体必备特征：
 * 1. 包含完整的业务行为方法
 * 2. 封装业务规则和验证逻辑
 * 3. 管理内部状态变更
 * 4. 发布相关领域事件
 * 5. 保护业务不变量
 * 6. 提供清晰的业务语义
 */
```

### 实体结构模板

````typescript
/**
 * @description
 * [实体名称] - [业务概念简述]
 *
 * 业务概念：
 * [详细的业务概念解释，说明这个实体在业务中的作用和意义]
 *
 * 业务规则：
 * 1. [重要业务规则1]
 * 2. [重要业务规则2]
 * 3. [重要业务规则3]
 *
 * 业务不变量：
 * 1. [必须始终保持的约束条件1]
 * 2. [必须始终保持的约束条件2]
 *
 * 状态转换：
 * [描述实体的生命周期和状态转换规则]
 *
 * 领域事件：
 * - [事件1]: [触发条件]
 * - [事件2]: [触发条件]
 *
 * @example
 * ```typescript
 * // 创建用户实体
 * const user = UserAggregate.create(
 *   Username.create('john_doe'),
 *   Email.create('john@example.com'),
 *   tenantId
 * );
 *
 * // 分配角色
 * user.assignRole(roleId, organizationId, assignedBy);
 *
 * // 获取未提交的事件
 * const events = user.getUncommittedEvents();
 * ```
 */
export class [EntityName]Aggregate extends AggregateRoot {
  // 私有字段定义
  private constructor(
    id: Uuid,
    // 其他必需的值对象和属性
    tenantId: string,
    version: number = 0
  ) {
    super(id, tenantId, version);
    // 初始化逻辑
  }

  /**
   * @description
   * 静态工厂方法 - 创建新的[实体名称]实体
   *
   * 创建规则：
   * 1. [创建规则1]
   * 2. [创建规则2]
   *
   * 验证逻辑：
   * 1. [验证逻辑1]
   * 2. [验证逻辑2]
   *
   * @param [参数名称] [参数说明]
   * @returns 新创建的[实体名称]聚合根
   * @throws [异常类型] [异常情况说明]
   * @fires [事件名称] [事件触发说明]
   */
  public static create(
    // 创建参数
  ): [EntityName]Aggregate {
    // 1. 参数验证

    // 2. 业务规则验证

    // 3. 创建实体
    const entity = new [EntityName]Aggregate(/*参数*/);

    // 4. 发布创建事件
    entity.addDomainEvent(new [EntityName]CreatedEvent(/*事件参数*/));

    return entity;
  }

  /**
   * @description
   * [业务方法名称] - [业务方法功能描述]
   *
   * 业务逻辑：
   * 1. [业务逻辑步骤1]
   * 2. [业务逻辑步骤2]
   * 3. [业务逻辑步骤3]
   *
   * 前置条件：
   * 1. [前置条件1]
   * 2. [前置条件2]
   *
   * 后置条件：
   * 1. [后置条件1]
   * 2. [后置条件2]
   *
   * 业务规则：
   * 1. [业务规则1]
   * 2. [业务规则2]
   *
   * @param [参数名称] [参数说明]
   * @throws [异常类型] [异常情况说明]
   * @fires [事件名称] [事件触发说明]
   */
  public [businessMethodName](
    // 方法参数
  ): void {
    // 1. 前置条件检查
    this.ensure[Condition]();

    // 2. 业务规则验证
    this.validate[BusinessRule]();

    // 3. 执行业务逻辑
    // [具体的业务逻辑实现]

    // 4. 更新内部状态
    this.[updateInternalState]();

    // 5. 发布领域事件
    this.addDomainEvent(new [BusinessEvent](/*事件参数*/));
  }

  /**
   * @description
   * 查询方法 - [查询功能描述]
   *
   * @returns [返回值说明]
   */
  public [queryMethodName](): [ReturnType] {
    return this.[property];
  }

  /**
   * @description
   * 业务规则验证 - [验证规则说明]
   *
   * 验证规则：
   * 1. [验证规则1]
   * 2. [验证规则2]
   *
   * @throws [异常类型] [异常情况说明]
   */
  private ensure[BusinessRule](): void {
    if (/* 业务规则检查 */) {
      throw new [DomainException]('错误消息');
    }
  }

  /**
   * @description
   * 状态变更 - [状态变更说明]
   *
   * 变更逻辑：
   * 1. [变更逻辑1]
   * 2. [变更逻辑2]
   */
  private [updateInternalState](): void {
    // 状态更新逻辑
  }

  // Getter方法
  public getId(): Uuid {
    return this.id;
  }

  public getTenantId(): string {
    return this.tenantId;
  }

  // 其他必要的getter方法
}
````

## 🛠️ 生成检查清单

### 必备组件检查

```markdown
## 实体生成完整性检查

### 基础结构

- [ ] 继承自AggregateRoot基类
- [ ] 私有构造函数，防止直接实例化
- [ ] 静态create方法作为工厂方法
- [ ] 完整的TSDoc注释

### 业务逻辑

- [ ] 包含核心业务行为方法
- [ ] 封装业务规则验证
- [ ] 实现状态转换逻辑
- [ ] 保护业务不变量

### 事件驱动

- [ ] 在适当时机发布领域事件
- [ ] 事件包含完整的业务上下文
- [ ] 事件命名遵循业务语言

### 异常处理

- [ ] 定义特定的领域异常
- [ ] 在违反业务规则时抛出异常
- [ ] 异常消息清晰易懂

### 封装性

- [ ] 私有字段，公共行为方法
- [ ] 只提供必要的getter方法
- [ ] 防止外部直接修改内部状态
```

## 📚 实体生成示例

### 用户聚合根示例

````typescript
/**
 * @description
 * 用户聚合根 - 身份管理域的核心实体
 *
 * 业务概念：
 * 用户是系统中的身份主体，代表能够登录和执行操作的个人或服务账户。
 * 用户在特定租户下存在，拥有唯一的身份标识和认证凭据。
 * 用户可以属于多个组织，拥有不同的角色和权限。
 *
 * 业务规则：
 * 1. 同一租户内用户名必须唯一
 * 2. 同一租户内邮箱必须唯一
 * 3. 用户必须属于至少一个组织
 * 4. 停用的用户不能执行任何业务操作
 * 5. 用户密码必须符合安全策略
 *
 * 业务不变量：
 * 1. 用户名和邮箱在租户内的唯一性
 * 2. 用户状态的有效性（只能是预定义的状态值）
 * 3. 密码的安全性要求
 *
 * 状态转换：
 * 创建 → 激活 → 使用中 ⇄ 暂停 → 停用 → 删除
 *
 * 领域事件：
 * - UserCreatedEvent: 用户创建
 * - UserActivatedEvent: 用户激活
 * - UserDeactivatedEvent: 用户停用
 * - UserRoleAssignedEvent: 角色分配
 * - UserPasswordChangedEvent: 密码变更
 *
 * @example
 * ```typescript
 * // 创建用户
 * const user = UserAggregate.create(
 *   Username.create('john_doe'),
 *   Email.create('john@example.com'),
 *   Password.create('securePassword123!'),
 *   UserProfile.create('John', 'Doe'),
 *   'tenant-123'
 * );
 *
 * // 分配角色
 * user.assignRole(
 *   new Uuid('role-id'),
 *   new Uuid('org-id'),
 *   new Uuid('admin-id')
 * );
 *
 * // 激活用户
 * user.activate(new Uuid('admin-id'));
 * ```
 */
export class UserAggregate extends AggregateRoot {
  private username: Username;
  private email: Email;
  private password: Password;
  private profile: UserProfile;
  private status: UserStatus;
  private organizations: Set<Uuid>;
  private roleAssignments: Set<UserRoleAssignment>;
  private lastLoginAt: Date | null;
  private passwordChangedAt: Date;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: Uuid,
    username: Username,
    email: Email,
    password: Password,
    profile: UserProfile,
    tenantId: string,
    version: number = 0,
  ) {
    super(id, tenantId, version);
    this.username = username;
    this.email = email;
    this.password = password;
    this.profile = profile;
    this.status = UserStatus.PENDING;
    this.organizations = new Set();
    this.roleAssignments = new Set();
    this.lastLoginAt = null;
    this.passwordChangedAt = new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * @description
   * 创建新用户聚合根
   *
   * 创建规则：
   * 1. 用户名必须在租户内唯一
   * 2. 邮箱必须在租户内唯一
   * 3. 密码必须符合安全策略
   * 4. 用户初始状态为待激活
   *
   * 验证逻辑：
   * 1. 验证用户名格式和唯一性
   * 2. 验证邮箱格式和唯一性
   * 3. 验证密码强度
   * 4. 验证用户资料完整性
   *
   * @param username 用户名值对象
   * @param email 邮箱值对象
   * @param password 密码值对象
   * @param profile 用户资料值对象
   * @param tenantId 租户ID
   * @returns 新创建的用户聚合根
   * @throws InvalidUsernameException 用户名格式错误
   * @throws InvalidEmailException 邮箱格式错误
   * @throws WeakPasswordException 密码强度不足
   * @fires UserCreatedEvent 用户创建事件
   */
  public static create(
    username: Username,
    email: Email,
    password: Password,
    profile: UserProfile,
    tenantId: string,
  ): UserAggregate {
    // 1. 生成用户ID
    const userId = Uuid.generate();

    // 2. 创建用户聚合
    const user = new UserAggregate(
      userId,
      username,
      email,
      password,
      profile,
      tenantId,
    );

    // 3. 发布用户创建事件
    user.addDomainEvent(
      new UserCreatedEvent(
        userId,
        username,
        email,
        profile,
        tenantId,
        new Date(),
      ),
    );

    return user;
  }

  /**
   * @description
   * 为用户分配角色
   *
   * 业务逻辑：
   * 1. 验证用户是否在指定组织中
   * 2. 检查角色是否已经分配
   * 3. 验证角色互斥性规则
   * 4. 创建角色分配记录
   * 5. 发布角色分配事件
   *
   * 前置条件：
   * 1. 用户必须处于激活状态
   * 2. 用户必须是组织成员
   *
   * 后置条件：
   * 1. 用户拥有新的角色权限
   * 2. 角色分配记录已创建
   *
   * 业务规则：
   * 1. 不能重复分配相同角色
   * 2. 检查角色互斥性
   * 3. 验证组织成员资格
   *
   * @param roleId 角色ID
   * @param organizationId 组织ID
   * @param assignedBy 分配者ID
   * @throws UserNotActiveException 用户未激活
   * @throws UserNotInOrganizationException 用户不在组织中
   * @throws RoleAlreadyAssignedException 角色已分配
   * @throws ConflictingRoleException 角色冲突
   * @fires UserRoleAssignedEvent 角色分配事件
   */
  public assignRole(
    roleId: Uuid,
    organizationId: Uuid,
    assignedBy: Uuid,
  ): void {
    // 1. 验证用户状态
    this.ensureUserIsActive();

    // 2. 验证用户是否在组织中
    this.ensureUserInOrganization(organizationId);

    // 3. 检查角色是否已分配
    this.ensureRoleNotAlreadyAssigned(roleId, organizationId);

    // 4. 验证角色互斥性
    this.ensureNoConflictingRoles(roleId);

    // 5. 创建角色分配
    const assignment = UserRoleAssignment.create(
      this.id,
      roleId,
      organizationId,
      assignedBy,
      new Date(),
    );

    this.roleAssignments.add(assignment);
    this.updatedAt = new Date();

    // 6. 发布领域事件
    this.addDomainEvent(
      new UserRoleAssignedEvent(
        this.id,
        roleId,
        organizationId,
        assignedBy,
        this.tenantId,
        new Date(),
      ),
    );
  }

  /**
   * @description
   * 激活用户账户
   *
   * 业务逻辑：
   * 1. 验证用户当前状态
   * 2. 更新用户状态为激活
   * 3. 记录激活时间和操作者
   * 4. 发布用户激活事件
   *
   * @param activatedBy 激活者ID
   * @throws UserAlreadyActivatedException 用户已激活
   * @throws UserCannotBeActivatedException 用户无法激活
   * @fires UserActivatedEvent 用户激活事件
   */
  public activate(activatedBy: Uuid): void {
    // 1. 检查当前状态
    if (this.status === UserStatus.ACTIVE) {
      throw new UserAlreadyActivatedException(this.id);
    }

    if (this.status === UserStatus.DELETED) {
      throw new UserCannotBeActivatedException(this.id, '已删除的用户无法激活');
    }

    // 2. 更新状态
    this.status = UserStatus.ACTIVE;
    this.updatedAt = new Date();

    // 3. 发布事件
    this.addDomainEvent(
      new UserActivatedEvent(this.id, activatedBy, this.tenantId, new Date()),
    );
  }

  /**
   * @description
   * 更改用户密码
   *
   * @param newPassword 新密码
   * @param changedBy 操作者ID
   * @fires UserPasswordChangedEvent 密码变更事件
   */
  public changePassword(newPassword: Password, changedBy: Uuid): void {
    // 1. 验证用户状态
    this.ensureUserIsActive();

    // 2. 验证新密码不同于当前密码
    if (this.password.equals(newPassword)) {
      throw new SamePasswordException('新密码不能与当前密码相同');
    }

    // 3. 更新密码
    this.password = newPassword;
    this.passwordChangedAt = new Date();
    this.updatedAt = new Date();

    // 4. 发布事件
    this.addDomainEvent(
      new UserPasswordChangedEvent(
        this.id,
        changedBy,
        this.tenantId,
        new Date(),
      ),
    );
  }

  /**
   * @description
   * 记录用户登录
   *
   * @param loginTime 登录时间
   * @fires UserLoggedInEvent 用户登录事件
   */
  public recordLogin(loginTime: Date): void {
    this.ensureUserIsActive();

    this.lastLoginAt = loginTime;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new UserLoggedInEvent(this.id, this.tenantId, loginTime),
    );
  }

  // 查询方法
  public getUsername(): Username {
    return this.username;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getProfile(): UserProfile {
    return this.profile;
  }

  public getStatus(): UserStatus {
    return this.status;
  }

  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public getRoleAssignments(): UserRoleAssignment[] {
    return Array.from(this.roleAssignments);
  }

  public hasRole(roleId: Uuid, organizationId?: Uuid): boolean {
    return Array.from(this.roleAssignments).some(
      assignment =>
        assignment.getRoleId().equals(roleId) &&
        assignment.isActive() &&
        (organizationId
          ? assignment.getOrganizationId().equals(organizationId)
          : true),
    );
  }

  // 私有验证方法
  private ensureUserIsActive(): void {
    if (this.status !== UserStatus.ACTIVE) {
      throw new UserNotActiveException(this.id, this.status);
    }
  }

  private ensureUserInOrganization(organizationId: Uuid): void {
    if (!this.organizations.has(organizationId)) {
      throw new UserNotInOrganizationException(this.id, organizationId);
    }
  }

  private ensureRoleNotAlreadyAssigned(
    roleId: Uuid,
    organizationId: Uuid,
  ): void {
    const hasRole = Array.from(this.roleAssignments).some(
      assignment =>
        assignment.getRoleId().equals(roleId) &&
        assignment.getOrganizationId().equals(organizationId) &&
        assignment.isActive(),
    );

    if (hasRole) {
      throw new RoleAlreadyAssignedException(this.id, roleId, organizationId);
    }
  }

  private ensureNoConflictingRoles(roleId: Uuid): void {
    // 实现角色冲突检查逻辑
    // 这里可以根据具体的业务规则来实现
  }
}
````

## 🎯 生成质量标准

生成的实体必须满足：

1. **业务完整性**: 包含所有核心业务行为
2. **架构一致性**: 严格遵循DDD和Clean Architecture
3. **代码质量**: 通过ESLint检查，文档完整
4. **类型安全**: 完整的TypeScript类型定义
5. **可测试性**: 便于单元测试的设计
6. **性能考虑**: 合理的内存使用和计算复杂度

---

**记住**: 充血模型是DDD的核心，实体必须包含丰富的业务行为，而不仅仅是数据容器。
