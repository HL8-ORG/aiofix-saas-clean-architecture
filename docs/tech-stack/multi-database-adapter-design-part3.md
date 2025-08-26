# 多数据库适配设计文档 - 第三部分

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

---

## 🔄 迁移策略

### 1. **数据库迁移管理**

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
        subscription_expires_at TIMESTAMP,
        max_users INTEGER DEFAULT 0,
        max_storage INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        deleted_at TIMESTAMP
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
    reapIntervalMillis: 1000,
  },

  // 测试环境
  testing: {
    min: 1,
    max: 5,
    acquireTimeoutMillis: 10000,
    idleTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
  },

  // 生产环境
  production: {
    min: 10,
    max: 50,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
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

      // 获取慢查询统计
      const slowQueries = await this.getSlowQueries();

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        isHealthy,
        responseTime,
        poolStatus,
        slowQueries,
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
