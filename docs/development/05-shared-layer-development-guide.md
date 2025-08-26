# 混合架构共享层开发指南

## 通用组件 + 基础类型 + 工具函数 + 架构抽象

## 📋 文档信息

- **文档类型**: 混合架构共享层开发指南
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 正式版
- **目标读者**: 开发团队
- **架构愿景**: 通用复用、类型安全、架构一致

---

## 🎯 共享层核心原则

### 混合架构中的共享层职责

共享层是混合架构的**通用基础**，承载着以下关键职责：

- **基础抽象**: 提供领域层、应用层、基础设施层的基础抽象类和接口
- **通用类型**: 定义跨领域使用的值对象、枚举、常量等
- **工具函数**: 提供无业务逻辑的纯函数工具集
- **配置管理**: 统一的配置加载和管理机制
- **异常体系**: 标准化的异常类型和错误处理

### 🚨 共享层设计原则

**共享层必须保持绝对的通用性和无业务逻辑：**

#### ✅ 共享层职责

- **基础抽象**: Entity、ValueObject、AggregateRoot等DDD抽象
- **通用类型**: Uuid、DateTimeValue、Money等值对象
- **工具函数**: 日期处理、字符串操作、验证函数等
- **装饰器**: 通用装饰器（@Transactional、@Cache等）
- **中间件**: 通用拦截器、过滤器、管道等

#### ❌ 禁止的内容

- **不能**包含任何业务逻辑或业务规则
- **不能**依赖特定的业务领域
- **不能**包含具体的业务实体定义
- **不能**与外部服务或API直接耦合

### 架构分层中的位置

```
展现层 (Presentation) ← RESTful API
    ↓ 使用
应用层 (Application) ← Use-Case 业务编排
    ↓ 使用
领域层 (Domain) ← 业务核心（纯净）
    ↓ 使用
>>>>>>>>>> 共享层 (Shared) ← 通用基础 <<<<<<<<<<
    ↑ 被使用
基础设施层 (Infrastructure) ← 技术实现
```

### 共享层组件关系

```
基础抽象 (Base Abstractions)
    ↓ 继承
实体基类 (BaseEntity) + 值对象基类 (BaseValueObject)
    ↓ 使用
通用类型 (Common Types) + 工具函数 (Utilities)
    ↓ 支持
装饰器 (Decorators) + 中间件 (Middlewares)
    ↓ 配置
配置管理 (Configuration) + 异常体系 (Exceptions)
```

---

## 📁 共享层目录结构

```
libs/shared/
├── src/
│   ├── base/                   # 基础抽象
│   │   ├── entity.base.ts
│   │   ├── value-object.base.ts
│   │   ├── aggregate-root.base.ts
│   │   ├── event.base.ts
│   │   ├── command.base.ts
│   │   ├── query.base.ts
│   │   └── index.ts
│   ├── types/                  # 通用类型
│   │   ├── common/
│   │   │   ├── uuid.type.ts
│   │   │   ├── datetime.type.ts
│   │   │   ├── pagination.type.ts
│   │   │   └── index.ts
│   │   ├── enums/
│   │   │   ├── status.enum.ts
│   │   │   ├── role.enum.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── utils/                  # 工具函数
│   │   ├── date.util.ts
│   │   ├── string.util.ts
│   │   ├── validation.util.ts
│   │   ├── crypto.util.ts
│   │   └── index.ts
│   ├── decorators/             # 装饰器
│   │   ├── transactional.decorator.ts
│   │   ├── cache.decorator.ts
│   │   ├── retry.decorator.ts
│   │   └── index.ts
│   ├── middlewares/            # 中间件
│   │   ├── correlation-id.middleware.ts
│   │   ├── timeout.middleware.ts
│   │   └── index.ts
│   ├── exceptions/             # 异常体系
│   │   ├── domain.exception.ts
│   │   ├── application.exception.ts
│   │   ├── validation.exception.ts
│   │   └── index.ts
│   ├── interfaces/             # 通用接口
│   │   ├── repository.interface.ts
│   │   ├── event-bus.interface.ts
│   │   ├── logger.interface.ts
│   │   └── index.ts
│   ├── config/                 # 配置管理
│   │   ├── config.base.ts
│   │   ├── environment.config.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 🏗️ 基础抽象类

### 实体基类

```typescript
// base/entity.base.ts
import { Uuid } from '../types/common/uuid.type';

/**
 * @abstract BaseEntity
 * @description 实体基类
 *
 * 主要原理与机制：
 * 1. 提供所有实体的公共属性和行为
 * 2. 实现实体的相等性比较（基于ID）
 * 3. 支持创建时间、更新时间等审计字段
 * 4. 提供乐观锁支持（版本号）
 *
 * 功能与业务规则：
 * 1. 唯一标识管理
 * 2. 审计信息记录
 * 3. 实体生命周期管理
 * 4. 相等性和哈希计算
 */
export abstract class BaseEntity {
  protected readonly _id: Uuid;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _version: number;

  constructor(
    id?: Uuid,
    createdAt?: Date,
    updatedAt?: Date,
    version: number = 1,
  ) {
    this._id = id || Uuid.generate();
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._version = version;
  }

  get id(): Uuid {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get version(): number {
    return this._version;
  }

  /**
   * @method equals
   * @description 实体相等性比较
   */
  equals(other: BaseEntity): boolean {
    if (!other) return false;
    if (this.constructor !== other.constructor) return false;
    return this._id.equals(other._id);
  }

  /**
   * @method hashCode
   * @description 计算实体哈希值
   */
  hashCode(): string {
    return this._id.value;
  }

  /**
   * @protected
   * @method updateTimestamp
   * @description 更新时间戳
   */
  protected updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  /**
   * @protected
   * @method incrementVersion
   * @description 增加版本号（乐观锁）
   */
  protected incrementVersion(): void {
    this._version += 1;
    this.updateTimestamp();
  }

  /**
   * @method toJSON
   * @description 序列化为JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id.value,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      version: this._version,
    };
  }
}
```

### 值对象基类

```typescript
// base/value-object.base.ts

/**
 * @abstract BaseValueObject
 * @description 值对象基类
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值进行相等性比较
 * 3. 无标识：没有唯一标识符
 * 4. 类型安全：强类型约束
 *
 * 功能与业务规则：
 * 1. 值对象的创建和验证
 * 2. 相等性比较实现
 * 3. 字符串表示和序列化
 * 4. 不可变性保证
 */
export abstract class BaseValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this.validate(value);
    this._value = this.freeze(value);
  }

  get value(): T {
    return this._value;
  }

  /**
   * @abstract
   * @method validate
   * @description 验证值的有效性
   */
  protected abstract validate(value: T): void;

  /**
   * @method equals
   * @description 值对象相等性比较
   */
  equals(other: BaseValueObject<T>): boolean {
    if (!other) return false;
    if (this.constructor !== other.constructor) return false;
    return this.isEqual(this._value, other._value);
  }

  /**
   * @method toString
   * @description 字符串表示
   */
  toString(): string {
    if (typeof this._value === 'string') {
      return this._value;
    }
    if (typeof this._value === 'object' && this._value !== null) {
      return JSON.stringify(this._value);
    }
    return String(this._value);
  }

  /**
   * @method toJSON
   * @description 序列化为JSON
   */
  toJSON(): T {
    return this._value;
  }

  /**
   * @private
   * @method freeze
   * @description 冻结值对象，确保不可变性
   */
  private freeze(value: T): T {
    if (typeof value === 'object' && value !== null) {
      return Object.freeze({ ...value } as T);
    }
    return value;
  }

  /**
   * @private
   * @method isEqual
   * @description 深度相等性比较
   */
  private isEqual(a: T, b: T): boolean {
    if (a === b) return true;

    if (typeof a !== typeof b) return false;

    if (typeof a === 'object' && a !== null && b !== null) {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);

      if (aKeys.length !== bKeys.length) return false;

      return aKeys.every(key => this.isEqual((a as any)[key], (b as any)[key]));
    }

    return false;
  }
}
```

### 聚合根基类

```typescript
// base/aggregate-root.base.ts
import { BaseEntity } from './entity.base';
import { BaseEvent } from './event.base';

/**
 * @abstract AggregateRoot
 * @description 聚合根基类
 *
 * 主要原理与机制：
 * 1. 继承实体基类，具有唯一标识
 * 2. 管理领域事件的发布和清理
 * 3. 维护聚合的一致性边界
 * 4. 支持事件溯源模式
 *
 * 功能与业务规则：
 * 1. 聚合根的生命周期管理
 * 2. 领域事件的收集和发布
 * 3. 聚合一致性保证
 * 4. 并发控制支持
 */
export abstract class AggregateRoot extends BaseEntity {
  private _domainEvents: BaseEvent[] = [];

  get domainEvents(): BaseEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @protected
   * @method addDomainEvent
   * @description 添加领域事件
   */
  protected addDomainEvent(event: BaseEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @method clearDomainEvents
   * @description 清除领域事件
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * @method hasUncommittedEvents
   * @description 检查是否有未提交的事件
   */
  hasUncommittedEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * @method markEventsAsCommitted
   * @description 标记事件为已提交
   */
  markEventsAsCommitted(): void {
    this._domainEvents = [];
  }

  /**
   * @protected
   * @method applyChange
   * @description 应用状态变更并记录事件
   */
  protected applyChange(event: BaseEvent, isNew: boolean = true): void {
    this.mutate(event);
    if (isNew) {
      this.addDomainEvent(event);
    }
  }

  /**
   * @protected
   * @abstract
   * @method mutate
   * @description 根据事件改变聚合状态
   */
  protected abstract mutate(event: BaseEvent): void;

  /**
   * @method loadFromHistory
   * @description 从历史事件重建聚合状态
   */
  loadFromHistory(events: BaseEvent[]): void {
    for (const event of events) {
      this.applyChange(event, false);
    }
  }
}
```

### 事件基类

```typescript
// base/event.base.ts
import { Uuid } from '../types/common/uuid.type';

/**
 * @abstract BaseEvent
 * @description 领域事件基类
 *
 * 主要原理与机制：
 * 1. 不可变事件数据，确保历史记录完整性
 * 2. 包含事件元数据（时间戳、版本、操作者等）
 * 3. 支持事件重放和状态重建
 * 4. 提供事件序列化和反序列化
 *
 * 功能与业务规则：
 * 1. 事件的唯一标识和时间戳
 * 2. 聚合根信息记录
 * 3. 多租户和操作者追踪
 * 4. 事件版本控制
 */
export abstract class BaseEvent {
  public readonly eventId: Uuid;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly eventType: string;
  public readonly eventVersion: number;
  public readonly occurredOn: Date;
  public readonly tenantId?: string;
  public readonly operatorId?: string;
  public readonly correlationId?: string;
  public readonly causationId?: string;

  constructor(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    eventVersion: number = 1,
    tenantId?: string,
    operatorId?: string,
    correlationId?: string,
    causationId?: string,
  ) {
    this.eventId = Uuid.generate();
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.eventType = eventType;
    this.eventVersion = eventVersion;
    this.occurredOn = new Date();
    this.tenantId = tenantId;
    this.operatorId = operatorId;
    this.correlationId = correlationId;
    this.causationId = causationId;
  }

  /**
   * @method toJSON
   * @description 序列化事件为JSON
   */
  toJSON(): Record<string, any> {
    return {
      eventId: this.eventId.value,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      occurredOn: this.occurredOn.toISOString(),
      tenantId: this.tenantId,
      operatorId: this.operatorId,
      correlationId: this.correlationId,
      causationId: this.causationId,
      ...this.getEventData(),
    };
  }

  /**
   * @abstract
   * @method getEventData
   * @description 获取事件具体数据
   */
  protected abstract getEventData(): Record<string, any>;

  /**
   * @method equals
   * @description 事件相等性比较
   */
  equals(other: BaseEvent): boolean {
    if (!other) return false;
    return this.eventId.equals(other.eventId);
  }
}
```

### 命令和查询基类

```typescript
// base/command.base.ts

/**
 * @abstract BaseCommand
 * @description 命令基类
 *
 * 主要原理与机制：
 * 1. 表示系统的写操作意图
 * 2. 包含执行命令所需的所有数据
 * 3. 不可变对象，一旦创建不能修改
 * 4. 支持命令验证和审计
 *
 * 功能与业务规则：
 * 1. 命令的唯一标识和时间戳
 * 2. 操作者和租户信息
 * 3. 命令执行上下文
 */
export abstract class BaseCommand {
  public readonly commandId: Uuid;
  public readonly timestamp: Date;
  public readonly operatorId?: string;
  public readonly tenantId?: string;
  public readonly correlationId?: string;

  constructor(operatorId?: string, tenantId?: string, correlationId?: string) {
    this.commandId = Uuid.generate();
    this.timestamp = new Date();
    this.operatorId = operatorId;
    this.tenantId = tenantId;
    this.correlationId = correlationId;
  }

  /**
   * @abstract
   * @method validate
   * @description 验证命令数据的有效性
   */
  abstract validate(): void;
}

// base/query.base.ts

/**
 * @abstract BaseQuery
 * @description 查询基类
 *
 * 主要原理与机制：
 * 1. 表示系统的读操作请求
 * 2. 包含查询所需的过滤、排序、分页参数
 * 3. 不可变对象，确保查询的一致性
 * 4. 支持查询缓存和优化
 *
 * 功能与业务规则：
 * 1. 查询的唯一标识和时间戳
 * 2. 多租户查询隔离
 * 3. 分页和排序支持
 */
export abstract class BaseQuery {
  public readonly queryId: Uuid;
  public readonly timestamp: Date;
  public readonly tenantId?: string;
  public readonly userId?: string;

  constructor(tenantId?: string, userId?: string) {
    this.queryId = Uuid.generate();
    this.timestamp = new Date();
    this.tenantId = tenantId;
    this.userId = userId;
  }
}
```

---

## 🔢 通用类型定义

### UUID类型

```typescript
// types/common/uuid.type.ts
import { BaseValueObject } from '../../base/value-object.base';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';

/**
 * @class Uuid
 * @description UUID值对象
 *
 * 主要原理与机制：
 * 1. 封装UUID的生成和验证逻辑
 * 2. 提供类型安全的UUID操作
 * 3. 支持UUID格式验证
 * 4. 不可变值对象特性
 *
 * 功能与业务规则：
 * 1. UUID的生成和验证
 * 2. 字符串和UUID之间的转换
 * 3. UUID相等性比较
 */
export class Uuid extends BaseValueObject<string> {
  protected validate(value: string): void {
    if (!value) {
      throw new Error('UUID不能为空');
    }

    if (!validateUuid(value)) {
      throw new Error(`无效的UUID格式: ${value}`);
    }
  }

  /**
   * @static
   * @method generate
   * @description 生成新的UUID
   */
  static generate(): Uuid {
    return new Uuid(uuidv4());
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建UUID
   */
  static fromString(value: string): Uuid {
    return new Uuid(value);
  }

  /**
   * @static
   * @method isValid
   * @description 验证UUID格式
   */
  static isValid(value: string): boolean {
    return validateUuid(value);
  }
}
```

### 日期时间类型

```typescript
// types/common/datetime.type.ts
import { BaseValueObject } from '../../base/value-object.base';

/**
 * @class DateTimeValue
 * @description 日期时间值对象
 *
 * 主要原理与机制：
 * 1. 封装日期时间的创建和操作
 * 2. 提供时区安全的日期处理
 * 3. 支持日期格式化和比较
 * 4. 不可变值对象特性
 *
 * 功能与业务规则：
 * 1. 日期时间的创建和验证
 * 2. 时区转换和格式化
 * 3. 日期比较和计算
 */
export class DateTimeValue extends BaseValueObject<Date> {
  protected validate(value: Date): void {
    if (!value) {
      throw new Error('日期不能为空');
    }

    if (!(value instanceof Date)) {
      throw new Error('必须是有效的Date对象');
    }

    if (isNaN(value.getTime())) {
      throw new Error('无效的日期值');
    }
  }

  /**
   * @static
   * @method now
   * @description 创建当前时间
   */
  static now(): DateTimeValue {
    return new DateTimeValue(new Date());
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建日期
   */
  static fromString(dateString: string): DateTimeValue {
    const date = new Date(dateString);
    return new DateTimeValue(date);
  }

  /**
   * @static
   * @method fromTimestamp
   * @description 从时间戳创建日期
   */
  static fromTimestamp(timestamp: number): DateTimeValue {
    return new DateTimeValue(new Date(timestamp));
  }

  /**
   * @method format
   * @description 格式化日期
   */
  format(pattern: string = 'YYYY-MM-DD HH:mm:ss'): string {
    // 简单的日期格式化实现
    const year = this._value.getFullYear();
    const month = String(this._value.getMonth() + 1).padStart(2, '0');
    const day = String(this._value.getDate()).padStart(2, '0');
    const hours = String(this._value.getHours()).padStart(2, '0');
    const minutes = String(this._value.getMinutes()).padStart(2, '0');
    const seconds = String(this._value.getSeconds()).padStart(2, '0');

    return pattern
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * @method isBefore
   * @description 判断是否在指定时间之前
   */
  isBefore(other: DateTimeValue): boolean {
    return this._value.getTime() < other._value.getTime();
  }

  /**
   * @method isAfter
   * @description 判断是否在指定时间之后
   */
  isAfter(other: DateTimeValue): boolean {
    return this._value.getTime() > other._value.getTime();
  }

  /**
   * @method addDays
   * @description 添加天数
   */
  addDays(days: number): DateTimeValue {
    const newDate = new Date(this._value);
    newDate.setDate(newDate.getDate() + days);
    return new DateTimeValue(newDate);
  }

  /**
   * @method toISOString
   * @description 转换为ISO字符串
   */
  toISOString(): string {
    return this._value.toISOString();
  }
}
```

### 分页类型

```typescript
// types/common/pagination.type.ts

/**
 * @interface PaginationOptions
 * @description 分页选项
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * @interface PaginationMeta
 * @description 分页元信息
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * @interface PaginatedResult
 * @description 分页结果
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * @class Pagination
 * @description 分页值对象
 *
 * 主要原理与机制：
 * 1. 封装分页参数的验证和计算
 * 2. 提供分页信息的标准化处理
 * 3. 支持排序和过滤参数
 *
 * 功能与业务规则：
 * 1. 分页参数验证
 * 2. 分页元信息计算
 * 3. 数据库查询偏移量计算
 */
export class Pagination extends BaseValueObject<PaginationOptions> {
  protected validate(value: PaginationOptions): void {
    if (value.page < 1) {
      throw new Error('页码必须大于0');
    }

    if (value.limit < 1 || value.limit > 100) {
      throw new Error('每页数量必须在1-100之间');
    }

    if (
      value.orderDirection &&
      !['asc', 'desc'].includes(value.orderDirection)
    ) {
      throw new Error('排序方向必须是asc或desc');
    }
  }

  get page(): number {
    return this._value.page;
  }

  get limit(): number {
    return this._value.limit;
  }

  get orderBy(): string | undefined {
    return this._value.orderBy;
  }

  get orderDirection(): 'asc' | 'desc' {
    return this._value.orderDirection || 'asc';
  }

  /**
   * @method getOffset
   * @description 计算数据库查询偏移量
   */
  getOffset(): number {
    return (this._value.page - 1) * this._value.limit;
  }

  /**
   * @method calculateMeta
   * @description 计算分页元信息
   */
  calculateMeta(total: number): PaginationMeta {
    const totalPages = Math.ceil(total / this._value.limit);

    return {
      page: this._value.page,
      limit: this._value.limit,
      total,
      totalPages,
      hasNext: this._value.page < totalPages,
      hasPrev: this._value.page > 1,
    };
  }

  /**
   * @static
   * @method create
   * @description 创建分页对象
   */
  static create(
    page: number = 1,
    limit: number = 20,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',
  ): Pagination {
    return new Pagination({
      page,
      limit,
      orderBy,
      orderDirection,
    });
  }
}
```

---

## 🛠️ 工具函数库

### 日期工具

```typescript
// utils/date.util.ts

/**
 * @class DateUtil
 * @description 日期工具函数集
 *
 * 主要原理与机制：
 * 1. 提供常用的日期操作函数
 * 2. 无状态的纯函数实现
 * 3. 时区安全的日期处理
 * 4. 支持多种日期格式
 *
 * 功能与业务规则：
 * 1. 日期格式化和解析
 * 2. 日期计算和比较
 * 3. 时区转换
 * 4. 业务日期规则
 */
export class DateUtil {
  /**
   * @static
   * @method isBusinessDay
   * @description 判断是否为工作日
   */
  static isBusinessDay(date: Date): boolean {
    const day = date.getDay();
    return day >= 1 && day <= 5; // 周一到周五
  }

  /**
   * @static
   * @method addBusinessDays
   * @description 添加工作日
   */
  static addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (this.isBusinessDay(result)) {
        addedDays++;
      }
    }

    return result;
  }

  /**
   * @static
   * @method getStartOfDay
   * @description 获取一天的开始时间
   */
  static getStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * @static
   * @method getEndOfDay
   * @description 获取一天的结束时间
   */
  static getEndOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * @static
   * @method getStartOfMonth
   * @description 获取月份的开始时间
   */
  static getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * @static
   * @method getEndOfMonth
   * @description 获取月份的结束时间
   */
  static getEndOfMonth(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  }

  /**
   * @static
   * @method getDaysDifference
   * @description 计算两个日期之间的天数差
   */
  static getDaysDifference(date1: Date, date2: Date): number {
    const timeDifference = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  }

  /**
   * @static
   * @method isExpired
   * @description 判断是否已过期
   */
  static isExpired(
    expirationDate: Date,
    currentDate: Date = new Date(),
  ): boolean {
    return currentDate > expirationDate;
  }

  /**
   * @static
   * @method parseDate
   * @description 安全的日期解析
   */
  static parseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }
}
```

### 字符串工具

```typescript
// utils/string.util.ts

/**
 * @class StringUtil
 * @description 字符串工具函数集
 *
 * 主要原理与机制：
 * 1. 提供常用的字符串操作函数
 * 2. 无状态的纯函数实现
 * 3. 支持Unicode和多语言
 * 4. 防止XSS和注入攻击
 *
 * 功能与业务规则：
 * 1. 字符串格式化和验证
 * 2. 安全的字符串处理
 * 3. 搜索和匹配功能
 * 4. 编码和解码
 */
export class StringUtil {
  /**
   * @static
   * @method isEmpty
   * @description 判断字符串是否为空
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * @static
   * @method isNotEmpty
   * @description 判断字符串是否不为空
   */
  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str);
  }

  /**
   * @static
   * @method truncate
   * @description 截断字符串
   */
  static truncate(
    str: string,
    maxLength: number,
    suffix: string = '...',
  ): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * @static
   * @method capitalize
   * @description 首字母大写
   */
  static capitalize(str: string): string {
    if (this.isEmpty(str)) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * @static
   * @method camelCase
   * @description 转换为驼峰命名
   */
  static camelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^[A-Z]/, char => char.toLowerCase());
  }

  /**
   * @static
   * @method kebabCase
   * @description 转换为kebab命名
   */
  static kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * @static
   * @method sanitize
   * @description 清理HTML标签和特殊字符
   */
  static sanitize(str: string): string {
    return str
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/[<>&"']/g, char => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;',
        };
        return entities[char] || char;
      });
  }

  /**
   * @static
   * @method mask
   * @description 掩码敏感信息
   */
  static mask(
    str: string,
    visibleStart: number = 3,
    visibleEnd: number = 3,
    maskChar: string = '*',
  ): string {
    if (str.length <= visibleStart + visibleEnd) {
      return maskChar.repeat(str.length);
    }

    const start = str.substring(0, visibleStart);
    const end = str.substring(str.length - visibleEnd);
    const middle = maskChar.repeat(str.length - visibleStart - visibleEnd);

    return start + middle + end;
  }

  /**
   * @static
   * @method generateRandomString
   * @description 生成随机字符串
   */
  static generateRandomString(
    length: number,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * @static
   * @method slugify
   * @description 生成URL友好的字符串
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
      .replace(/^-+|-+$/g, ''); // 移除首尾连字符
  }

  /**
   * @static
   * @method similarity
   * @description 计算字符串相似度（Levenshtein距离）
   */
  static similarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    // 初始化矩阵
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // 计算编辑距离
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 删除
          matrix[i][j - 1] + 1, // 插入
          matrix[i - 1][j - 1] + cost, // 替换
        );
      }
    }

    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - matrix[len1][len2]) / maxLength;
  }
}
```

### 验证工具

```typescript
// utils/validation.util.ts

/**
 * @class ValidationUtil
 * @description 验证工具函数集
 *
 * 主要原理与机制：
 * 1. 提供常用的数据验证函数
 * 2. 使用正则表达式进行格式验证
 * 3. 支持自定义验证规则
 * 4. 提供详细的错误信息
 *
 * 功能与业务规则：
 * 1. 基础数据类型验证
 * 2. 业务规则验证
 * 3. 格式和模式验证
 * 4. 组合验证支持
 */
export class ValidationUtil {
  /**
   * @static
   * @method isEmail
   * @description 验证邮箱格式
   */
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * @static
   * @method isPhone
   * @description 验证手机号格式
   */
  static isPhone(phone: string): boolean {
    // 支持多种国际格式
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * @static
   * @method isUrl
   * @description 验证URL格式
   */
  static isUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method isIPAddress
   * @description 验证IP地址格式
   */
  static isIPAddress(ip: string): boolean {
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * @static
   * @method isStrongPassword
   * @description 验证强密码
   */
  static isStrongPassword(password: string): boolean {
    // 至少8位，包含大小写字母、数字和特殊字符
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  /**
   * @static
   * @method isCreditCard
   * @description 验证信用卡号格式（Luhn算法）
   */
  static isCreditCard(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * @static
   * @method isNumeric
   * @description 验证是否为数字
   */
  static isNumeric(value: string): boolean {
    return !isNaN(Number(value)) && isFinite(Number(value));
  }

  /**
   * @static
   * @method isInteger
   * @description 验证是否为整数
   */
  static isInteger(value: string | number): boolean {
    return Number.isInteger(Number(value));
  }

  /**
   * @static
   * @method isInRange
   * @description 验证数值是否在指定范围内
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * @static
   * @method isLengthValid
   * @description 验证字符串长度
   */
  static isLengthValid(
    str: string,
    minLength: number,
    maxLength?: number,
  ): boolean {
    const length = str.length;
    if (length < minLength) return false;
    if (maxLength !== undefined && length > maxLength) return false;
    return true;
  }

  /**
   * @static
   * @method isAlphanumeric
   * @description 验证是否为字母数字组合
   */
  static isAlphanumeric(str: string): boolean {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(str);
  }

  /**
   * @static
   * @method isDateString
   * @description 验证日期字符串格式
   */
  static isDateString(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      !isNaN(date.getTime()) &&
      date.toISOString().startsWith(dateString.split('T')[0])
    );
  }

  /**
   * @static
   * @method validate
   * @description 组合验证器
   */
  static validate<T>(
    value: T,
    validators: Array<(value: T) => boolean | string>,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (result === false) {
        errors.push('验证失败');
      } else if (typeof result === 'string') {
        errors.push(result);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

---

## 🔧 装饰器和中间件

### 事务装饰器

```typescript
// decorators/transactional.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const TRANSACTIONAL_KEY = 'transactional';

/**
 * @interface TransactionalOptions
 * @description 事务选项
 */
export interface TransactionalOptions {
  isolation?:
    | 'READ_UNCOMMITTED'
    | 'READ_COMMITTED'
    | 'REPEATABLE_READ'
    | 'SERIALIZABLE';
  propagation?: 'REQUIRED' | 'REQUIRES_NEW' | 'SUPPORTS' | 'NOT_SUPPORTED';
  timeout?: number;
  readOnly?: boolean;
}

/**
 * @decorator Transactional
 * @description 事务装饰器
 *
 * 主要原理与机制：
 * 1. 使用AOP切面编程实现事务管理
 * 2. 支持不同的事务隔离级别和传播机制
 * 3. 自动回滚异常事务
 * 4. 支持嵌套事务处理
 *
 * 功能与业务规则：
 * 1. 方法级事务控制
 * 2. 事务参数配置
 * 3. 异常自动回滚
 * 4. 性能监控集成
 */
export function Transactional(
  options: TransactionalOptions = {},
): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(TRANSACTIONAL_KEY, {
      isolation: options.isolation || 'READ_COMMITTED',
      propagation: options.propagation || 'REQUIRED',
      timeout: options.timeout || 30000,
      readOnly: options.readOnly || false,
    })(target, propertyKey, descriptor);

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 这里会被AOP拦截器处理
      // 实际的事务逻辑在TransactionalInterceptor中实现
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
```

### 缓存装饰器

```typescript
// decorators/cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache';

/**
 * @interface CacheOptions
 * @description 缓存选项
 */
export interface CacheOptions {
  key?: string;
  ttl?: number; // 生存时间（秒）
  namespace?: string;
  condition?: string; // SpEL表达式
}

/**
 * @decorator Cache
 * @description 缓存装饰器
 *
 * 主要原理与机制：
 * 1. 基于AOP实现方法结果缓存
 * 2. 支持动态缓存键生成
 * 3. 条件缓存和TTL控制
 * 4. 多级缓存支持
 *
 * 功能与业务规则：
 * 1. 方法返回值缓存
 * 2. 缓存键自动生成
 * 3. 缓存过期管理
 * 4. 缓存穿透防护
 */
export function Cache(options: CacheOptions = {}): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(CACHE_KEY, {
      key: options.key,
      ttl: options.ttl || 300, // 默认5分钟
      namespace: options.namespace || target.constructor.name,
      condition: options.condition,
    })(target, propertyKey, descriptor);

    return descriptor;
  };
}

/**
 * @decorator CacheEvict
 * @description 缓存清除装饰器
 */
export function CacheEvict(
  options: { key?: string; allEntries?: boolean } = {},
): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata('cache_evict', {
      key: options.key,
      allEntries: options.allEntries || false,
    })(target, propertyKey, descriptor);

    return descriptor;
  };
}
```

### 重试装饰器

```typescript
// decorators/retry.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RETRY_KEY = 'retry';

/**
 * @interface RetryOptions
 * @description 重试选项
 */
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'fixed' | 'exponential' | 'linear';
  maxDelay?: number;
  retryOn?: Array<new (...args: any[]) => Error>;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * @decorator Retry
 * @description 重试装饰器
 *
 * 主要原理与机制：
 * 1. 自动重试失败的方法调用
 * 2. 支持多种退避策略
 * 3. 可配置重试条件和次数
 * 4. 提供重试回调钩子
 *
 * 功能与业务规则：
 * 1. 方法执行失败自动重试
 * 2. 指数退避和线性退避
 * 3. 特定异常类型重试
 * 4. 重试状态监控
 */
export function Retry(options: RetryOptions = {}): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    const maxAttempts = options.maxAttempts || 3;
    const delay = options.delay || 1000;
    const backoff = options.backoff || 'exponential';
    const maxDelay = options.maxDelay || 10000;
    const retryOn = options.retryOn || [Error];

    descriptor.value = async function (...args: any[]) {
      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;

          // 检查是否应该重试此类型的错误
          const shouldRetry = retryOn.some(
            ErrorType => error instanceof ErrorType,
          );

          if (!shouldRetry || attempt === maxAttempts) {
            throw error;
          }

          // 调用重试回调
          if (options.onRetry) {
            options.onRetry(lastError, attempt);
          }

          // 计算延迟时间
          let currentDelay = delay;
          switch (backoff) {
            case 'exponential':
              currentDelay = Math.min(
                delay * Math.pow(2, attempt - 1),
                maxDelay,
              );
              break;
            case 'linear':
              currentDelay = Math.min(delay * attempt, maxDelay);
              break;
            default:
              currentDelay = delay;
          }

          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, currentDelay));
        }
      }

      throw lastError!;
    };

    SetMetadata(RETRY_KEY, options)(target, propertyKey, descriptor);
    return descriptor;
  };
}
```

### 关联ID中间件

```typescript
// middlewares/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Uuid } from '../types/common/uuid.type';

/**
 * @class CorrelationIdMiddleware
 * @description 关联ID中间件
 *
 * 主要原理与机制：
 * 1. 为每个HTTP请求生成唯一的关联ID
 * 2. 在请求生命周期中传递关联ID
 * 3. 便于分布式追踪和日志关联
 * 4. 支持外部关联ID传入
 *
 * 功能与业务规则：
 * 1. 关联ID的生成和传递
 * 2. HTTP头部设置
 * 3. 上下文存储
 * 4. 日志追踪支持
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private static readonly CORRELATION_ID_HEADER = 'x-correlation-id';

  use(req: Request, res: Response, next: NextFunction) {
    // 从请求头获取关联ID，如果没有则生成新的
    let correlationId = req.headers[
      CorrelationIdMiddleware.CORRELATION_ID_HEADER
    ] as string;

    if (!correlationId || !Uuid.isValid(correlationId)) {
      correlationId = Uuid.generate().value;
    }

    // 设置到请求对象上
    (req as any).correlationId = correlationId;

    // 设置响应头
    res.set(CorrelationIdMiddleware.CORRELATION_ID_HEADER, correlationId);

    // 存储到异步上下文中（如果使用AsyncLocalStorage）
    this.storeInAsyncContext(correlationId, () => {
      next();
    });
  }

  private storeInAsyncContext(correlationId: string, callback: () => void) {
    // 这里可以集成AsyncLocalStorage或其他上下文存储机制
    // 示例实现
    process.nextTick(() => {
      // 模拟异步上下文存储
      (global as any).__correlationId = correlationId;
      callback();
    });
  }

  /**
   * @static
   * @method getCurrentCorrelationId
   * @description 获取当前关联ID
   */
  static getCurrentCorrelationId(): string | undefined {
    return (global as any).__correlationId;
  }
}
```

---

## ⚠️ 异常体系

### 领域异常

```typescript
// exceptions/domain.exception.ts

/**
 * @abstract DomainException
 * @description 领域异常基类
 *
 * 主要原理与机制：
 * 1. 表示业务规则违反的异常
 * 2. 提供结构化的错误信息
 * 3. 支持错误码和上下文信息
 * 4. 便于异常处理和转换
 *
 * 功能与业务规则：
 * 1. 业务异常的标准化表示
 * 2. 错误信息的国际化支持
 * 3. 异常链和原因追踪
 * 4. 日志和监控集成
 */
export abstract class DomainException extends Error {
  public readonly code: string;
  public readonly context: Record<string, any>;
  public readonly timestamp: Date;
  public readonly correlationId?: string;

  constructor(
    message: string,
    code: string,
    context: Record<string, any> = {},
    cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.correlationId = CorrelationIdMiddleware.getCurrentCorrelationId();

    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }

    // 确保堆栈跟踪正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * @method toJSON
   * @description 序列化异常信息
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      stack: this.stack,
    };
  }

  /**
   * @method toString
   * @description 字符串表示
   */
  toString(): string {
    return `${this.name}[${this.code}]: ${this.message}`;
  }
}

/**
 * @class BusinessRuleViolationException
 * @description 业务规则违反异常
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(
    message: string,
    rule: string,
    context: Record<string, any> = {},
    cause?: Error,
  ) {
    super(message, 'BUSINESS_RULE_VIOLATION', { rule, ...context }, cause);
  }
}

/**
 * @class EntityNotFoundException
 * @description 实体未找到异常
 */
export class EntityNotFoundException extends DomainException {
  constructor(
    entityType: string,
    identifier: string,
    context: Record<string, any> = {},
  ) {
    super(
      `${entityType} with identifier '${identifier}' not found`,
      'ENTITY_NOT_FOUND',
      { entityType, identifier, ...context },
    );
  }
}

/**
 * @class DuplicateEntityException
 * @description 实体重复异常
 */
export class DuplicateEntityException extends DomainException {
  constructor(
    entityType: string,
    field: string,
    value: string,
    context: Record<string, any> = {},
  ) {
    super(
      `${entityType} with ${field} '${value}' already exists`,
      'DUPLICATE_ENTITY',
      { entityType, field, value, ...context },
    );
  }
}

/**
 * @class InvalidOperationException
 * @description 无效操作异常
 */
export class InvalidOperationException extends DomainException {
  constructor(
    operation: string,
    reason: string,
    context: Record<string, any> = {},
  ) {
    super(`Invalid operation '${operation}': ${reason}`, 'INVALID_OPERATION', {
      operation,
      reason,
      ...context,
    });
  }
}
```

### 应用异常

```typescript
// exceptions/application.exception.ts

/**
 * @abstract ApplicationException
 * @description 应用异常基类
 *
 * 主要原理与机制：
 * 1. 表示应用层处理过程中的异常
 * 2. 包装和转换领域异常
 * 3. 提供用户友好的错误信息
 * 4. 支持错误恢复和重试
 *
 * 功能与业务规则：
 * 1. 应用流程异常处理
 * 2. 外部服务集成异常
 * 3. 权限和授权异常
 * 4. 配置和环境异常
 */
export abstract class ApplicationException extends Error {
  public readonly code: string;
  public readonly details: Record<string, any>;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    details: Record<string, any> = {},
    retryable: boolean = false,
    cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.retryable = retryable;

    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * @class UnauthorizedException
 * @description 未授权异常
 */
export class UnauthorizedException extends ApplicationException {
  constructor(
    resource: string,
    action: string,
    details: Record<string, any> = {},
  ) {
    super(
      `Unauthorized to perform '${action}' on '${resource}'`,
      'UNAUTHORIZED',
      { resource, action, ...details },
      false,
    );
  }
}

/**
 * @class ForbiddenException
 * @description 禁止访问异常
 */
export class ForbiddenException extends ApplicationException {
  constructor(
    resource: string,
    reason: string,
    details: Record<string, any> = {},
  ) {
    super(
      `Access forbidden to '${resource}': ${reason}`,
      'FORBIDDEN',
      { resource, reason, ...details },
      false,
    );
  }
}

/**
 * @class ExternalServiceException
 * @description 外部服务异常
 */
export class ExternalServiceException extends ApplicationException {
  constructor(
    service: string,
    operation: string,
    details: Record<string, any> = {},
    retryable: boolean = true,
  ) {
    super(
      `External service '${service}' failed during '${operation}'`,
      'EXTERNAL_SERVICE_ERROR',
      { service, operation, ...details },
      retryable,
    );
  }
}

/**
 * @class ConfigurationException
 * @description 配置异常
 */
export class ConfigurationException extends ApplicationException {
  constructor(
    setting: string,
    reason: string,
    details: Record<string, any> = {},
  ) {
    super(
      `Configuration error for '${setting}': ${reason}`,
      'CONFIGURATION_ERROR',
      { setting, reason, ...details },
      false,
    );
  }
}
```

### 验证异常

```typescript
// exceptions/validation.exception.ts

/**
 * @interface ValidationError
 * @description 验证错误详情
 */
export interface ValidationError {
  field: string;
  value: any;
  constraints: string[];
  children?: ValidationError[];
}

/**
 * @class ValidationException
 * @description 验证异常
 *
 * 主要原理与机制：
 * 1. 封装数据验证失败的详细信息
 * 2. 支持字段级和对象级验证错误
 * 3. 提供结构化的错误报告
 * 4. 便于前端错误显示
 *
 * 功能与业务规则：
 * 1. 输入数据验证
 * 2. 业务规则验证
 * 3. 嵌套对象验证
 * 4. 国际化错误消息
 */
export class ValidationException extends Error {
  public readonly code: string = 'VALIDATION_ERROR';
  public readonly errors: ValidationError[];
  public readonly timestamp: Date;

  constructor(errors: ValidationError[], message?: string) {
    const defaultMessage = `Validation failed for ${errors.length} field(s)`;
    super(message || defaultMessage);
    this.name = 'ValidationException';
    this.errors = errors;
    this.timestamp = new Date();
  }

  /**
   * @static
   * @method fromFieldError
   * @description 从单个字段错误创建验证异常
   */
  static fromFieldError(
    field: string,
    value: any,
    constraints: string[],
  ): ValidationException {
    return new ValidationException([{ field, value, constraints }]);
  }

  /**
   * @static
   * @method fromClassValidatorErrors
   * @description 从class-validator错误创建验证异常
   */
  static fromClassValidatorErrors(errors: any[]): ValidationException {
    const validationErrors: ValidationError[] = errors.map(error => ({
      field: error.property,
      value: error.value,
      constraints: Object.values(error.constraints || {}),
      children:
        error.children?.length > 0
          ? this.fromClassValidatorErrors(error.children).errors
          : undefined,
    }));

    return new ValidationException(validationErrors);
  }

  /**
   * @method hasFieldError
   * @description 检查是否包含特定字段的错误
   */
  hasFieldError(field: string): boolean {
    return this.errors.some(error => error.field === field);
  }

  /**
   * @method getFieldErrors
   * @description 获取特定字段的错误
   */
  getFieldErrors(field: string): string[] {
    const fieldError = this.errors.find(error => error.field === field);
    return fieldError?.constraints || [];
  }

  /**
   * @method toJSON
   * @description 序列化为JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      errors: this.errors,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * @method toFormattedString
   * @description 格式化为易读字符串
   */
  toFormattedString(): string {
    const errorMessages = this.errors.map(error => {
      const constraints = error.constraints.join(', ');
      return `  ${error.field}: ${constraints}`;
    });

    return `Validation failed:\n${errorMessages.join('\n')}`;
  }
}
```

---

## 🔧 通用接口定义

### 仓储接口

```typescript
// interfaces/repository.interface.ts
import { BaseEntity } from '../base/entity.base';
import { Uuid } from '../types/common/uuid.type';
import { PaginatedResult, Pagination } from '../types/common/pagination.type';

/**
 * @interface IRepository
 * @description 仓储基础接口
 *
 * 主要原理与机制：
 * 1. 定义实体持久化的标准操作
 * 2. 支持同步和异步操作
 * 3. 提供基础的CRUD功能
 * 4. 支持批量操作和事务
 *
 * 功能与业务规则：
 * 1. 实体的增删改查
 * 2. 分页查询支持
 * 3. 条件查询和排序
 * 4. 事务和并发控制
 */
export interface IRepository<T extends BaseEntity> {
  /**
   * @method save
   * @description 保存实体
   */
  save(entity: T): Promise<void>;

  /**
   * @method saveMany
   * @description 批量保存实体
   */
  saveMany(entities: T[]): Promise<void>;

  /**
   * @method findById
   * @description 根据ID查找实体
   */
  findById(id: Uuid): Promise<T | null>;

  /**
   * @method findByIds
   * @description 根据ID列表查找实体
   */
  findByIds(ids: Uuid[]): Promise<T[]>;

  /**
   * @method findAll
   * @description 查找所有实体（分页）
   */
  findAll(pagination?: Pagination): Promise<PaginatedResult<T>>;

  /**
   * @method findBy
   * @description 根据条件查找实体
   */
  findBy(
    criteria: Partial<T>,
    pagination?: Pagination,
  ): Promise<PaginatedResult<T>>;

  /**
   * @method exists
   * @description 检查实体是否存在
   */
  exists(id: Uuid): Promise<boolean>;

  /**
   * @method count
   * @description 统计实体数量
   */
  count(criteria?: Partial<T>): Promise<number>;

  /**
   * @method delete
   * @description 删除实体
   */
  delete(id: Uuid): Promise<void>;

  /**
   * @method deleteMany
   * @description 批量删除实体
   */
  deleteMany(ids: Uuid[]): Promise<void>;

  /**
   * @method softDelete
   * @description 软删除实体
   */
  softDelete(id: Uuid): Promise<void>;
}

/**
 * @interface IReadOnlyRepository
 * @description 只读仓储接口
 */
export interface IReadOnlyRepository<T extends BaseEntity> {
  findById(id: Uuid): Promise<T | null>;
  findByIds(ids: Uuid[]): Promise<T[]>;
  findAll(pagination?: Pagination): Promise<PaginatedResult<T>>;
  findBy(
    criteria: Partial<T>,
    pagination?: Pagination,
  ): Promise<PaginatedResult<T>>;
  exists(id: Uuid): Promise<boolean>;
  count(criteria?: Partial<T>): Promise<number>;
}
```

### 事件总线接口

```typescript
// interfaces/event-bus.interface.ts
import { BaseEvent } from '../base/event.base';

/**
 * @interface IEventBus
 * @description 事件总线接口
 *
 * 主要原理与机制：
 * 1. 定义事件发布和订阅的标准接口
 * 2. 支持同步和异步事件处理
 * 3. 提供事件过滤和路由机制
 * 4. 支持错误处理和重试
 *
 * 功能与业务规则：
 * 1. 事件的发布和订阅
 * 2. 事件处理器管理
 * 3. 事件持久化和重放
 * 4. 死信队列处理
 */
export interface IEventBus {
  /**
   * @method publish
   * @description 发布单个事件
   */
  publish(event: BaseEvent): Promise<void>;

  /**
   * @method publishMany
   * @description 批量发布事件
   */
  publishMany(events: BaseEvent[]): Promise<void>;

  /**
   * @method subscribe
   * @description 订阅事件
   */
  subscribe<T extends BaseEvent>(
    eventType: string,
    handler: IEventHandler<T>,
  ): void;

  /**
   * @method unsubscribe
   * @description 取消订阅事件
   */
  unsubscribe(eventType: string, handlerId: string): void;
}

/**
 * @interface IEventHandler
 * @description 事件处理器接口
 */
export interface IEventHandler<T extends BaseEvent> {
  /**
   * @method handle
   * @description 处理事件
   */
  handle(event: T): Promise<void>;

  /**
   * @method canHandle
   * @description 判断是否可以处理事件
   */
  canHandle?(event: BaseEvent): boolean;

  /**
   * @method onError
   * @description 错误处理
   */
  onError?(error: Error, event: T): Promise<void>;
}

/**
 * @interface IEventStore
 * @description 事件存储接口
 */
export interface IEventStore {
  /**
   * @method append
   * @description 追加事件
   */
  append(
    streamId: string,
    events: BaseEvent[],
    expectedVersion?: number,
  ): Promise<void>;

  /**
   * @method getEvents
   * @description 获取事件流
   */
  getEvents(streamId: string, fromVersion?: number): Promise<BaseEvent[]>;

  /**
   * @method getSnapshot
   * @description 获取快照
   */
  getSnapshot<T>(streamId: string): Promise<T | null>;

  /**
   * @method saveSnapshot
   * @description 保存快照
   */
  saveSnapshot<T>(
    streamId: string,
    snapshot: T,
    version: number,
  ): Promise<void>;
}
```

### 日志接口

```typescript
// interfaces/logger.interface.ts

/**
 * @enum LogLevel
 * @description 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

/**
 * @interface LogContext
 * @description 日志上下文
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  operation?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

/**
 * @interface ILogger
 * @description 日志接口
 *
 * 主要原理与机制：
 * 1. 提供统一的日志记录接口
 * 2. 支持结构化日志记录
 * 3. 包含上下文信息和元数据
 * 4. 支持不同日志级别
 *
 * 功能与业务规则：
 * 1. 多级别日志记录
 * 2. 结构化日志输出
 * 3. 上下文信息传递
 * 4. 异步日志处理
 */
export interface ILogger {
  /**
   * @method error
   * @description 记录错误日志
   */
  error(message: string, error?: Error, context?: LogContext): void;

  /**
   * @method warn
   * @description 记录警告日志
   */
  warn(message: string, context?: LogContext): void;

  /**
   * @method info
   * @description 记录信息日志
   */
  info(message: string, context?: LogContext): void;

  /**
   * @method debug
   * @description 记录调试日志
   */
  debug(message: string, context?: LogContext): void;

  /**
   * @method trace
   * @description 记录追踪日志
   */
  trace(message: string, context?: LogContext): void;

  /**
   * @method log
   * @description 通用日志记录
   */
  log(level: LogLevel, message: string, context?: LogContext): void;

  /**
   * @method child
   * @description 创建子日志器
   */
  child(context: LogContext): ILogger;
}
```

---

## 📦 模块配置

### 共享模块

```typescript
// shared.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// 工具类
import { DateUtil } from './utils/date.util';
import { StringUtil } from './utils/string.util';
import { ValidationUtil } from './utils/validation.util';

// 中间件
import { CorrelationIdMiddleware } from './middlewares/correlation-id.middleware';

/**
 * @class SharedModule
 * @description 共享模块
 *
 * 主要原理与机制：
 * 1. 全局模块，可在任何地方使用
 * 2. 提供通用的类型、工具和抽象
 * 3. 不包含任何业务逻辑
 * 4. 支持按需导入和tree-shaking
 *
 * 功能与业务规则：
 * 1. 基础抽象类和接口
 * 2. 通用工具函数
 * 3. 全局中间件和装饰器
 * 4. 配置管理支持
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
  ],
  providers: [
    // 工具类（作为单例服务）
    {
      provide: 'DateUtil',
      useValue: DateUtil,
    },
    {
      provide: 'StringUtil',
      useValue: StringUtil,
    },
    {
      provide: 'ValidationUtil',
      useValue: ValidationUtil,
    },

    // 中间件
    CorrelationIdMiddleware,
  ],
  exports: [
    // 导出工具类
    'DateUtil',
    'StringUtil',
    'ValidationUtil',

    // 导出中间件
    CorrelationIdMiddleware,
  ],
})
export class SharedModule {}

// 主入口文件
// index.ts
// 基础抽象
export * from './base';

// 通用类型
export * from './types';

// 工具函数
export * from './utils';

// 装饰器
export * from './decorators';

// 中间件
export * from './middlewares';

// 异常体系
export * from './exceptions';

// 通用接口
export * from './interfaces';

// 模块
export * from './shared.module';
```

---

## ⚠️ 开发要点

### DO ✅ 最佳实践

1. **保持通用性**: 共享组件必须是领域无关的，可被多个子领域复用
2. **类型安全**: 所有共享类型都要提供完整的TypeScript类型定义
3. **零业务逻辑**: 共享层不能包含任何具体的业务规则或逻辑
4. **文档完善**: 每个公共组件都要有清晰的文档和使用示例
5. **向后兼容**: 共享组件的API变更要考虑向后兼容性
6. **性能优化**: 工具函数要考虑性能，避免不必要的计算和内存分配
7. **错误处理**: 提供一致的错误处理机制和异常层次结构
8. **测试覆盖**: 共享组件要有完整的单元测试覆盖

### DON'T ❌ 反模式

1. **不要包含业务逻辑**: 共享层是技术基础，不应包含业务规则
2. **不要与特定领域耦合**: 避免为特定业务场景定制的组件
3. **不要过度抽象**: 保持简单实用，避免过度工程化
4. **不要忽略性能**: 工具函数可能被大量调用，要注意性能影响
5. **不要破坏不可变性**: 值对象必须保持不可变特性
6. **不要忽略线程安全**: 在多线程环境下要考虑并发安全
7. **不要硬编码配置**: 使用配置管理而非硬编码常量
8. **不要忽略国际化**: 错误消息要支持多语言

---

## 🧪 测试指南

### 基础抽象测试

```typescript
// tests/base/entity.base.spec.ts
describe('BaseEntity', () => {
  class TestEntity extends BaseEntity {
    constructor(id?: Uuid) {
      super(id);
    }
  }

  describe('constructor', () => {
    it('should generate ID if not provided', () => {
      const entity = new TestEntity();
      expect(entity.id).toBeDefined();
      expect(entity.id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should use provided ID', () => {
      const id = Uuid.generate();
      const entity = new TestEntity(id);
      expect(entity.id).toBe(id);
    });
  });

  describe('equals', () => {
    it('should return true for entities with same ID', () => {
      const id = Uuid.generate();
      const entity1 = new TestEntity(id);
      const entity2 = new TestEntity(id);

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false for entities with different IDs', () => {
      const entity1 = new TestEntity();
      const entity2 = new TestEntity();

      expect(entity1.equals(entity2)).toBe(false);
    });
  });
});
```

### 工具函数测试

```typescript
// tests/utils/string.util.spec.ts
describe('StringUtil', () => {
  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(StringUtil.isEmpty('')).toBe(true);
      expect(StringUtil.isEmpty('   ')).toBe(true);
      expect(StringUtil.isEmpty(null)).toBe(true);
      expect(StringUtil.isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(StringUtil.isEmpty('hello')).toBe(false);
      expect(StringUtil.isEmpty(' hello ')).toBe(false);
    });
  });

  describe('mask', () => {
    it('should mask sensitive information correctly', () => {
      const input = '1234567890';
      const result = StringUtil.mask(input, 3, 3);
      expect(result).toBe('123****890');
    });

    it('should handle short strings', () => {
      const input = '123';
      const result = StringUtil.mask(input, 3, 3);
      expect(result).toBe('***');
    });
  });
});
```

### 值对象测试

```typescript
// tests/types/uuid.type.spec.ts
describe('Uuid', () => {
  describe('generate', () => {
    it('should generate valid UUID', () => {
      const uuid = Uuid.generate();
      expect(uuid.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = Uuid.generate();
      const uuid2 = Uuid.generate();
      expect(uuid1.equals(uuid2)).toBe(false);
    });
  });

  describe('fromString', () => {
    it('should create UUID from valid string', () => {
      const uuidString = '550e8400-e29b-41d4-a716-446655440000';
      const uuid = Uuid.fromString(uuidString);
      expect(uuid.value).toBe(uuidString);
    });

    it('should throw error for invalid string', () => {
      expect(() => Uuid.fromString('invalid')).toThrow('无效的UUID格式');
    });
  });
});
```

---

## 📚 参考资料

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Value Object Pattern](https://martinfowler.com/bliki/ValueObject.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)

---

## 🎯 总结

共享层是混合架构的**通用基础**，遵循以下关键原则：

### 核心理念

1. **通用复用**: 提供跨领域可复用的基础组件
2. **类型安全**: 完整的TypeScript类型定义和约束
3. **架构一致**: 统一的抽象和接口定义
4. **零业务逻辑**: 保持技术中性，不包含业务规则

### 设计模式

1. **基础抽象**: Entity、ValueObject、AggregateRoot等DDD抽象
2. **工厂模式**: 对象创建和初始化
3. **策略模式**: 可配置的行为和算法
4. **装饰器模式**: 横切关注点处理
5. **模板方法**: 通用流程和钩子

### 实施策略

1. 先定义基础抽象和通用类型
2. 再实现工具函数和装饰器
3. 然后完善异常体系和接口
4. 最后集成测试和文档

### 架构价值

1. **开发效率**: 减少重复代码，提供开箱即用的工具
2. **代码质量**: 统一的标准和最佳实践
3. **类型安全**: 编译时错误检查和IDE支持
4. **可维护性**: 集中管理通用功能，便于维护和升级

这样的共享层设计能够为整个混合架构提供坚实的基础支撑，确保代码的一致性、可复用性和可维护性！
