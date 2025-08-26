# 混合架构领域层开发指南

## 事件溯源 + DDD + 聚合根设计

## 📋 文档信息

- **文档类型**: 混合架构领域层开发指南
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 正式版
- **目标读者**: 开发团队
- **架构愿景**: 业务为核心、事件驱动、领域建模

---

## 🎯 领域层核心原则

### 混合架构中的领域层职责

领域层是混合架构的**业务核心**，承载着以下关键职责：

- **业务规则封装**: 所有核心业务逻辑都在领域层
- **聚合根管理**: 聚合根是业务一致性边界
- **领域事件发布**: 记录所有业务状态变更
- **值对象建模**: 通过值对象表达业务概念
- **领域服务**: 处理跨聚合的复杂业务逻辑

### 🚨 领域层纯净性原则

**领域层必须保持绝对的纯净性，不能与任何技术基础设施耦合：**

#### ❌ 禁止的依赖

- **数据库相关**: TypeORM、Prisma、Sequelize等ORM框架
- **HTTP框架**: NestJS装饰器（@Entity、@Column等）
- **第三方库**: axios、moment、lodash等外部工具库
- **基础设施**: Redis、消息队列、文件系统等
- **框架特定**: 任何特定于框架的注解或依赖注入

#### ✅ 允许的依赖

- **纯TypeScript**: 基础类型、接口、枚举
- **领域共享库**: @aiofix/domain-shared中的基础抽象
- **Node.js原生**: 仅限Date、Error等原生对象
- **业务逻辑**: 纯粹的业务计算和验证

#### 🎯 纯净性价值

1. **技术独立**: 领域逻辑不受技术选型影响
2. **易于测试**: 无需Mock复杂的外部依赖
3. **可移植性**: 可以轻松迁移到不同技术栈
4. **业务聚焦**: 强制开发者专注于业务逻辑
5. **长期稳定**: 业务逻辑不会因技术演进而变化

### 🩸 充血模型 vs 贫血模型

领域实体必须采用**充血模型**，而不是贫血模型：

#### ❌ 贫血模型（Anti-Pattern）

```typescript
// 贫血模型：只有数据，没有行为
export class User {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
  // 只有getter/setter，没有业务逻辑
}

// 业务逻辑被放在外部服务中
export class UserService {
  activateUser(user: User): void {
    if (user.status === UserStatus.ACTIVE) {
      throw new Error('用户已经是激活状态');
    }
    user.status = UserStatus.ACTIVE; // 直接修改数据
  }
}
```

#### ✅ 充血模型（正确做法）

```typescript
// 充血模型：封装数据和行为
export class User extends BaseEntity {
  private _username: Username;
  private _email: Email;
  private _status: UserStatus;
  private _domainEvents: UserDomainEvent[] = [];

  // 业务方法封装在实体内部
  activate(): void {
    if (this._status === UserStatus.ACTIVE) {
      throw new Error('用户已经是激活状态');
    }

    if (this._status === UserStatus.DISABLED) {
      throw new Error('已禁用的用户不能激活');
    }

    const previousStatus = this._status;
    this._status = UserStatus.ACTIVE;
    this.updateTimestamp();

    // 发布领域事件
    this.addDomainEvent(
      new UserStatusChangedEvent(
        this.id.value,
        previousStatus,
        UserStatus.ACTIVE,
      ),
    );
  }

  // 更多业务方法...
  suspend(reason?: string): void {
    /* 业务逻辑 */
  }
  assignRole(roleId: Uuid): void {
    /* 业务逻辑 */
  }
  updateProfile(profile: UserProfile): void {
    /* 业务逻辑 */
  }
}
```

#### 🎯 充血模型的优势

1. **封装性**: 数据和操作数据的行为封装在一起
2. **业务表达**: 代码直接表达业务概念和规则
3. **一致性**: 通过实体方法保证数据一致性
4. **复用性**: 业务逻辑可以被不同场景复用
5. **可测试性**: 可以直接测试业务逻辑
6. **可维护性**: 业务变更只需修改实体内部

#### 🚨 避免贫血模型的陷阱

- **不要**只提供getter/setter的数据容器
- **不要**把所有业务逻辑放在Service层
- **不要**让实体变成纯粹的数据传输对象
- **不要**忽视实体的行为设计

### 架构分层中的位置

```
展现层 (Presentation) ← RESTful API
    ↓
应用层 (Application) ← Use-Case 业务编排
    ↓
>>>>>>>>>> 领域层 (Domain) ← 业务核心 <<<<<<<<<<
    ↓
基础设施层 (Infrastructure) ← 技术实现
```

### 领域层组件关系

```
聚合根 (Aggregate Root)
    ↓ 管理
实体 (Entity) + 值对象 (Value Object)
    ↓ 执行业务逻辑
领域事件 (Domain Event)
    ↓ 记录状态变更
事件存储 (Event Store)
    ↓ 通知
应用层事件处理器 (Event Handlers)
```

---

## 📁 领域层目录结构

```
src/{subdomain}/domain/
├── aggregates/            # 聚合根
│   ├── {entity}-aggregate.ts
│   └── index.ts
├── entities/              # 实体
│   ├── {entity}.entity.ts
│   └── index.ts
├── value-objects/         # 值对象
│   ├── {object}.vo.ts
│   └── index.ts
├── events/                # 领域事件
│   ├── {entity}-created.event.ts
│   ├── {entity}-updated.event.ts
│   └── index.ts
├── services/              # 领域服务
│   ├── {domain}.service.ts
│   └── index.ts
├── repositories/          # 仓储接口
│   ├── {entity}.repository.ts
│   └── index.ts
├── exceptions/            # 领域异常
│   ├── {domain}.exception.ts
│   └── index.ts
└── index.ts              # 导出文件
```

---

## 🔧 开发步骤

### 步骤1: 创建值对象

值对象是不可变的，通过值来定义相等性：

```typescript
// domain/value-objects/username.vo.ts
/**
 * @class Username
 * @description 用户名值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：用户名格式验证
 * 4. 类型安全：强类型约束
 *
 * 功能与业务规则：
 * 1. 用户名长度限制（3-50字符）
 * 2. 用户名格式验证（字母、数字、下划线）
 * 3. 用户名大小写不敏感
 */
export class Username {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.toLowerCase();
  }

  get value(): string {
    return this._value;
  }

  equals(other: Username): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('用户名不能为空');
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error('用户名长度必须在3-50字符之间');
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(value)) {
      throw new Error('用户名只能包含字母、数字和下划线');
    }
  }

  static create(value: string): Username {
    return new Username(value);
  }
}

// domain/value-objects/email.vo.ts
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.toLowerCase();
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }

  equals(other: Email): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('邮箱不能为空');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('邮箱格式无效');
    }

    if (value.length > 254) {
      throw new Error('邮箱长度不能超过254字符');
    }
  }

  static create(value: string): Email {
    return new Email(value);
  }
}
```

### 步骤2: 创建领域事件

领域事件记录业务状态变更：

```typescript
// domain/events/user-created.event.ts
import { BaseEvent } from '@aiofix/domain-shared';

/**
 * @class UserCreatedEvent
 * @description 用户创建事件
 *
 * 主要原理与机制：
 * 1. 继承BaseEvent，获得事件基础功能
 * 2. 不可变事件数据，确保历史记录完整性
 * 3. 包含完整的业务上下文信息
 * 4. 支持事件重放和状态重建
 *
 * 功能与业务规则：
 * 1. 记录用户创建的完整信息
 * 2. 支持审计和合规要求
 * 3. 触发后续业务流程
 */
export class UserCreatedEvent extends BaseEvent {
  public readonly userId: string;
  public readonly username: string;
  public readonly email: string;
  public readonly organizationId: string;
  public readonly profile: UserProfile;
  public readonly roleIds?: string[];

  constructor(
    userId: string,
    username: string,
    email: string,
    organizationId: string,
    profile: UserProfile,
    roleIds?: string[],
    tenantId?: string,
    operatorId?: string,
  ) {
    super(
      userId, // aggregateId
      'User', // aggregateType
      'UserCreated', // eventType
      1, // eventVersion
      tenantId,
      operatorId,
    );

    this.userId = userId;
    this.username = username;
    this.email = email;
    this.organizationId = organizationId;
    this.profile = profile;
    this.roleIds = roleIds;
  }

  static create(
    userId: string,
    username: string,
    email: string,
    organizationId: string,
    profile: UserProfile,
    roleIds?: string[],
    tenantId?: string,
    operatorId?: string,
  ): UserCreatedEvent {
    return new UserCreatedEvent(
      userId,
      username,
      email,
      organizationId,
      profile,
      roleIds,
      tenantId,
      operatorId,
    );
  }
}

// domain/events/user-updated.event.ts
export class UserUpdatedEvent extends BaseEvent {
  public readonly userId: string;
  public readonly changes: UserChanges;
  public readonly previousValues: Partial<UserData>;

  constructor(
    userId: string,
    changes: UserChanges,
    previousValues: Partial<UserData>,
    tenantId?: string,
    operatorId?: string,
  ) {
    super(userId, 'User', 'UserUpdated', 1, tenantId, operatorId);

    this.userId = userId;
    this.changes = changes;
    this.previousValues = previousValues;
  }
}
```

### 步骤3: 创建实体

实体具有唯一标识，封装业务逻辑：

```typescript
// domain/entities/user.entity.ts
import { BaseEntity, Uuid } from '@aiofix/domain-shared';
import { Username } from '../value-objects/username.vo';
import { Email } from '../value-objects/email.vo';
import { UserCreatedEvent, UserUpdatedEvent } from '../events';

/**
 * @enum UserStatus
 * @description 用户状态枚举
 */
export enum UserStatus {
  PENDING = 'pending', // 待激活
  ACTIVE = 'active', // 活跃
  SUSPENDED = 'suspended', // 暂停
  LOCKED = 'locked', // 锁定
  DISABLED = 'disabled', // 禁用
}

/**
 * @interface UserProfile
 * @description 用户档案信息
 */
export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  department?: string;
  title?: string;
}

/**
 * @class User
 * @description 用户实体
 *
 * 主要原理与机制：
 * 1. 继承BaseEntity，获得实体基础功能
 * 2. 封装用户相关的所有业务逻辑
 * 3. 维护用户状态的一致性
 * 4. 发布领域事件记录状态变更
 *
 * 功能与业务规则：
 * 1. 用户信息管理和验证
 * 2. 用户状态转换规则
 * 3. 用户组织关系管理
 * 4. 用户角色分配和权限继承
 */
export class User extends BaseEntity {
  private _username: Username;
  private _email: Email;
  private _status: UserStatus;
  private _profile: UserProfile;
  private _organizationId: Uuid;
  private _departmentIds: Set<Uuid> = new Set();
  private _roleIds: Set<Uuid> = new Set();
  private _tenantId: Uuid;
  private _lastLoginAt?: Date;
  private _failedLoginAttempts: number = 0;
  private _settings: Map<string, any> = new Map();
  private _metadata: Map<string, unknown> = new Map();

  // 领域事件列表（用于聚合根）
  private _domainEvents: UserDomainEvent[] = [];

  constructor(
    id: Uuid,
    username: Username,
    email: Email,
    organizationId: Uuid,
    tenantId: Uuid,
    profile: UserProfile,
    status: UserStatus = UserStatus.PENDING,
    createdAt?: Date,
    updatedAt?: Date,
    version?: number,
  ) {
    super(id, createdAt, updatedAt, version);
    this._username = username;
    this._email = email;
    this._organizationId = organizationId;
    this._tenantId = tenantId;
    this._profile = profile;
    this._status = status;
  }

  // Getters
  get username(): Username {
    return this._username;
  }

  get email(): Email {
    return this._email;
  }

  get status(): UserStatus {
    return this._status;
  }

  get profile(): UserProfile {
    return { ...this._profile };
  }

  get organizationId(): Uuid {
    return this._organizationId;
  }

  get tenantId(): Uuid {
    return this._tenantId;
  }

  get departmentIds(): Set<Uuid> {
    return new Set(this._departmentIds);
  }

  get roleIds(): Set<Uuid> {
    return new Set(this._roleIds);
  }

  get domainEvents(): UserDomainEvent[] {
    return [...this._domainEvents];
  }

  // 业务方法

  /**
   * @method activate
   * @description 激活用户
   */
  activate(): void {
    if (this._status === UserStatus.ACTIVE) {
      throw new Error('用户已经是激活状态');
    }

    if (this._status === UserStatus.DISABLED) {
      throw new Error('已禁用的用户不能激活');
    }

    const previousStatus = this._status;
    this._status = UserStatus.ACTIVE;
    this.updateTimestamp();

    this.addDomainEvent(
      new UserStatusChangedEvent(
        this.id.value,
        previousStatus,
        UserStatus.ACTIVE,
        this._tenantId.value,
      ),
    );
  }

  /**
   * @method suspend
   * @description 暂停用户
   */
  suspend(reason?: string): void {
    if (this._status === UserStatus.SUSPENDED) {
      throw new Error('用户已经是暂停状态');
    }

    if (this._status === UserStatus.DISABLED) {
      throw new Error('已禁用的用户不能暂停');
    }

    const previousStatus = this._status;
    this._status = UserStatus.SUSPENDED;
    this.updateTimestamp();

    this.addDomainEvent(
      new UserSuspendedEvent(
        this.id.value,
        reason || '管理员暂停',
        this._tenantId.value,
      ),
    );
  }

  /**
   * @method assignToOrganization
   * @description 分配用户到组织
   */
  assignToOrganization(organizationId: Uuid): void {
    if (this._organizationId.equals(organizationId)) {
      return; // 已经在该组织中
    }

    const previousOrganizationId = this._organizationId;
    this._organizationId = organizationId;
    this.updateTimestamp();

    this.addDomainEvent(
      new UserOrganizationChangedEvent(
        this.id.value,
        previousOrganizationId.value,
        organizationId.value,
        this._tenantId.value,
      ),
    );
  }

  /**
   * @method addToDepartment
   * @description 添加用户到部门
   */
  addToDepartment(departmentId: Uuid): void {
    if (this._departmentIds.has(departmentId)) {
      return; // 已经在该部门中
    }

    this._departmentIds.add(departmentId);
    this.updateTimestamp();

    this.addDomainEvent(
      new UserDepartmentAssignedEvent(
        this.id.value,
        departmentId.value,
        this._tenantId.value,
      ),
    );
  }

  /**
   * @method assignRole
   * @description 分配角色给用户
   */
  assignRole(roleId: Uuid): void {
    if (this._roleIds.has(roleId)) {
      return; // 已经有该角色
    }

    this._roleIds.add(roleId);
    this.updateTimestamp();

    this.addDomainEvent(
      new UserRoleAssignedEvent(
        this.id.value,
        roleId.value,
        this._tenantId.value,
      ),
    );
  }

  /**
   * @method updateProfile
   * @description 更新用户档案
   */
  updateProfile(profile: Partial<UserProfile>): void {
    const previousProfile = { ...this._profile };
    this._profile = { ...this._profile, ...profile };
    this.updateTimestamp();

    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this.id.value,
        previousProfile,
        this._profile,
        this._tenantId.value,
      ),
    );
  }

  /**
   * @method recordLogin
   * @description 记录用户登录
   */
  recordLogin(): void {
    this._lastLoginAt = new Date();
    this._failedLoginAttempts = 0; // 重置失败次数
    this.updateTimestamp();

    this.addDomainEvent(
      new UserLoginRecordedEvent(
        this.id.value,
        this._lastLoginAt,
        this._tenantId.value,
      ),
    );
  }

  /**
   * @method recordFailedLogin
   * @description 记录失败登录
   */
  recordFailedLogin(): void {
    this._failedLoginAttempts++;
    this.updateTimestamp();

    // 如果失败次数过多，锁定用户
    if (this._failedLoginAttempts >= 5) {
      this.lock('连续登录失败过多');
    }

    this.addDomainEvent(
      new UserLoginFailedEvent(
        this.id.value,
        this._failedLoginAttempts,
        this._tenantId.value,
      ),
    );
  }

  /**
   * @method lock
   * @description 锁定用户
   */
  private lock(reason: string): void {
    const previousStatus = this._status;
    this._status = UserStatus.LOCKED;

    this.addDomainEvent(
      new UserLockedEvent(this.id.value, reason, this._tenantId.value),
    );
  }

  /**
   * @method isActive
   * @description 判断用户是否活跃
   */
  isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * @method canLogin
   * @description 判断用户是否可以登录
   */
  canLogin(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  // 领域事件管理

  /**
   * @private
   * @method addDomainEvent
   * @description 添加领域事件
   */
  private addDomainEvent(event: UserDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @method clearDomainEvents
   * @description 清除领域事件
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // 静态工厂方法

  /**
   * @static
   * @method create
   * @description 创建新用户
   */
  static create(
    username: string,
    email: string,
    organizationId: string,
    tenantId: string,
    profile: UserProfile,
    roleIds?: string[],
  ): User {
    const userId = Uuid.generate();
    const usernameVo = Username.create(username);
    const emailVo = Email.create(email);
    const organizationIdVo = Uuid.fromString(organizationId);
    const tenantIdVo = Uuid.fromString(tenantId);

    const user = new User(
      userId,
      usernameVo,
      emailVo,
      organizationIdVo,
      tenantIdVo,
      profile,
      UserStatus.PENDING,
    );

    // 分配角色
    if (roleIds) {
      roleIds.forEach(roleId => {
        user.assignRole(Uuid.fromString(roleId));
      });
    }

    // 发布用户创建事件
    user.addDomainEvent(
      UserCreatedEvent.create(
        userId.value,
        username,
        email,
        organizationId,
        profile,
        roleIds,
        tenantId,
      ),
    );

    return user;
  }
}
```

### 步骤4: 创建聚合根

聚合根管理聚合边界和一致性：

```typescript
// domain/aggregates/user-aggregate.ts
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

/**
 * @class UserAggregate
 * @description 用户聚合根
 *
 * 主要原理与机制：
 * 1. 管理用户聚合的边界和一致性
 * 2. 协调聚合内的实体和值对象
 * 3. 确保业务规则的完整性
 * 4. 管理领域事件的发布
 *
 * 功能与业务规则：
 * 1. 用户聚合的生命周期管理
 * 2. 跨实体的业务规则验证
 * 3. 聚合内数据一致性保证
 */
export class UserAggregate {
  private readonly user: User;

  constructor(user: User) {
    this.user = user;
  }

  get root(): User {
    return this.user;
  }

  /**
   * @method processCompleteUserSetup
   * @description 处理用户完整设置流程
   */
  async processCompleteUserSetup(
    departmentIds: string[],
    additionalRoleIds: string[],
    userRepository: UserRepository,
  ): Promise<void> {
    // 1. 验证用户状态
    if (!this.user.canLogin()) {
      throw new Error('用户状态不允许设置');
    }

    // 2. 验证部门归属
    if (departmentIds.length === 0) {
      throw new Error('用户必须归属至少一个部门');
    }

    // 3. 分配部门
    departmentIds.forEach(deptId => {
      this.user.addToDepartment(Uuid.fromString(deptId));
    });

    // 4. 分配额外角色
    additionalRoleIds.forEach(roleId => {
      this.user.assignRole(Uuid.fromString(roleId));
    });

    // 5. 激活用户
    this.user.activate();

    // 6. 验证聚合一致性
    this.validateAggregateConsistency();
  }

  /**
   * @private
   * @method validateAggregateConsistency
   * @description 验证聚合一致性
   */
  private validateAggregateConsistency(): void {
    // 验证用户必须有部门
    if (this.user.departmentIds.size === 0) {
      throw new Error('用户必须归属至少一个部门');
    }

    // 验证用户必须有角色
    if (this.user.roleIds.size === 0) {
      throw new Error('用户必须拥有至少一个角色');
    }

    // 验证用户状态合法性
    if (this.user.isActive() && this.user.departmentIds.size === 0) {
      throw new Error('活跃用户必须归属部门');
    }
  }

  /**
   * @method getDomainEvents
   * @description 获取聚合的领域事件
   */
  getDomainEvents(): UserDomainEvent[] {
    return this.user.domainEvents;
  }

  /**
   * @method clearDomainEvents
   * @description 清除聚合的领域事件
   */
  clearDomainEvents(): void {
    this.user.clearDomainEvents();
  }
}
```

### 步骤5: 创建领域服务

领域服务处理跨聚合的复杂业务逻辑：

```typescript
// domain/services/user-domain.service.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { OrganizationRepository } from '../../organization/domain/repositories/organization.repository';

/**
 * @class UserDomainService
 * @description 用户领域服务
 *
 * 主要原理与机制：
 * 1. 处理跨聚合的业务逻辑
 * 2. 协调多个仓储和聚合
 * 3. 实现复杂的业务规则验证
 * 4. 保持领域逻辑的纯粹性
 *
 * 功能与业务规则：
 * 1. 用户唯一性验证
 * 2. 跨组织的用户管理
 * 3. 用户权限继承规则
 * 4. 复杂的业务约束检查
 */
@Injectable()
export class UserDomainService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  /**
   * @method validateUserCreation
   * @description 验证用户创建的业务规则
   */
  async validateUserCreation(
    username: string,
    email: string,
    organizationId: string,
    tenantId: string,
  ): Promise<void> {
    // 1. 验证用户名唯一性（租户级别）
    const existingUserByUsername = await this.userRepository.findByUsername(
      username,
      tenantId,
    );
    if (existingUserByUsername) {
      throw new Error(`用户名 "${username}" 在该租户中已存在`);
    }

    // 2. 验证邮箱唯一性（全局级别）
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error(`邮箱 "${email}" 已被使用`);
    }

    // 3. 验证组织是否存在且活跃
    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new Error(`组织 "${organizationId}" 不存在`);
    }

    if (!organization.isActive()) {
      throw new Error(`组织 "${organization.name}" 不是活跃状态`);
    }

    // 4. 验证组织是否属于指定租户
    if (!organization.belongsToTenant(tenantId)) {
      throw new Error('组织不属于指定租户');
    }
  }

  /**
   * @method validateUserTransfer
   * @description 验证用户转移的业务规则
   */
  async validateUserTransfer(
    userId: string,
    fromOrganizationId: string,
    toOrganizationId: string,
    tenantId: string,
  ): Promise<void> {
    // 1. 验证用户存在
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`用户 "${userId}" 不存在`);
    }

    // 2. 验证用户当前组织
    if (user.organizationId.value !== fromOrganizationId) {
      throw new Error('用户不属于指定的源组织');
    }

    // 3. 验证目标组织
    const targetOrganization =
      await this.organizationRepository.findById(toOrganizationId);
    if (!targetOrganization) {
      throw new Error(`目标组织 "${toOrganizationId}" 不存在`);
    }

    if (!targetOrganization.isActive()) {
      throw new Error('目标组织不是活跃状态');
    }

    // 4. 验证组织间转移规则
    if (!targetOrganization.belongsToTenant(tenantId)) {
      throw new Error('目标组织不属于同一租户');
    }

    // 5. 检查用户是否有未完成的任务
    const hasPendingTasks = await this.checkUserPendingTasks(userId);
    if (hasPendingTasks) {
      throw new Error('用户有未完成的任务，不能转移组织');
    }
  }

  /**
   * @method calculateUserPermissions
   * @description 计算用户的有效权限
   */
  async calculateUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`用户 "${userId}" 不存在`);
    }

    const permissions = new Set<string>();

    // 1. 收集角色权限
    for (const roleId of user.roleIds) {
      const rolePermissions = await this.getRolePermissions(roleId.value);
      rolePermissions.forEach(permission => permissions.add(permission));
    }

    // 2. 收集组织权限
    const orgPermissions = await this.getOrganizationPermissions(
      user.organizationId.value,
    );
    orgPermissions.forEach(permission => permissions.add(permission));

    // 3. 收集部门权限
    for (const deptId of user.departmentIds) {
      const deptPermissions = await this.getDepartmentPermissions(deptId.value);
      deptPermissions.forEach(permission => permissions.add(permission));
    }

    return Array.from(permissions);
  }

  /**
   * @private
   * @method checkUserPendingTasks
   * @description 检查用户是否有未完成的任务
   */
  private async checkUserPendingTasks(userId: string): Promise<boolean> {
    // 这里会调用任务管理系统的API
    // 暂时返回false
    return false;
  }

  /**
   * @private
   * @method getRolePermissions
   * @description 获取角色权限
   */
  private async getRolePermissions(roleId: string): Promise<string[]> {
    // 实现角色权限查询
    return [];
  }

  /**
   * @private
   * @method getOrganizationPermissions
   * @description 获取组织权限
   */
  private async getOrganizationPermissions(orgId: string): Promise<string[]> {
    // 实现组织权限查询
    return [];
  }

  /**
   * @private
   * @method getDepartmentPermissions
   * @description 获取部门权限
   */
  private async getDepartmentPermissions(deptId: string): Promise<string[]> {
    // 实现部门权限查询
    return [];
  }
}
```

### 步骤6: 创建仓储接口

仓储接口定义数据访问契约：

```typescript
// domain/repositories/user.repository.ts
import { User } from '../entities/user.entity';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface UserRepository
 * @description 用户仓储接口
 *
 * 主要原理与机制：
 * 1. 定义用户数据访问的契约
 * 2. 隔离领域层和基础设施层
 * 3. 支持不同的存储实现
 * 4. 保持领域逻辑的纯粹性
 *
 * 功能与业务规则：
 * 1. 基础CRUD操作
 * 2. 业务查询方法
 * 3. 事务管理支持
 * 4. 并发控制支持
 */
export interface UserRepository {
  /**
   * @method save
   * @description 保存用户聚合
   */
  save(user: User): Promise<void>;

  /**
   * @method findById
   * @description 根据ID查找用户
   */
  findById(id: Uuid): Promise<User | null>;

  /**
   * @method findByUsername
   * @description 根据用户名查找用户
   */
  findByUsername(username: string, tenantId: string): Promise<User | null>;

  /**
   * @method findByEmail
   * @description 根据邮箱查找用户
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * @method findByOrganization
   * @description 查找组织下的用户
   */
  findByOrganization(organizationId: Uuid, tenantId: string): Promise<User[]>;

  /**
   * @method findByDepartment
   * @description 查找部门下的用户
   */
  findByDepartment(departmentId: Uuid, tenantId: string): Promise<User[]>;

  /**
   * @method findActiveUsers
   * @description 查找活跃用户
   */
  findActiveUsers(tenantId: string): Promise<User[]>;

  /**
   * @method delete
   * @description 删除用户
   */
  delete(id: Uuid): Promise<void>;

  /**
   * @method exists
   * @description 检查用户是否存在
   */
  exists(id: Uuid): Promise<boolean>;

  /**
   * @method count
   * @description 统计用户数量
   */
  count(tenantId: string): Promise<number>;
}
```

### 步骤7: 创建领域异常

定义业务异常：

```typescript
// domain/exceptions/user.exception.ts
/**
 * @class UserDomainException
 * @description 用户领域异常基类
 */
export abstract class UserDomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * @class UserNotFoundError
 * @description 用户不存在异常
 */
export class UserNotFoundError extends UserDomainException {
  constructor(userId: string) {
    super(`用户不存在: ${userId}`, 'USER_NOT_FOUND', { userId });
  }
}

/**
 * @class UserAlreadyExistsError
 * @description 用户已存在异常
 */
export class UserAlreadyExistsError extends UserDomainException {
  constructor(field: string, value: string) {
    super(`用户已存在: ${field} = ${value}`, 'USER_ALREADY_EXISTS', {
      field,
      value,
    });
  }
}

/**
 * @class InvalidUserStatusError
 * @description 无效用户状态异常
 */
export class InvalidUserStatusError extends UserDomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      `无效的状态转换: 从 ${currentStatus} 到 ${targetStatus}`,
      'INVALID_USER_STATUS',
      { currentStatus, targetStatus },
    );
  }
}
```

### 步骤8: 配置领域模块

```typescript
// domain/user-domain.module.ts
import { Module } from '@nestjs/common';
import { UserDomainService } from './services/user-domain.service';

/**
 * @class UserDomainModule
 * @description 用户领域模块
 */
@Module({
  providers: [UserDomainService],
  exports: [UserDomainService],
})
export class UserDomainModule {}

// domain/index.ts
export * from './entities';
export * from './value-objects';
export * from './events';
export * from './aggregates';
export * from './services';
export * from './repositories';
export * from './exceptions';
export * from './user-domain.module';
```

---

## ⚠️ 领域层开发要点

### DO ✅ 最佳实践

1. **采用充血模型**: 实体必须封装数据和行为，避免贫血模型
2. **值对象不可变**: 所有值对象创建后不能修改
3. **实体封装业务逻辑**: 业务规则必须在实体内部，而非外部Service
4. **聚合根管理一致性**: 通过聚合根维护数据一致性
5. **领域事件记录变更**: 所有重要业务变更都要发布事件
6. **领域服务处理跨聚合逻辑**: 复杂业务规则放在领域服务
7. **仓储接口在领域层**: 定义数据访问契约
8. **使用通用语言**: 代码反映业务概念
9. **异常表达业务规则**: 通过异常传达业务约束
10. **方法表达业务动作**: 用有意义的方法名表达业务操作

### DON'T ❌ 反模式与纯净性违规

#### 🚨 严重违规（破坏纯净性）

1. **不要使用贫血模型**

   ```typescript
   // ❌ 错误：贫血模型，只有数据没有行为
   export class User {
     public id: string;
     public username: string;
     public status: UserStatus;

     // 只有简单的getter/setter，没有业务逻辑
     getStatus(): UserStatus {
       return this.status;
     }

     setStatus(status: UserStatus): void {
       this.status = status; // 直接修改，没有业务规则验证
     }
   }

   // 业务逻辑被迫放在外部Service中
   export class UserService {
     activateUser(user: User): void {
       if (user.getStatus() === UserStatus.ACTIVE) {
         throw new Error('用户已激活');
       }
       user.setStatus(UserStatus.ACTIVE);
     }
   }

   // ✅ 正确：充血模型，封装数据和行为
   export class User extends BaseEntity {
     private _status: UserStatus;

     activate(): void {
       if (this._status === UserStatus.ACTIVE) {
         throw new Error('用户已经是激活状态');
       }

       if (this._status === UserStatus.DISABLED) {
         throw new Error('已禁用的用户不能激活');
       }

       const previousStatus = this._status;
       this._status = UserStatus.ACTIVE;
       this.updateTimestamp();

       this.addDomainEvent(
         new UserStatusChangedEvent(
           this.id.value,
           previousStatus,
           UserStatus.ACTIVE,
         ),
       );
     }
   }
   ```

2. **不要在领域实体中使用ORM装饰器**

   ```typescript
   // ❌ 错误：污染了领域实体
   @Entity('users')
   export class User extends BaseEntity {
     @PrimaryGeneratedColumn('uuid')
     id: string;

     @Column()
     username: string;
   }

   // ✅ 正确：纯净的领域实体
   export class User extends BaseEntity {
     private _username: Username;

     constructor(id: Uuid, username: Username) {
       super(id);
       this._username = username;
     }
   }
   ```

3. **不要在领域层直接依赖第三方库**

   ```typescript
   // ❌ 错误：引入外部依赖
   import axios from 'axios';
   import moment from 'moment';
   import _ from 'lodash';

   export class User {
     async validateEmail() {
       return axios.post('/validate', { email: this.email });
     }
   }

   // ✅ 正确：通过接口抽象外部依赖
   export class User {
     async validateEmail(validator: EmailValidator) {
       return validator.validate(this.email);
     }
   }
   ```

4. **不要在实体中包含基础设施代码**

   ```typescript
   // ❌ 错误：包含基础设施关注点
   export class User {
     async save() {
       await db.users.save(this); // 数据库操作
       await redis.set(`user:${this.id}`, this); // 缓存操作
       await emailService.send(this.email, 'welcome'); // 外部服务
     }
   }

   // ✅ 正确：纯粹的业务逻辑
   export class User {
     updateProfile(profile: UserProfile): void {
       this.validateProfile(profile);
       this._profile = profile;
       this.updateTimestamp();
       this.addDomainEvent(new UserProfileUpdatedEvent(...));
     }
   }
   ```

#### ⚠️ 一般反模式

4. **不要跨聚合直接引用**: 通过ID引用其他聚合
5. **不要在值对象中写业务逻辑**: 值对象只负责数据验证
6. **不要忽略领域事件**: 重要状态变更必须发布事件
7. **不要让领域层依赖外层**: 保持依赖方向正确
8. **不要在领域层处理技术关注点**: 事务、缓存等放在基础设施层
9. **不要破坏聚合边界**: 一个事务只能修改一个聚合
10. **不要忽视实体的行为设计**: 每个实体都应该有丰富的业务方法

#### 🔍 纯净性检查清单

在开发领域层时，确保：

- [ ] 采用充血模型，实体包含丰富的业务方法
- [ ] 没有贫血模型，避免只有getter/setter的数据容器
- [ ] 没有任何ORM相关的装饰器或注解
- [ ] 没有导入任何数据库相关的库
- [ ] 没有导入任何HTTP框架相关的装饰器
- [ ] 没有导入任何第三方工具库
- [ ] 所有依赖都通过接口抽象
- [ ] 只包含纯粹的业务逻辑
- [ ] 业务逻辑封装在实体内部，而非外部Service
- [ ] 可以在没有任何基础设施的情况下进行单元测试

---

## 🧪 领域层测试指南

### 纯净性带来的测试优势

由于领域层保持了绝对的纯净性，测试具有以下优势：

- **无需Mock基础设施**: 不依赖数据库、HTTP、文件系统等
- **测试速度极快**: 纯内存运行，无I/O操作
- **完全可控**: 所有输入输出都是确定的
- **易于调试**: 没有外部依赖的干扰
- **100%覆盖率**: 可以轻松测试所有代码路径

### 实体测试（纯净性示例）

```typescript
describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = User.create(
      'testuser',
      'test@example.com',
      'org-123',
      'tenant-123',
      {
        firstName: 'Test',
        lastName: 'User',
      },
    );
  });

  describe('activate', () => {
    it('should activate pending user', () => {
      // Act
      user.activate();

      // Assert
      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.domainEvents).toHaveLength(2); // Created + StatusChanged
    });

    it('should throw error when user already active', () => {
      // Arrange
      user.activate();

      // Act & Assert
      expect(() => user.activate()).toThrow('用户已经是激活状态');
    });
  });
});
```

### 值对象测试

```typescript
describe('Username Value Object', () => {
  describe('creation', () => {
    it('should create valid username', () => {
      // Act
      const username = Username.create('validuser');

      // Assert
      expect(username.value).toBe('validuser');
    });

    it('should throw error for invalid username', () => {
      // Act & Assert
      expect(() => Username.create('ab')).toThrow(
        '用户名长度必须在3-50字符之间',
      );
      expect(() => Username.create('invalid-user')).toThrow(
        '用户名只能包含字母、数字和下划线',
      );
    });
  });

  describe('equality', () => {
    it('should be equal for same values', () => {
      // Arrange
      const username1 = Username.create('testuser');
      const username2 = Username.create('testuser');

      // Act & Assert
      expect(username1.equals(username2)).toBe(true);
    });
  });
});
```

### 领域服务测试

```typescript
describe('UserDomainService', () => {
  let service: UserDomainService;
  let userRepository: jest.Mocked<UserRepository>;
  let organizationRepository: jest.Mocked<OrganizationRepository>;

  beforeEach(() => {
    userRepository = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    organizationRepository = {
      findById: jest.fn(),
    } as any;

    service = new UserDomainService(userRepository, organizationRepository);
  });

  describe('validateUserCreation', () => {
    it('should validate successfully for valid data', async () => {
      // Arrange
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);
      organizationRepository.findById.mockResolvedValue(mockActiveOrganization);

      // Act & Assert
      await expect(
        service.validateUserCreation(
          'newuser',
          'new@example.com',
          'org-123',
          'tenant-123',
        ),
      ).resolves.not.toThrow();
    });

    it('should throw error for duplicate username', async () => {
      // Arrange
      userRepository.findByUsername.mockResolvedValue(mockExistingUser);

      // Act & Assert
      await expect(
        service.validateUserCreation(
          'existinguser',
          'new@example.com',
          'org-123',
          'tenant-123',
        ),
      ).rejects.toThrow('用户名 "existinguser" 在该租户中已存在');
    });
  });
});
```

---

## 📚 参考资料

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Aggregate Pattern](https://martinfowler.com/bliki/DDD_Aggregate.html)
- [Value Object](https://martinfowler.com/bliki/ValueObject.html)
- [Domain Events](https://martinfowler.com/eaaDev/DomainEvent.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

---

## 🎯 总结

领域层是混合架构的**业务核心**，遵循以下关键原则：

### 核心理念

1. **业务为中心**: 所有设计都围绕业务概念
2. **充血模型**: 实体必须封装数据和行为，避免贫血模型
3. **绝对纯净性**: 领域层不能有任何技术基础设施依赖
4. **封装业务规则**: 业务逻辑集中在领域层的实体内部
5. **事件驱动**: 通过事件记录和传播状态变更
6. **聚合一致性**: 通过聚合根维护数据一致性

### 设计模式

1. **实体**: 有身份的业务对象，封装行为
2. **值对象**: 无身份的不可变对象，表达概念
3. **聚合根**: 管理聚合边界和一致性
4. **领域服务**: 处理跨聚合的复杂逻辑
5. **领域事件**: 记录重要的业务状态变更

### 实施策略

1. 先建模值对象和事件
2. 再设计实体和聚合根
3. 然后实现领域服务
4. 最后定义仓储接口

### 分层隔离策略

为确保领域层纯净性，采用以下隔离策略：

```typescript
// 领域层（纯净）
libs/domain/iam/src/user/domain/
├── entities/user.entity.ts        # 纯业务逻辑
├── value-objects/username.vo.ts   # 纯数据验证
├── events/user-created.event.ts   # 纯事件定义
└── repositories/user.repository.ts # 纯接口定义

// 基础设施层（技术实现）
libs/infrastructure/database/src/
├── entities/user.orm-entity.ts    # ORM映射
├── repositories/user.repository.impl.ts # 仓储实现
└── mappers/user.mapper.ts         # 领域-ORM映射
```

**关键隔离原则：**

- 领域实体 ≠ ORM实体（完全分离）
- 领域仓储接口 ≠ 仓储实现（依赖倒置）
- 业务逻辑 ≠ 技术实现（完全解耦）

这样的领域层设计能够充分体现业务价值，支持复杂的业务规则，保持绝对的技术独立性，并为事件溯源架构提供坚实的业务基础。
