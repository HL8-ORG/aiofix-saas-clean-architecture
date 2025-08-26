# 混合架构基础设施层开发指南

## MikroORM多数据库适配 + 实体映射设计

## 📋 文档信息

- **文档类型**: 混合架构基础设施层开发指南
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 正式版
- **目标读者**: 开发团队
- **架构愿景**: 数据库无关、可扩展、高性能

---

## 🎯 基础设施层核心原则

### 混合架构中的基础设施层职责

基础设施层是混合架构的**技术支撑**，承载着以下关键职责：

- **数据持久化**: 实现领域仓储接口，提供数据存储能力
- **多数据库适配**: 支持PostgreSQL、MongoDB等多种数据库
- **实体映射**: 领域实体与数据库实体的双向映射
- **事件存储**: 实现事件溯源的事件存储机制
- **外部集成**: 与外部系统和服务的集成

### 🚨 基础设施层隔离原则

**基础设施层必须严格隔离技术实现，不能污染领域层：**

#### ✅ 基础设施层职责

- **ORM配置**: MikroORM实体定义和数据库配置
- **仓储实现**: 实现领域层定义的仓储接口
- **数据库迁移**: 数据库Schema管理和版本控制
- **缓存实现**: Redis、内存缓存等缓存策略
- **消息队列**: 事件发布和订阅的技术实现

#### ❌ 禁止的耦合

- **不能**让领域层依赖基础设施层
- **不能**在领域实体中包含ORM注解
- **不能**让业务逻辑依赖具体的数据库实现
- **不能**在基础设施层写业务规则

### 架构分层中的位置

```
展现层 (Presentation) ← RESTful API
    ↓
应用层 (Application) ← Use-Case 业务编排
    ↓
领域层 (Domain) ← 业务核心（纯净）
    ↓
>>>>>>>>>> 基础设施层 (Infrastructure) ← 技术实现 <<<<<<<<<<
    ↓
数据库 (Database) ← PostgreSQL / MongoDB
```

### 基础设施层组件关系

```
仓储实现 (Repository Impl)
    ↓ 使用
ORM实体 (ORM Entity) + 映射器 (Mapper)
    ↓ 映射到
领域实体 (Domain Entity)
    ↓ 通过接口
领域仓储 (Domain Repository Interface)
    ↓ 注入到
应用层 (Application Layer)
```

---

## 📁 基础设施层目录结构

```
libs/infrastructure/
├── database/                    # 数据库相关
│   ├── src/
│   │   ├── config/             # 数据库配置
│   │   │   ├── mikro-orm.config.ts
│   │   │   ├── postgres.config.ts
│   │   │   └── mongodb.config.ts
│   │   ├── entities/           # ORM实体
│   │   │   ├── {subdomain}/
│   │   │   │   ├── {entity}.orm-entity.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── repositories/       # 仓储实现
│   │   │   ├── {subdomain}/
│   │   │   │   ├── {entity}.repository.impl.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── mappers/           # 实体映射器
│   │   │   ├── {subdomain}/
│   │   │   │   ├── {entity}.mapper.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── migrations/        # 数据库迁移
│   │   │   ├── postgres/
│   │   │   └── mongodb/
│   │   ├── seeders/          # 数据种子
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── cache/                      # 缓存实现
├── messaging/                  # 消息队列
├── logging/                    # 日志实现
└── index.ts
```

---

## 🗄️ MikroORM多数据库配置

### 数据库类型枚举

```typescript
// config/database-type.enum.ts
/**
 * @enum DatabaseType
 * @description 支持的数据库类型
 */
export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
}

/**
 * @interface DatabaseConfig
 * @description 数据库配置接口
 */
export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  // MongoDB特有配置
  authSource?: string;
  replicaSet?: string;
  // PostgreSQL特有配置
  schema?: string;
  ssl?: boolean;
}
```

### MikroORM基础配置

```typescript
// config/mikro-orm.config.ts
import { MikroORM, Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { MongoDriver } from '@mikro-orm/mongodb';
import { ConfigService } from '@nestjs/config';
import { DatabaseType } from './database-type.enum';

/**
 * @class MikroOrmConfigFactory
 * @description MikroORM配置工厂
 *
 * 主要原理与机制：
 * 1. 根据环境变量动态选择数据库类型
 * 2. 提供统一的配置接口，支持多数据库
 * 3. 自动加载对应的实体和迁移文件
 * 4. 支持开发和生产环境的不同配置
 *
 * 功能与业务规则：
 * 1. 支持PostgreSQL和MongoDB切换
 * 2. 环境感知的配置管理
 * 3. 实体自动发现和加载
 * 4. 迁移和种子数据管理
 */
export class MikroOrmConfigFactory {
  static async createConfig(configService: ConfigService): Promise<Options> {
    const databaseType = configService.get<DatabaseType>(
      'DATABASE_TYPE',
      DatabaseType.POSTGRESQL,
    );

    const baseConfig: Partial<Options> = {
      // 通用配置
      debug: configService.get('NODE_ENV') === 'development',
      allowGlobalContext: true,
      forceEntityConstructor: true,

      // 实体发现
      entities: [
        './dist/libs/infrastructure/database/entities/**/*.orm-entity.js',
      ],
      entitiesTs: [
        './libs/infrastructure/database/entities/**/*.orm-entity.ts',
      ],

      // 迁移配置
      migrations: {
        path: `./libs/infrastructure/database/migrations/${databaseType}`,
        glob: '!(*.d).{js,ts}',
        transactional: true,
        allOrNothing: true,
      },

      // 种子数据
      seeder: {
        path: './libs/infrastructure/database/seeders',
        glob: '!(*.d).{js,ts}',
      },
    };

    // 根据数据库类型选择配置
    switch (databaseType) {
      case DatabaseType.POSTGRESQL:
        return {
          ...baseConfig,
          ...(await this.createPostgreSQLConfig(configService)),
        };

      case DatabaseType.MONGODB:
        return {
          ...baseConfig,
          ...(await this.createMongoDBConfig(configService)),
        };

      default:
        throw new Error(`不支持的数据库类型: ${databaseType}`);
    }
  }

  private static async createPostgreSQLConfig(
    configService: ConfigService,
  ): Promise<Partial<Options>> {
    return {
      driver: PostgreSqlDriver,
      host: configService.get('DB_HOST', 'localhost'),
      port: configService.get('DB_PORT', 5432),
      user: configService.get('DB_USERNAME', 'postgres'),
      password: configService.get('DB_PASSWORD', ''),
      dbName: configService.get('DB_DATABASE', 'aiofix_iam'),
      schema: configService.get('DB_SCHEMA', 'public'),

      // PostgreSQL特有配置
      driverOptions: {
        connection: {
          ssl: configService.get('DB_SSL', false),
        },
      },

      // 连接池配置
      pool: {
        min: configService.get('DB_POOL_MIN', 2),
        max: configService.get('DB_POOL_MAX', 10),
      },
    };
  }

  private static async createMongoDBConfig(
    configService: ConfigService,
  ): Promise<Partial<Options>> {
    return {
      driver: MongoDriver,
      host: configService.get('DB_HOST', 'localhost'),
      port: configService.get('DB_PORT', 27017),
      user: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      dbName: configService.get('DB_DATABASE', 'aiofix_iam'),

      // MongoDB特有配置
      authSource: configService.get('DB_AUTH_SOURCE', 'admin'),
      replicaSet: configService.get('DB_REPLICA_SET'),

      // MongoDB连接选项
      driverOptions: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        maxPoolSize: configService.get('DB_POOL_MAX', 10),
        minPoolSize: configService.get('DB_POOL_MIN', 2),
      },
    };
  }
}
```

### 环境配置文件

```typescript
// config/postgres.config.ts
/**
 * @function createPostgreSQLConfig
 * @description PostgreSQL专用配置
 */
export const createPostgreSQLConfig = () => ({
  // 基础连接配置
  DATABASE_TYPE: 'postgresql',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 5432,
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE || 'aiofix_iam',
  DB_SCHEMA: process.env.DB_SCHEMA || 'public',

  // SSL配置
  DB_SSL: process.env.DB_SSL === 'true',

  // 连接池配置
  DB_POOL_MIN: parseInt(process.env.DB_POOL_MIN) || 2,
  DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX) || 10,

  // 查询优化
  DB_QUERY_TIMEOUT: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
  DB_STATEMENT_TIMEOUT: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 60000,
});

// config/mongodb.config.ts
/**
 * @function createMongoDBConfig
 * @description MongoDB专用配置
 */
export const createMongoDBConfig = () => ({
  // 基础连接配置
  DATABASE_TYPE: 'mongodb',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 27017,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE || 'aiofix_iam',

  // MongoDB特有配置
  DB_AUTH_SOURCE: process.env.DB_AUTH_SOURCE || 'admin',
  DB_REPLICA_SET: process.env.DB_REPLICA_SET,

  // 连接池配置
  DB_POOL_MIN: parseInt(process.env.DB_POOL_MIN) || 2,
  DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX) || 10,

  // 查询优化
  DB_QUERY_TIMEOUT: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
  DB_MAX_TIME_MS: parseInt(process.env.DB_MAX_TIME_MS) || 60000,
});
```

---

## 🏗️ ORM实体定义

### PostgreSQL实体定义

```typescript
// entities/user/user.orm-entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  Index,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { v4 } from 'uuid';

/**
 * @enum UserStatus
 * @description 用户状态枚举（数据库层）
 */
export enum UserStatusOrm {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  LOCKED = 'locked',
  DISABLED = 'disabled',
}

/**
 * @class UserOrmEntity
 * @description 用户ORM实体（PostgreSQL）
 *
 * 主要原理与机制：
 * 1. 使用MikroORM装饰器定义数据库映射
 * 2. 专门用于数据持久化，不包含业务逻辑
 * 3. 与领域实体完全分离，通过Mapper转换
 * 4. 支持数据库特定的优化和索引
 *
 * 功能与业务规则：
 * 1. 用户数据的数据库存储结构
 * 2. 数据库索引和约束定义
 * 3. 自动时间戳管理
 * 4. 软删除支持
 */
@Entity({ tableName: 'users' })
@Index({ properties: ['tenantId', 'username'] })
@Index({ properties: ['tenantId', 'email'] })
@Index({ properties: ['organizationId'] })
@Index({ properties: ['status'] })
export class UserOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ length: 50 })
  @Index()
  username!: string;

  @Property({ length: 254 })
  @Index()
  email!: string;

  @Enum(() => UserStatusOrm)
  status!: UserStatusOrm;

  // 用户档案信息（JSON存储）
  @Property({ type: 'json', nullable: true })
  profile?: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    department?: string;
    title?: string;
  };

  // 组织关系
  @Property({ type: 'uuid' })
  @Index()
  organizationId!: string;

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  // 部门关系（数组存储）
  @Property({ type: 'json', default: '[]' })
  departmentIds!: string[];

  // 角色关系（数组存储）
  @Property({ type: 'json', default: '[]' })
  roleIds!: string[];

  // 登录相关
  @Property({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Property({ type: 'int', default: 0 })
  failedLoginAttempts!: number;

  // 用户设置（JSON存储）
  @Property({ type: 'json', default: '{}' })
  settings!: Record<string, any>;

  // 元数据（JSON存储）
  @Property({ type: 'json', default: '{}' })
  metadata!: Record<string, unknown>;

  // 审计字段
  @Property({ type: 'timestamptz' })
  createdAt!: Date;

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Property({ type: 'int', default: 1 })
  version!: number;

  // 生命周期钩子
  @BeforeCreate()
  beforeCreate() {
    this.id = v4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = 1;
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
    this.version += 1;
  }
}
```

### MongoDB实体定义

```typescript
// entities/user/user.mongodb-entity.ts
import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  Index,
  SerializedPrimaryKey,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

/**
 * @class UserMongoEntity
 * @description 用户MongoDB实体
 *
 * 主要原理与机制：
 * 1. 使用MongoDB特有的ObjectId作为主键
 * 2. 充分利用MongoDB的文档存储优势
 * 3. 嵌套文档结构，减少JOIN查询
 * 4. 支持MongoDB特有的索引和查询优化
 *
 * 功能与业务规则：
 * 1. 文档化的用户数据存储
 * 2. 嵌套的档案和设置信息
 * 3. 数组字段的高效存储
 * 4. MongoDB索引优化
 */
@Entity({ collection: 'users' })
@Index({ properties: ['tenantId', 'username'] })
@Index({ properties: ['tenantId', 'email'] })
@Index({ properties: ['organizationId'] })
@Index({ properties: ['status'] })
export class UserMongoEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string; // ObjectId转换为字符串

  @Property({ length: 50 })
  @Index()
  username!: string;

  @Property({ length: 254 })
  @Index()
  email!: string;

  @Enum(() => UserStatusOrm)
  status!: UserStatusOrm;

  // 嵌套文档：用户档案
  @Property({ type: 'object', nullable: true })
  profile?: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    department?: string;
    title?: string;
  };

  // 组织关系
  @Property()
  @Index()
  organizationId!: string;

  @Property()
  @Index()
  tenantId!: string;

  // 数组字段
  @Property({ type: 'array', default: [] })
  departmentIds!: string[];

  @Property({ type: 'array', default: [] })
  roleIds!: string[];

  // 嵌套文档：登录信息
  @Property({ type: 'object', default: {} })
  loginInfo!: {
    lastLoginAt?: Date;
    failedLoginAttempts: number;
    loginHistory?: Array<{
      loginAt: Date;
      ipAddress?: string;
      userAgent?: string;
    }>;
  };

  // 嵌套文档：用户设置
  @Property({ type: 'object', default: {} })
  settings!: Record<string, any>;

  // 嵌套文档：元数据
  @Property({ type: 'object', default: {} })
  metadata!: Record<string, unknown>;

  // 审计字段
  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ nullable: true })
  deletedAt?: Date;

  @Property({ default: 1 })
  version!: number;

  // 生命周期钩子
  @BeforeCreate()
  beforeCreate() {
    this._id = new ObjectId();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = 1;
    this.loginInfo = { failedLoginAttempts: 0 };
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
    this.version += 1;
  }
}
```

### 数据库适配器工厂

```typescript
// entities/user/user-entity.factory.ts
import { DatabaseType } from '../../config/database-type.enum';
import { UserOrmEntity } from './user.orm-entity';
import { UserMongoEntity } from './user.mongodb-entity';

/**
 * @type UserDatabaseEntity
 * @description 用户数据库实体联合类型
 */
export type UserDatabaseEntity = UserOrmEntity | UserMongoEntity;

/**
 * @class UserEntityFactory
 * @description 用户实体工厂
 *
 * 主要原理与机制：
 * 1. 根据数据库类型返回对应的实体类
 * 2. 提供统一的实体创建接口
 * 3. 支持运行时数据库类型切换
 * 4. 类型安全的实体选择
 *
 * 功能与业务规则：
 * 1. 动态选择数据库实体类型
 * 2. 统一的实体工厂接口
 * 3. 类型推断和安全性
 */
export class UserEntityFactory {
  static getEntityClass(
    databaseType: DatabaseType,
  ): typeof UserOrmEntity | typeof UserMongoEntity {
    switch (databaseType) {
      case DatabaseType.POSTGRESQL:
        return UserOrmEntity;
      case DatabaseType.MONGODB:
        return UserMongoEntity;
      default:
        throw new Error(`不支持的数据库类型: ${databaseType}`);
    }
  }

  static isPostgreSQLEntity(
    entity: UserDatabaseEntity,
  ): entity is UserOrmEntity {
    return entity instanceof UserOrmEntity;
  }

  static isMongoDBEntity(
    entity: UserDatabaseEntity,
  ): entity is UserMongoEntity {
    return entity instanceof UserMongoEntity;
  }
}
```

## 🔄 实体映射器

### 映射器基类

```typescript
// mappers/base.mapper.ts
import { Uuid } from '@aiofix/domain-shared';

/**
 * @abstract BaseMapper
 * @description 映射器基类
 *
 * 主要原理与机制：
 * 1. 定义领域实体与数据库实体双向转换的契约
 * 2. 提供通用的映射逻辑和错误处理
 * 3. 支持不同数据库类型的统一映射接口
 * 4. 确保数据类型安全和完整性
 *
 * 功能与业务规则：
 * 1. 双向映射（Domain ↔ Database）
 * 2. 类型安全的转换
 * 3. 空值和异常处理
 * 4. 可扩展的映射机制
 */
export abstract class BaseMapper<DomainEntity, DatabaseEntity> {
  /**
   * @method toDomain
   * @description 数据库实体转换为领域实体
   */
  abstract toDomain(dbEntity: DatabaseEntity): DomainEntity;

  /**
   * @method toDatabase
   * @description 领域实体转换为数据库实体
   */
  abstract toDatabase(domainEntity: DomainEntity): DatabaseEntity;

  /**
   * @method toDomainList
   * @description 批量转换为领域实体列表
   */
  toDomainList(dbEntities: DatabaseEntity[]): DomainEntity[] {
    return dbEntities.map(entity => this.toDomain(entity));
  }

  /**
   * @method toDatabaseList
   * @description 批量转换为数据库实体列表
   */
  toDatabaseList(domainEntities: DomainEntity[]): DatabaseEntity[] {
    return domainEntities.map(entity => this.toDatabase(entity));
  }

  /**
   * @protected
   * @method mapUuid
   * @description UUID映射辅助方法
   */
  protected mapUuid(id: string | Uuid): string {
    if (typeof id === 'string') {
      return id;
    }
    return id.value;
  }

  /**
   * @protected
   * @method mapToUuid
   * @description 字符串转UUID辅助方法
   */
  protected mapToUuid(id: string): Uuid {
    return Uuid.fromString(id);
  }
}
```

## 🗄️ 仓储实现

### 用户仓储实现

```typescript
// repositories/user/user.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectEntityManager } from '@mikro-orm/nestjs';
import { User } from '../../../domain/iam/src/user/domain/entities/user.entity';
import { UserRepository } from '../../../domain/iam/src/user/domain/repositories/user.repository';
import { UserMapper } from '../mappers/user/user.mapper';
import {
  UserEntityFactory,
  UserDatabaseEntity,
} from '../entities/user/user-entity.factory';
import { ConfigService } from '@nestjs/config';
import { DatabaseType } from '../config/database-type.enum';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @class UserRepositoryImpl
 * @description 用户仓储实现
 *
 * 主要原理与机制：
 * 1. 实现领域层定义的UserRepository接口
 * 2. 使用MikroORM进行数据库操作
 * 3. 通过Mapper实现领域实体与数据库实体的转换
 * 4. 支持多数据库的统一操作接口
 *
 * 功能与业务规则：
 * 1. 实现CRUD基础操作
 * 2. 提供业务查询方法
 * 3. 支持事务操作
 * 4. 处理并发控制和乐观锁
 */
@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly databaseType: DatabaseType;
  private readonly EntityClass: typeof UserDatabaseEntity;

  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly userMapper: UserMapper,
    private readonly configService: ConfigService,
  ) {
    this.databaseType = this.configService.get<DatabaseType>(
      'DATABASE_TYPE',
      DatabaseType.POSTGRESQL,
    );
    this.EntityClass = UserEntityFactory.getEntityClass(
      this.databaseType,
    ) as any;
  }

  /**
   * @method save
   * @description 保存用户聚合
   */
  async save(user: User): Promise<void> {
    // 转换为数据库实体
    const dbEntity = this.userMapper.toDatabase(user);

    // 检查是否为新实体
    const existingEntity = await this.em.findOne(this.EntityClass, {
      id: dbEntity.id,
    } as any);

    if (existingEntity) {
      // 更新现有实体
      this.em.assign(existingEntity, dbEntity);
    } else {
      // 创建新实体
      this.em.persist(dbEntity);
    }

    // 提交到数据库
    await this.em.flush();

    // 清除领域事件（已持久化）
    user.clearDomainEvents();
  }

  /**
   * @method findById
   * @description 根据ID查找用户
   */
  async findById(id: Uuid): Promise<User | null> {
    const dbEntity = await this.em.findOne(this.EntityClass, {
      id: id.value,
      deletedAt: null, // 排除软删除的记录
    } as any);

    if (!dbEntity) {
      return null;
    }

    return this.userMapper.toDomain(dbEntity);
  }

  /**
   * @method findByUsername
   * @description 根据用户名查找用户
   */
  async findByUsername(
    username: string,
    tenantId: string,
  ): Promise<User | null> {
    const dbEntity = await this.em.findOne(this.EntityClass, {
      username,
      tenantId,
      deletedAt: null,
    } as any);

    if (!dbEntity) {
      return null;
    }

    return this.userMapper.toDomain(dbEntity);
  }

  /**
   * @method findByEmail
   * @description 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    const dbEntity = await this.em.findOne(this.EntityClass, {
      email,
      deletedAt: null,
    } as any);

    if (!dbEntity) {
      return null;
    }

    return this.userMapper.toDomain(dbEntity);
  }

  /**
   * @method findByOrganization
   * @description 查找组织下的用户
   */
  async findByOrganization(
    organizationId: Uuid,
    tenantId: string,
  ): Promise<User[]> {
    const dbEntities = await this.em.find(this.EntityClass, {
      organizationId: organizationId.value,
      tenantId,
      deletedAt: null,
    } as any);

    return this.userMapper.toDomainList(dbEntities);
  }

  /**
   * @method findByDepartment
   * @description 查找部门下的用户
   */
  async findByDepartment(
    departmentId: Uuid,
    tenantId: string,
  ): Promise<User[]> {
    // 根据数据库类型使用不同的查询方式
    let dbEntities: UserDatabaseEntity[];

    if (this.databaseType === DatabaseType.POSTGRESQL) {
      // PostgreSQL使用JSON查询
      dbEntities = await this.em.find(this.EntityClass, {
        $and: [
          { tenantId },
          { deletedAt: null },
          { departmentIds: { $contains: [departmentId.value] } },
        ],
      } as any);
    } else {
      // MongoDB使用数组查询
      dbEntities = await this.em.find(this.EntityClass, {
        tenantId,
        deletedAt: null,
        departmentIds: { $in: [departmentId.value] },
      } as any);
    }

    return this.userMapper.toDomainList(dbEntities);
  }

  /**
   * @method findActiveUsers
   * @description 查找活跃用户
   */
  async findActiveUsers(tenantId: string): Promise<User[]> {
    const dbEntities = await this.em.find(this.EntityClass, {
      tenantId,
      status: 'active',
      deletedAt: null,
    } as any);

    return this.userMapper.toDomainList(dbEntities);
  }

  /**
   * @method delete
   * @description 删除用户（软删除）
   */
  async delete(id: Uuid): Promise<void> {
    const dbEntity = await this.em.findOne(this.EntityClass, {
      id: id.value,
    } as any);

    if (!dbEntity) {
      throw new Error(`用户不存在: ${id.value}`);
    }

    // 软删除
    (dbEntity as any).deletedAt = new Date();

    await this.em.flush();
  }

  /**
   * @method exists
   * @description 检查用户是否存在
   */
  async exists(id: Uuid): Promise<boolean> {
    const count = await this.em.count(this.EntityClass, {
      id: id.value,
      deletedAt: null,
    } as any);

    return count > 0;
  }

  /**
   * @method count
   * @description 统计用户数量
   */
  async count(tenantId: string): Promise<number> {
    return this.em.count(this.EntityClass, {
      tenantId,
      deletedAt: null,
    } as any);
  }
}
```

## 🔧 模块配置

### 基础设施层模块

```typescript
// infrastructure/database/database-infrastructure.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroOrmConfigFactory } from './config/mikro-orm.config';
import { UserRepositoryImpl } from './repositories/user/user.repository.impl';
import { UserReadRepositoryImpl } from './repositories/user/user-read.repository.impl';
import { UserMapper } from './mappers/user/user.mapper';
import { MapperFactory } from './mappers/mapper.factory';

/**
 * @class DatabaseInfrastructureModule
 * @description 数据库基础设施模块
 *
 * 主要原理与机制：
 * 1. 配置MikroORM和数据库连接
 * 2. 注册所有仓储实现
 * 3. 提供映射器和工厂类
 * 4. 支持多数据库配置切换
 *
 * 功能与业务规则：
 * 1. 数据库连接配置
 * 2. 实体注册和映射
 * 3. 仓储依赖注入
 * 4. 事务管理配置
 */
@Module({
  imports: [
    ConfigModule,
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return MikroOrmConfigFactory.createConfig(configService);
      },
    }),
  ],
  providers: [
    // 映射器
    UserMapper,
    MapperFactory,

    // 仓储实现
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
    {
      provide: 'UserReadRepository',
      useClass: UserReadRepositoryImpl,
    },
  ],
  exports: ['UserRepository', 'UserReadRepository', UserMapper, MapperFactory],
})
export class DatabaseInfrastructureModule {}
```

### 环境配置切换

```typescript
// 通过环境变量切换
// .env.postgresql
DATABASE_TYPE = postgresql;
DB_HOST = localhost;
DB_PORT = 5432;
DB_USERNAME = postgres;
DB_PASSWORD = password;
DB_DATABASE = aiofix_iam;

// .env.mongodb
DATABASE_TYPE = mongodb;
DB_HOST = localhost;
DB_PORT = 27017;
DB_USERNAME = admin;
DB_PASSWORD = password;
DB_DATABASE = aiofix_iam;
DB_AUTH_SOURCE = admin;

// 通过代码切换
const databaseType =
  process.env.NODE_ENV === 'production'
    ? DatabaseType.POSTGRESQL
    : DatabaseType.MONGODB;
```

---

## ⚠️ 开发要点

### DO ✅ 最佳实践

1. **严格分离关注点**: 领域实体与ORM实体完全分离
2. **使用映射器**: 通过专门的Mapper实现双向转换
3. **支持多数据库**: 设计时考虑不同数据库的特性
4. **依赖倒置**: 基础设施层实现领域层定义的接口
5. **配置驱动**: 通过配置文件动态切换数据库
6. **事务管理**: 在应用层使用`@Transactional()`装饰器
7. **软删除**: 使用软删除而非物理删除
8. **索引优化**: 根据查询模式设计合适的索引

### DON'T ❌ 反模式

1. **不要在领域层使用ORM注解**: 保持领域层纯净
2. **不要直接操作数据库**: 必须通过仓储接口
3. **不要忽略映射**: 确保领域概念与数据库概念的正确转换
4. **不要硬编码数据库类型**: 使用配置或工厂模式
5. **不要在基础设施层写业务逻辑**: 只负责技术实现
6. **不要忽略并发控制**: 使用乐观锁或悲观锁
7. **不要忽略事务边界**: 确保数据一致性
8. **不要忽略性能优化**: 合理使用缓存和索引

---

## 🎯 总结

基础设施层是混合架构的**技术支撑**，遵循以下关键原则：

### 核心理念

1. **技术隔离**: 基础设施层隔离所有技术细节
2. **多数据库支持**: 通过MikroORM支持PostgreSQL和MongoDB
3. **映射转换**: 领域实体与数据库实体的双向映射
4. **配置驱动**: 通过配置实现数据库类型的动态切换
5. **依赖倒置**: 实现领域层定义的仓储接口

### 设计模式

1. **仓储模式**: 封装数据访问逻辑
2. **映射器模式**: 处理实体间的转换
3. **工厂模式**: 根据配置创建合适的实体类
4. **适配器模式**: 适配不同数据库的差异
5. **配置模式**: 环境感知的配置管理

### 实施策略

1. 先定义数据库配置和实体
2. 再实现映射器和仓储
3. 然后集成到应用层模块
4. 最后进行性能优化和测试

### 技术特色

1. **MikroORM统一接口**: 使用MikroORM提供统一的数据库操作接口
2. **类型安全**: TypeScript确保编译时类型检查
3. **实体分离**: 领域实体与ORM实体完全分离
4. **配置切换**: 支持运行时数据库类型切换
5. **性能优化**: 针对不同数据库的查询优化

这样的基础设施层设计能够充分隔离技术复杂性，为上层提供稳定的数据访问能力，同时保持对不同数据库技术的开放性和扩展性。

---
