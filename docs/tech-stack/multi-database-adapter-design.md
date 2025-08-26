# 多数据库适配设计文档

## 📋 文档信息

- **文档类型**: 多数据库适配和ORM配置设计文档
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 设计版
- **目标读者**: 架构师、开发团队、数据库管理员、运维工程师

---

## 🎯 设计目标

### 架构愿景

构建一个支持多数据库的灵活架构，以PostgreSQL作为默认数据库，预留MongoDB扩展能力，通过MikroORM实现统一的ORM层，确保系统的可扩展性和技术选型的灵活性。

### 设计原则

1. **数据库无关性**: 业务逻辑与具体数据库实现解耦
2. **统一ORM**: 使用MikroORM作为统一的ORM框架
3. **默认优先**: PostgreSQL作为默认和推荐数据库
4. **扩展友好**: 预留其他数据库的扩展能力
5. **性能优化**: 针对不同数据库进行性能优化
6. **迁移便利**: 支持数据库间的数据迁移

### 技术目标

- 支持PostgreSQL作为默认数据库
- 预留MongoDB扩展能力
- 使用MikroORM实现统一ORM层
- 支持数据库间的数据迁移
- 提供数据库性能监控和优化
- 确保数据一致性和事务支持

---

## 🏗️ 架构概览

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application Layer)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  业务逻辑   │ │  数据访问   │ │  事务管理   │            │
│  │ (Business)  │ │ (Data Access)│ │ (Transaction)│           │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                    ORM层 (ORM Layer)                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    MikroORM                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │ │
│  │  │  实体管理   │ │  查询构建   │ │  关系映射   │        │ │
│  │  │ (Entities)  │ │ (Query Builder)│ (Relations) │        │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │ │
│  │  │  迁移管理   │ │  连接池     │ │  缓存管理   │        │ │
│  │  │ (Migrations)│ │ (Connection)│ │ (Caching)   │        │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  数据库适配层 (Database Adapter Layer)       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ PostgreSQL  │ │   MongoDB   │ │  其他数据库 │            │
│  │  适配器     │ │   适配器    │ │   适配器    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                  数据库层 (Database Layer)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ PostgreSQL  │ │   MongoDB   │ │  其他数据库 │            │
│  │  数据库     │ │   数据库    │ │   数据库    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 数据流架构

```
业务请求 → 应用层 → ORM层 → 数据库适配层 → 数据库
    ↓         ↓        ↓         ↓         ↓
业务逻辑   数据访问   查询构建   适配转换   数据存储
    ↓         ↓        ↓         ↓         ↓
业务响应   数据返回   结果映射   适配转换   数据返回
```

### 核心组件关系

```
应用服务 (Application Service)
    ↓
仓储接口 (Repository Interface)
    ↓
MikroORM (ORM Framework)
    ↓
数据库适配器 (Database Adapter)
    ↓
数据库 (Database)
```

---

## 🔧 技术选型

### 1. **ORM框架选择**

#### MikroORM优势

- **TypeScript优先**: 原生TypeScript支持，类型安全
- **多数据库支持**: 支持PostgreSQL、MySQL、SQLite、MongoDB等
- **实体管理**: 强大的实体管理和关系映射
- **迁移支持**: 内置数据库迁移工具
- **查询构建**: 灵活的查询构建器
- **性能优化**: 连接池、缓存、懒加载等优化
- **事务支持**: 完善的事务管理
- **活跃社区**: 活跃的开发和社区支持

#### 与其他ORM对比

| 特性           | MikroORM | TypeORM | Prisma      | Sequelize |
| -------------- | -------- | ------- | ----------- | --------- |
| TypeScript支持 | ✅ 原生  | ✅ 良好 | ✅ 优秀     | ⚠️ 一般   |
| 多数据库支持   | ✅ 优秀  | ✅ 良好 | ✅ 优秀     | ✅ 优秀   |
| 实体管理       | ✅ 优秀  | ✅ 良好 | ✅ 优秀     | ⚠️ 一般   |
| 迁移工具       | ✅ 内置  | ✅ 内置 | ✅ 优秀     | ✅ 良好   |
| 查询构建       | ✅ 灵活  | ✅ 灵活 | ✅ 优秀     | ✅ 灵活   |
| 性能优化       | ✅ 优秀  | ✅ 良好 | ✅ 优秀     | ✅ 良好   |
| 社区活跃度     | ✅ 活跃  | ✅ 活跃 | ✅ 非常活跃 | ✅ 活跃   |

### 2. **数据库选择**

#### PostgreSQL作为默认数据库

- **ACID支持**: 完整的事务支持
- **复杂查询**: 强大的SQL查询能力
- **JSON支持**: 原生JSON数据类型支持
- **扩展性**: 丰富的扩展和插件
- **性能**: 优秀的读写性能
- **可靠性**: 高可用性和数据完整性
- **生态系统**: 丰富的工具和社区支持

#### MongoDB作为扩展选项

- **文档存储**: 灵活的文档数据模型
- **水平扩展**: 优秀的水平扩展能力
- **查询性能**: 高效的查询性能
- **JSON原生**: 原生JSON数据支持
- **聚合管道**: 强大的聚合查询能力
- **地理空间**: 优秀的地理空间查询
- **大数据**: 适合大数据场景

---

## 🔧 实现方案

### 1. **数据库适配策略**

#### 统一接口设计

- **仓储模式**: 通过仓储接口抽象数据访问
- **适配器模式**: 为不同数据库提供适配器
- **工厂模式**: 根据配置创建对应的数据库连接
- **策略模式**: 根据业务需求选择数据库策略

#### 数据模型设计

- **关系型模型**: PostgreSQL使用关系型数据模型
- **文档模型**: MongoDB使用文档数据模型
- **混合模型**: 支持关系型和文档型混合使用
- **迁移策略**: 支持数据模型间的转换和迁移

### 2. **技术栈配置**

#### 核心依赖

```json
{
  "dependencies": {
    "@mikro-orm/core": "^5.9.0",
    "@mikro-orm/postgresql": "^5.9.0",
    "@mikro-orm/mongodb": "^5.9.0",
    "@mikro-orm/migrations": "^5.9.0",
    "@mikro-orm/seeder": "^5.9.0",
    "@mikro-orm/cli": "^5.9.0",
    "pg": "^8.11.0",
    "mongodb": "^6.0.0",
    "redis": "^4.6.0",
    "dotenv": "^16.3.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/pg": "^8.10.0",
    "@types/lodash": "^4.14.0"
  }
}
```

#### 配置文件结构

```
config/
├── database/
│   ├── postgresql.config.ts
│   ├── mongodb.config.ts
│   ├── redis.config.ts
│   └── database.config.ts
├── mikroorm/
│   ├── postgresql.mikroorm.config.ts
│   ├── mongodb.mikroorm.config.ts
│   └── mikroorm.config.ts
└── environment/
    ├── development.config.ts
    ├── testing.config.ts
    ├── staging.config.ts
    └── production.config.ts
```

#### 环境变量配置

```env
# 数据库类型选择
DATABASE_TYPE=postgresql

# PostgreSQL配置
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=saas_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/saas_platform
MONGODB_DB=saas_platform

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# 连接池配置
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
```

### 3. **MikroORM配置**

#### PostgreSQL配置

```typescript
// config/mikroorm/postgresql.mikroorm.config.ts
import { defineConfig } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export const postgresqlConfig = defineConfig({
  type: 'postgresql',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  dbName: process.env.POSTGRES_DB || 'saas_platform',

  // 实体配置
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  // 迁移配置
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },

  // 种子配置
  seeder: {
    path: 'dist/seeders',
    pathTs: 'src/seeders',
  },

  // 调试配置
  debug: process.env.NODE_ENV === 'development',
  highlighter: new SqlHighlighter(),

  // 连接池配置
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE || '10000'),
  },

  // 缓存配置
  cache: {
    enabled: true,
    pretty: process.env.NODE_ENV === 'development',
  },
});
```

#### MongoDB配置

```typescript
// config/mikroorm/mongodb.mikroorm.config.ts
import { defineConfig } from '@mikro-orm/mongodb';

export const mongodbConfig = defineConfig({
  type: 'mongo',
  clientUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: process.env.MONGODB_DB || 'saas_platform',

  // 实体配置
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  // 迁移配置
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },

  // 种子配置
  seeder: {
    path: 'dist/seeders',
    pathTs: 'src/seeders',
  },

  // 调试配置
  debug: process.env.NODE_ENV === 'development',

  // 连接池配置
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    max: parseInt(process.env.DB_POOL_MAX || '20'),
  },

  // 缓存配置
  cache: {
    enabled: true,
    pretty: process.env.NODE_ENV === 'development',
  },
});
```

#### 统一配置

```typescript
// config/mikroorm/mikroorm.config.ts
import { postgresqlConfig } from './postgresql.mikroorm.config';
import { mongodbConfig } from './mongodb.mikroorm.config';

const databaseType = process.env.DATABASE_TYPE || 'postgresql';

export const mikroormConfig =
  databaseType === 'mongodb' ? mongodbConfig : postgresqlConfig;

export default mikroormConfig;
```

### 4. **数据库适配器设计**

#### 数据库适配器接口

```typescript
// libs/shared/infrastructure/database/database-adapter.interface.ts
export interface IDatabaseAdapter {
  // 连接管理
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // 事务管理
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;

  // 查询执行
  executeQuery(query: string, params?: any[]): Promise<any>;
  executeCommand(command: string, params?: any[]): Promise<any>;

  // 连接池管理
  getConnection(): Promise<any>;
  releaseConnection(connection: any): Promise<void>;

  // 健康检查
  healthCheck(): Promise<boolean>;
}
```

#### PostgreSQL适配器

```typescript
// libs/infrastructure/database/postgresql/postgresql.adapter.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IDatabaseAdapter } from '@shared/infrastructure/database/database-adapter.interface';

@Injectable()
export class PostgreSQLAdapter implements IDatabaseAdapter {
  private isConnectedFlag = false;
  private transactionActive = false;

  constructor(private readonly em: EntityManager) {}

  async connect(): Promise<void> {
    try {
      await this.em.getConnection().connect();
      this.isConnectedFlag = true;
    } catch (error) {
      throw new Error(`PostgreSQL连接失败: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.em.getConnection().close();
      this.isConnectedFlag = false;
    } catch (error) {
      throw new Error(`PostgreSQL断开连接失败: ${error.message}`);
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  async beginTransaction(): Promise<void> {
    if (this.transactionActive) {
      throw new Error('事务已在进行中');
    }
    await this.em.begin();
    this.transactionActive = true;
  }

  async commitTransaction(): Promise<void> {
    if (!this.transactionActive) {
      throw new Error('没有活跃的事务');
    }
    await this.em.commit();
    this.transactionActive = false;
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.transactionActive) {
      throw new Error('没有活跃的事务');
    }
    await this.em.rollback();
    this.transactionActive = false;
  }

  async executeQuery(query: string, params?: any[]): Promise<any> {
    try {
      const result = await this.em.getConnection().execute(query, params);
      return result;
    } catch (error) {
      throw new Error(`PostgreSQL查询执行失败: ${error.message}`);
    }
  }

  async executeCommand(command: string, params?: any[]): Promise<any> {
    try {
      const result = await this.em.getConnection().execute(command, params);
      return result;
    } catch (error) {
      throw new Error(`PostgreSQL命令执行失败: ${error.message}`);
    }
  }

  async getConnection(): Promise<any> {
    return this.em.getConnection();
  }

  async releaseConnection(connection: any): Promise<void> {
    // MikroORM自动管理连接，无需手动释放
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.em.getConnection().execute('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

#### MongoDB适配器

```typescript
// libs/infrastructure/database/mongodb/mongodb.adapter.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mongodb';
import { IDatabaseAdapter } from '@shared/infrastructure/database/database-adapter.interface';

@Injectable()
export class MongoDBAdapter implements IDatabaseAdapter {
  private isConnectedFlag = false;
  private transactionActive = false;

  constructor(private readonly em: EntityManager) {}

  async connect(): Promise<void> {
    try {
      await this.em.getConnection().connect();
      this.isConnectedFlag = true;
    } catch (error) {
      throw new Error(`MongoDB连接失败: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.em.getConnection().close();
      this.isConnectedFlag = false;
    } catch (error) {
      throw new Error(`MongoDB断开连接失败: ${error.message}`);
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  async beginTransaction(): Promise<void> {
    if (this.transactionActive) {
      throw new Error('事务已在进行中');
    }
    await this.em.begin();
    this.transactionActive = true;
  }

  async commitTransaction(): Promise<void> {
    if (!this.transactionActive) {
      throw new Error('没有活跃的事务');
    }
    await this.em.commit();
    this.transactionActive = false;
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.transactionActive) {
      throw new Error('没有活跃的事务');
    }
    await this.em.rollback();
    this.transactionActive = false;
  }

  async executeQuery(query: string, params?: any[]): Promise<any> {
    try {
      // MongoDB查询转换为聚合管道
      const pipeline = this.parseQueryToPipeline(query, params);
      const result = await this.em
        .getConnection()
        .collection('collection')
        .aggregate(pipeline)
        .toArray();
      return result;
    } catch (error) {
      throw new Error(`MongoDB查询执行失败: ${error.message}`);
    }
  }

  async executeCommand(command: string, params?: any[]): Promise<any> {
    try {
      // MongoDB命令执行
      const result = await this.em
        .getConnection()
        .db()
        .command(JSON.parse(command));
      return result;
    } catch (error) {
      throw new Error(`MongoDB命令执行失败: ${error.message}`);
    }
  }

  async getConnection(): Promise<any> {
    return this.em.getConnection();
  }

  async releaseConnection(connection: any): Promise<void> {
    // MikroORM自动管理连接，无需手动释放
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.em.getConnection().db().admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  private parseQueryToPipeline(query: string, params?: any[]): any[] {
    // 将SQL查询转换为MongoDB聚合管道
    // 这里需要实现查询解析逻辑
    return [];
  }
}
```

---

## 🏗️ 实体设计

### 1. **PostgreSQL实体设计**

#### 基础实体

```typescript
// libs/shared/domain/entities/base.entity.ts
import {
  PrimaryKey,
  Property,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEntity {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  createdBy?: string;

  @Property({ nullable: true })
  updatedBy?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @BeforeCreate()
  beforeCreate() {
    this.id = uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }
}
```

#### 租户实体示例

```typescript
// libs/domain/iam/tenant/domain/entities/tenant.entity.ts
import { Entity, Property, Index, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@shared/domain/entities/base.entity';

@Entity({ tableName: 'tenants' })
@Index({ properties: ['code'] })
@Unique({ properties: ['code'] })
export class Tenant extends BaseEntity {
  @Property({ length: 100 })
  name: string;

  @Property({ length: 50 })
  code: string;

  @Property({ length: 200, nullable: true })
  description?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @Property({ type: 'timestamp', nullable: true })
  subscriptionExpiresAt?: Date;

  @Property({ default: 0 })
  maxUsers: number = 0;

  @Property({ default: 0 })
  maxStorage: number = 0; // GB

  constructor(name: string, code: string) {
    super();
    this.name = name;
    this.code = code;
  }
}
```

#### 用户实体示例

```typescript
// libs/domain/iam/user/domain/entities/user.entity.ts
import {
  Entity,
  Property,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from '@mikro-orm/core';
import { BaseEntity } from '@shared/domain/entities/base.entity';
import { Tenant } from '../../tenant/domain/entities/tenant.entity';

@Entity({ tableName: 'users' })
@Index({ properties: ['email'] })
@Index({ properties: ['tenantId'] })
@Unique({ properties: ['email', 'tenantId'] })
export class User extends BaseEntity {
  @Property({ length: 100 })
  username: string;

  @Property({ length: 255 })
  email: string;

  @Property({ length: 255, hidden: true })
  password: string;

  @Property({ length: 100, nullable: true })
  firstName?: string;

  @Property({ length: 100, nullable: true })
  lastName?: string;

  @Property({ length: 20, nullable: true })
  phone?: string;

  @Property({ type: 'jsonb', nullable: true })
  profile?: Record<string, any>;

  @Property({ default: false })
  isEmailVerified: boolean = false;

  @Property({ default: false })
  isPhoneVerified: boolean = false;

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Property({ nullable: false })
  tenantId: string;

  constructor(
    username: string,
    email: string,
    password: string,
    tenantId: string,
  ) {
    super();
    this.username = username;
    this.email = email;
    this.password = password;
    this.tenantId = tenantId;
  }
}
```

### 2. **MongoDB实体设计**

#### 基础文档实体

```typescript
// libs/shared/domain/entities/base-document.entity.ts
import {
  PrimaryKey,
  Property,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseDocument {
  @PrimaryKey()
  _id: string = uuidv4();

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  createdBy?: string;

  @Property({ nullable: true })
  updatedBy?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @BeforeCreate()
  beforeCreate() {
    this._id = uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }
}
```

#### 日志文档实体示例

```typescript
// libs/domain/logging/domain/entities/log-document.entity.ts
import { Entity, Property, Index } from '@mikro-orm/core';
import { BaseDocument } from '@shared/domain/entities/base-document.entity';

@Entity({ collection: 'logs' })
@Index({ properties: ['timestamp'] })
@Index({ properties: ['level'] })
@Index({ properties: ['service'] })
@Index({ properties: ['userId'] })
@Index({ properties: ['tenantId'] })
export class LogDocument extends BaseDocument {
  @Property()
  timestamp: Date = new Date();

  @Property({ length: 20 })
  level: string; // 'debug', 'info', 'warn', 'error'

  @Property({ length: 100 })
  service: string;

  @Property({ length: 255 })
  message: string;

  @Property({ type: 'jsonb', nullable: true })
  context?: Record<string, any>;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Property({ nullable: true })
  userId?: string;

  @Property({ nullable: true })
  tenantId?: string;

  @Property({ nullable: true })
  correlationId?: string;

  @Property({ nullable: true })
  requestId?: string;

  @Property({ length: 50, nullable: true })
  ip?: string;

  @Property({ length: 255, nullable: true })
  userAgent?: string;

  constructor(level: string, service: string, message: string) {
    super();
    this.level = level;
    this.service = service;
    this.message = message;
  }
}
```

### 3. **混合实体设计**

#### 支持多数据库的实体

```typescript
// libs/domain/notification/domain/entities/notification.entity.ts
import {
  Entity,
  Property,
  Index,
  ManyToOne,
  JoinColumn,
} from '@mikro-orm/core';
import { BaseEntity } from '@shared/domain/entities/base.entity';
import { User } from '../../iam/user/domain/entities/user.entity';

@Entity({ tableName: 'notifications' })
@Index({ properties: ['userId'] })
@Index({ properties: ['type'] })
@Index({ properties: ['status'] })
@Index({ properties: ['createdAt'] })
export class Notification extends BaseEntity {
  @Property({ length: 50 })
  type: string; // 'email', 'sms', 'push', 'webhook'

  @Property({ length: 20 })
  status: string; // 'pending', 'sent', 'failed', 'delivered'

  @Property({ length: 255 })
  title: string;

  @Property({ type: 'text' })
  content: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Property({ type: 'jsonb', nullable: true })
  recipient?: Record<string, any>;

  @Property({ nullable: true })
  sentAt?: Date;

  @Property({ nullable: true })
  deliveredAt?: Date;

  @Property({ nullable: true })
  failedAt?: Date;

  @Property({ length: 500, nullable: true })
  errorMessage?: string;

  @Property({ default: 0 })
  retryCount: number = 0;

  @Property({ default: 3 })
  maxRetries: number = 3;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Property({ nullable: true })
  userId?: string;

  @Property({ nullable: false })
  tenantId: string;

  constructor(
    type: string,
    title: string,
    content: string,
    tenantId: string,
    userId?: string,
  ) {
    super();
    this.type = type;
    this.title = title;
    this.content = content;
    this.tenantId = tenantId;
    this.userId = userId;
    this.status = 'pending';
  }
}
```

---

## 🔄 迁移策略

### 1. **数据库迁移管理**

#### 迁移配置

```typescript
// config/migrations/migration.config.ts
import { defineConfig } from '@mikro-orm/migrations';

export const migrationConfig = defineConfig({
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
    tableName: 'mikro_orm_migrations',
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    dropTables: true,
    safe: false,
    snapshot: true,
  },
});
```

#### PostgreSQL迁移示例

```typescript
// src/migrations/Migration20241201000000.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20241201000000 extends Migration {
  async up(): Promise<void> {
    // 创建租户表
    this.addSql(`
      CREATE TABLE tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(200),
        is_active BOOLEAN DEFAULT TRUE,
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建索引
    this.addSql('CREATE INDEX idx_tenants_code ON tenants(code);');
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS tenants;');
  }
}
```

#### MongoDB迁移示例

```typescript
// src/migrations/Migration20241201000001.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20241201000001 extends Migration {
  async up(): Promise<void> {
    // 创建日志集合
    this.addSql(`
      db.createCollection('logs', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['timestamp', 'level', 'service', 'message'],
            properties: {
              _id: { bsonType: 'string' },
              timestamp: { bsonType: 'date' },
              level: { bsonType: 'string' },
              service: { bsonType: 'string' },
              message: { bsonType: 'string' },
              context: { bsonType: 'object' },
              metadata: { bsonType: 'object' },
              userId: { bsonType: 'string' },
              tenantId: { bsonType: 'string' },
              correlationId: { bsonType: 'string' },
              requestId: { bsonType: 'string' },
              ip: { bsonType: 'string' },
              userAgent: { bsonType: 'string' },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' },
              createdBy: { bsonType: 'string' },
              updatedBy: { bsonType: 'string' },
              isActive: { bsonType: 'bool' },
              deletedAt: { bsonType: 'date' }
            }
          }
        }
      });
    `);

    // 创建索引
    this.addSql('db.logs.createIndex({ "timestamp": 1 });');
    this.addSql('db.logs.createIndex({ "level": 1 });');
    this.addSql('db.logs.createIndex({ "service": 1 });');
    this.addSql('db.logs.createIndex({ "userId": 1 });');
    this.addSql('db.logs.createIndex({ "tenantId": 1 });');
    this.addSql('db.logs.createIndex({ "createdAt": 1 });');
  }

  async down(): Promise<void> {
    this.addSql('db.logs.drop();');
  }
}
```

### 2. **数据迁移工具**

#### 数据库迁移服务

```typescript
// libs/shared/infrastructure/database/database-migration.service.ts
import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { IDatabaseAdapter } from './database-adapter.interface';

@Injectable()
export class DatabaseMigrationService {
  constructor(
    private readonly orm: MikroORM,
    private readonly databaseAdapter: IDatabaseAdapter,
  ) {}

  /**
   * 执行数据库迁移
   */
  async migrate(): Promise<void> {
    try {
      const migrator = this.orm.getMigrator();
      await migrator.up();
      console.log('数据库迁移完成');
    } catch (error) {
      console.error('数据库迁移失败:', error);
      throw error;
    }
  }

  /**
   * 回滚数据库迁移
   */
  async rollback(steps?: number): Promise<void> {
    try {
      const migrator = this.orm.getMigrator();
      await migrator.down({ steps });
      console.log('数据库回滚完成');
    } catch (error) {
      console.error('数据库回滚失败:', error);
      throw error;
    }
  }

  /**
   * 创建新的迁移文件
   */
  async createMigration(name: string): Promise<void> {
    try {
      const migrator = this.orm.getMigrator();
      await migrator.createMigration(name);
      console.log(`迁移文件创建完成: ${name}`);
    } catch (error) {
      console.error('创建迁移文件失败:', error);
      throw error;
    }
  }

  /**
   * 获取迁移状态
   */
  async getMigrationStatus(): Promise<any> {
    try {
      const migrator = this.orm.getMigrator();
      const pending = await migrator.getPendingMigrations();
      const executed = await migrator.getExecutedMigrations();
      return { pending, executed };
    } catch (error) {
      console.error('获取迁移状态失败:', error);
      throw error;
    }
  }
}
```

---

## 🎯 最佳实践

### 1. **性能优化**

#### 连接池配置

```typescript
// config/database/connection-pool.config.ts
export const connectionPoolConfig = {
  // 开发环境
  development: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
  },

  // 生产环境
  production: {
    min: 10,
    max: 50,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
  },
};
```

#### 查询优化

```typescript
// libs/shared/infrastructure/database/query-optimizer.service.ts
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class QueryOptimizerService {
  constructor(private readonly em: EntityManager) {}

  /**
   * 优化查询性能
   */
  async optimizeQuery<T>(
    queryBuilder: any,
    options?: {
      limit?: number;
      offset?: number;
      select?: string[];
      populate?: string[];
      cache?: boolean;
    },
  ): Promise<T[]> {
    let query = queryBuilder;

    // 添加分页
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    // 选择字段
    if (options?.select) {
      query = query.select(options.select);
    }

    // 预加载关联
    if (options?.populate) {
      query = query.populate(options.populate);
    }

    // 启用缓存
    if (options?.cache) {
      query = query.setCache(true);
    }

    return await query.getResult();
  }

  /**
   * 批量操作优化
   */
  async batchInsert<T>(entities: T[]): Promise<void> {
    const batchSize = 1000;
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      await this.em.persistAndFlush(batch);
    }
  }

  /**
   * 批量更新优化
   */
  async batchUpdate<T>(entities: T[]): Promise<void> {
    const batchSize = 1000;
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      await this.em.flush();
    }
  }
}
```

### 2. **监控和日志**

#### 数据库监控服务

```typescript
// libs/shared/infrastructure/database/database-monitor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IDatabaseAdapter } from './database-adapter.interface';

@Injectable()
export class DatabaseMonitorService {
  private readonly logger = new Logger(DatabaseMonitorService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly databaseAdapter: IDatabaseAdapter,
  ) {}

  /**
   * 监控数据库性能
   */
  async monitorPerformance(): Promise<any> {
    try {
      const startTime = Date.now();

      // 执行健康检查
      const isHealthy = await this.databaseAdapter.healthCheck();

      // 获取连接池状态
      const connection = await this.databaseAdapter.getConnection();
      const poolStatus = connection.pool?.status();

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        isHealthy,
        responseTime,
        poolStatus,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('数据库性能监控失败:', error);
      throw error;
    }
  }

  /**
   * 获取慢查询统计
   */
  private async getSlowQueries(): Promise<any[]> {
    try {
      // 这里需要根据具体数据库实现慢查询统计
      // PostgreSQL示例
      const result = await this.em.getConnection().execute(`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        WHERE mean_time > 1000 
        ORDER BY mean_time DESC 
        LIMIT 10
      `);

      return result;
    } catch (error) {
      this.logger.warn('获取慢查询统计失败:', error);
      return [];
    }
  }

  /**
   * 数据库连接监控
   */
  async monitorConnections(): Promise<any> {
    try {
      const connection = await this.databaseAdapter.getConnection();

      return {
        totalConnections: connection.pool?.totalCount || 0,
        activeConnections: connection.pool?.activeCount || 0,
        idleConnections: connection.pool?.idleCount || 0,
        waitingConnections: connection.pool?.waitingCount || 0,
      };
    } catch (error) {
      this.logger.error('数据库连接监控失败:', error);
      throw error;
    }
  }
}
```

### 3. **错误处理和重试**

#### 数据库错误处理服务

```typescript
// libs/shared/infrastructure/database/database-error-handler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { IDatabaseAdapter } from './database-adapter.interface';

@Injectable()
export class DatabaseErrorHandlerService {
  private readonly logger = new Logger(DatabaseErrorHandlerService.name);

  constructor(private readonly databaseAdapter: IDatabaseAdapter) {}

  /**
   * 带重试的数据库操作
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (this.isRetryableError(error) && attempt < maxRetries) {
          this.logger.warn(
            `数据库操作失败，第${attempt}次重试:`,
            error.message,
          );
          await this.delay(delay * attempt);
          continue;
        }

        break;
      }
    }

    this.logger.error(`数据库操作最终失败，已重试${maxRetries}次:`, lastError);
    throw lastError;
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'connection timeout',
      'connection refused',
      'network error',
    ];

    return retryableErrors.some(retryableError =>
      error.message?.toLowerCase().includes(retryableError.toLowerCase()),
    );
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 事务操作包装器
   */
  async withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.databaseAdapter.beginTransaction();
      const result = await operation();
      await this.databaseAdapter.commitTransaction();
      return result;
    } catch (error) {
      await this.databaseAdapter.rollbackTransaction();
      throw error;
    }
  }
}
```

---

## 📋 总结

### 核心特性

1. **多数据库支持**: PostgreSQL作为默认数据库，MongoDB作为扩展选项
2. **统一ORM**: 使用MikroORM实现统一的ORM层
3. **适配器模式**: 通过适配器模式实现数据库无关性
4. **迁移管理**: 完善的数据库迁移和版本管理
5. **性能优化**: 连接池、查询优化、批量操作
6. **监控告警**: 数据库性能监控和错误处理
7. **最佳实践**: 完整的开发规范和最佳实践

### 技术优势

- **灵活性**: 支持多种数据库，便于技术选型
- **可扩展性**: 易于添加新的数据库支持
- **性能**: 针对不同数据库进行性能优化
- **可靠性**: 完善的错误处理和重试机制
- **可维护性**: 清晰的架构和代码组织

### 实施建议

1. **渐进式实施**: 先实现PostgreSQL，再扩展MongoDB
2. **充分测试**: 在不同环境下进行充分测试
3. **性能监控**: 建立完善的性能监控体系
4. **文档完善**: 保持文档的及时更新
5. **团队培训**: 对开发团队进行技术培训

---

_本文档完整地描述了多数据库适配的设计方案，包括技术选型、实现方案、最佳实践等内容，为项目的数据库架构提供了全面的指导。_
