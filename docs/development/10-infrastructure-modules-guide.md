# 10 - 通用基础设施模块开发指南

## 📋 文档信息

- **文档类型**: 基础设施模块开发指南
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **最后更新**: 2024年12月
- **文档状态**: 实施版
- **目标读者**: 全栈工程师、基础设施开发者、架构师

---

## 🎯 设计理念与目标

### 核心设计原则

我们的基础设施模块遵循以下核心原则：

```
🛠️  Infrastructure as Code (基础设施即代码)
    +
🔧  Pluggable Architecture (可插拔架构)
    +
📦  Modular Design (模块化设计)
    +
🔄  Cross-Cutting Concerns (横切关注点)
```

### 基础设施目标

1. **🛠️ 技术支撑**: 为所有领域提供统一的技术基础设施
2. **📦 模块化**: 独立的基础设施模块，可按需集成
3. **🔧 可插拔**: 支持不同技术栈的灵活替换
4. **🚀 高性能**: 提供高性能的基础服务
5. **🔒 安全性**: 内置安全机制和合规支持
6. **📊 可观测**: 全面的监控、日志和审计能力

### 设计价值

| 价值维度     | 技术价值                      | 业务价值                |
| ------------ | ----------------------------- | ----------------------- |
| **开发效率** | ✅ 统一基础设施，减少重复开发 | ✅ 加速业务功能开发     |
| **可维护性** | ✅ 模块化设计，易于维护       | ✅ 降低长期维护成本     |
| **扩展性**   | ✅ 可插拔架构，灵活扩展       | ✅ 支持业务快速增长     |
| **安全性**   | ✅ 内置安全机制               | ✅ 满足企业安全合规要求 |

---

## 📁 基础设施模块架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        业务领域层                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────────┐  │
│  │ IAM Domain  │ Notification│ Workflow    │ Analytics & Others  │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                         │ 依赖
┌─────────────────────────▼───────────────────────────────────────┐
│                   基础设施模块层                                  │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────────┐  │
│  │   Cache     │  Logging    │  Database   │  Security & Others  │  │
│  │   Module    │   Module    │   Module    │      Modules        │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 当前基础设施模块

根据实际代码结构，我们目前拥有以下基础设施模块：

```
libs/infrastructure/
├── cache/                         # 🗄️ 缓存管理模块
├── config/                        # ⚙️ 配置管理模块
├── database/                      # 🗃️ 数据库管理模块
├── logging/                       # 📋 日志管理模块
└── security/                      # 🔒 安全合规模块
```

---

## 🗄️ 缓存管理模块 (Cache Module)

### 业务需求映射

基于 [`cache-management-business-requirements.md`](../../../business-requirements/cache-management-business-requirements.md) 的需求分析，缓存管理模块需要提供：

- **多级缓存架构**: 浏览器缓存、CDN缓存、应用缓存、数据库缓存
- **缓存策略管理**: TTL配置、淘汰策略、更新策略
- **性能监控**: 命中率监控、性能指标、告警机制
- **安全控制**: 访问控制、数据加密、审计追踪

### 模块结构

```
libs/infrastructure/cache/
├── src/
│   ├── cache.module.ts            # 🏗️ 缓存模块主文件
│   ├── config/                    # ⚙️ 缓存配置
│   │   ├── cache.config.ts        # 缓存配置接口
│   │   └── redis.config.ts        # Redis配置
│   ├── services/                  # 💼 缓存服务
│   │   ├── redis-cache.service.ts # Redis缓存服务
│   │   ├── memory-cache.service.ts# 内存缓存服务
│   │   └── cache-manager.service.ts# 缓存管理器
│   ├── factories/                 # 🏭 工厂类
│   │   └── cache-provider.factory.ts# 缓存提供者工厂
│   ├── decorators/                # 🎨 装饰器
│   │   ├── cacheable.decorator.ts # 缓存装饰器
│   │   └── cache-evict.decorator.ts# 缓存失效装饰器
│   ├── interceptors/              # 🔍 拦截器
│   │   └── cache.interceptor.ts   # 缓存拦截器
│   ├── interfaces/                # 📋 接口定义
│   │   ├── cache.interface.ts     # 缓存接口
│   │   └── cache-strategy.interface.ts# 缓存策略接口
│   └── index.ts                   # 公共导出
├── package.json                   # 依赖管理
├── tsconfig.json                  # TS配置
└── .swcrc                         # SWC配置
```

### 核心功能实现

#### 1. 缓存管理器服务

```typescript
/**
 * @class CacheManagerService
 * @description
 * 缓存管理器服务，提供统一的缓存操作接口。支持多种缓存策略和存储后端，
 * 实现了缓存的统一管理、性能监控和故障恢复机制。
 *
 * 主要功能：
 * 1. 统一的缓存操作接口（get、set、delete、clear）
 * 2. 支持多级缓存策略（L1内存缓存 + L2 Redis缓存）
 * 3. 缓存性能监控和统计（命中率、响应时间、错误率）
 * 4. 缓存失效策略（TTL、LRU、手动失效）
 * 5. 故障恢复和降级机制
 *
 * 业务规则：
 * 1. 缓存键必须符合命名规范
 * 2. 缓存值大小不能超过配置限制
 * 3. 敏感数据必须加密存储
 * 4. 缓存操作必须记录审计日志
 */
@Injectable()
export class CacheManagerService implements ICacheManager {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @Inject('MEMORY_CACHE') private readonly memoryCache: Map<string, any>,
    private readonly logger: PinoLoggerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @method get
   * @description 获取缓存值，支持多级缓存查找
   */
  async get<T>(key: string): Promise<T | null> {
    // 1. 先查L1内存缓存
    const memoryValue = this.memoryCache.get(key);
    if (memoryValue) {
      this.recordCacheHit('memory', key);
      return memoryValue;
    }

    // 2. 再查L2 Redis缓存
    const redisValue = await this.redisClient.get(key);
    if (redisValue) {
      this.recordCacheHit('redis', key);
      // 回填L1缓存
      this.memoryCache.set(key, JSON.parse(redisValue));
      return JSON.parse(redisValue);
    }

    this.recordCacheMiss(key);
    return null;
  }

  /**
   * @method set
   * @description 设置缓存值，支持TTL和多级缓存同步
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);

    // 同时设置L1和L2缓存
    this.memoryCache.set(key, value);

    if (ttl) {
      await this.redisClient.setex(key, ttl, serializedValue);
    } else {
      await this.redisClient.set(key, serializedValue);
    }

    this.logger.debug('Cache set', { key, ttl });
  }

  private recordCacheHit(level: string, key: string): void {
    // 记录缓存命中统计
  }

  private recordCacheMiss(key: string): void {
    // 记录缓存未命中统计
  }
}
```

#### 2. 缓存装饰器

```typescript
/**
 * @decorator Cacheable
 * @description
 * 方法级缓存装饰器，自动为方法结果提供缓存功能。
 * 支持动态缓存键生成、TTL配置和条件缓存。
 *
 * 使用示例：
 * @Cacheable({ key: 'user:${id}', ttl: 3600 })
 * async getUserById(id: string): Promise<User> { ... }
 */
export function Cacheable(options: CacheableOptions = {}): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager = Container.get(CacheManagerService);

      // 动态生成缓存键
      const cacheKey = generateCacheKey(options.key, args);

      // 尝试从缓存获取
      const cachedResult = await cacheManager.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args);

      // 缓存结果
      if (result !== undefined && result !== null) {
        await cacheManager.set(cacheKey, result, options.ttl);
      }

      return result;
    };

    return descriptor;
  };
}
```

### 配置管理

```typescript
// cache.config.ts
export interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    maxRetriesPerRequest: number;
    retryDelayOnFailover: number;
  };
  memory: {
    maxSize: number;
    ttl: number;
  };
  strategy: {
    defaultTtl: number;
    maxValueSize: number;
    enableCompression: boolean;
  };
}
```

---

## 📋 日志管理模块 (Logging Module)

### 业务需求映射

基于 [`log-management-business-requirements.md`](../../../business-requirements/log-management-business-requirements.md) 的需求分析：

- **统一日志收集**: 应用日志、系统日志、安全日志、审计日志
- **日志格式标准化**: 结构化日志、JSON格式、标准字段
- **分层存储**: 热数据、温数据、冷数据的分层存储策略
- **安全合规**: 日志加密、访问控制、审计追踪

### 模块结构

```
libs/infrastructure/logging/
├── src/
│   ├── logging.module.ts          # 🏗️ 日志模块主文件
│   ├── services/                  # 💼 日志服务
│   │   ├── pino-logger.service.ts # Pino日志服务
│   │   ├── pino-logger-config.service.ts # 日志配置服务
│   │   └── log-correlation.service.ts # 日志关联服务
│   ├── middleware/                # 🔄 中间件
│   │   └── pino-logging.middleware.ts # 日志中间件
│   ├── interceptors/              # 🔍 拦截器
│   │   └── logging.interceptor.ts # 日志拦截器
│   ├── formatters/                # 📝 格式化器
│   │   ├── json.formatter.ts      # JSON格式化器
│   │   └── sensitive-data.formatter.ts # 敏感数据格式化器
│   ├── transports/                # 🚚 传输器
│   │   ├── file.transport.ts      # 文件传输器
│   │   └── remote.transport.ts    # 远程传输器
│   └── index.ts                   # 公共导出
├── package.json
├── tsconfig.json
└── .swcrc
```

### 核心功能实现

#### 1. Pino日志服务

```typescript
/**
 * @class PinoLoggerService
 * @description
 * 基于Pino的高性能日志服务，提供结构化日志记录能力。
 * 集成了敏感数据脱敏、日志关联、性能监控等功能。
 *
 * 主要功能：
 * 1. 结构化日志记录（JSON格式）
 * 2. 敏感数据自动脱敏
 * 3. 请求关联ID追踪
 * 4. 多级日志输出（控制台、文件、远程）
 * 5. 性能监控和统计
 *
 * 业务规则：
 * 1. 所有敏感数据必须脱敏
 * 2. 审计日志必须完整记录
 * 3. 日志格式必须标准化
 * 4. 错误日志必须包含堆栈信息
 */
@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger: pino.Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly correlationService: LogCorrelationService,
  ) {
    this.logger = pino({
      level: this.configService.get('LOG_LEVEL', 'info'),
      formatters: {
        level: label => ({ level: label }),
        log: object => this.formatLogObject(object),
      },
      serializers: {
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
        err: pino.stdSerializers.err,
      },
      redact: {
        paths: [
          'password',
          'token',
          'authorization',
          'cookie',
          'req.headers.authorization',
          'req.headers.cookie',
        ],
        censor: '[REDACTED]',
      },
    });
  }

  /**
   * @method info
   * @description 记录信息级别日志
   */
  info(message: string, context?: Record<string, any>): void {
    this.logger.info({
      ...this.getDefaultContext(),
      ...context,
      message,
    });
  }

  /**
   * @method error
   * @description 记录错误级别日志
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.logger.error({
      ...this.getDefaultContext(),
      ...context,
      message,
      err: error,
      stack: error?.stack,
    });
  }

  /**
   * @method audit
   * @description 记录审计日志，包含完整的操作上下文
   */
  audit(event: string, context: AuditContext): void {
    this.logger.info({
      ...this.getDefaultContext(),
      logType: 'audit',
      event,
      userId: context.userId,
      tenantId: context.tenantId,
      action: context.action,
      resource: context.resource,
      result: context.result,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  private getDefaultContext(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      correlationId: this.correlationService.getCorrelationId(),
      service: 'aiofix-iam',
      environment: this.configService.get('NODE_ENV'),
    };
  }

  private formatLogObject(object: any): any {
    // 格式化日志对象，确保结构化
    return {
      timestamp: new Date().toISOString(),
      ...object,
    };
  }
}
```

#### 2. 日志中间件

```typescript
/**
 * @class PinoLoggingMiddleware
 * @description
 * HTTP请求日志中间件，自动记录请求和响应信息。
 * 支持性能监控、错误追踪和审计日志。
 */
@Injectable()
export class PinoLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLoggerService) {}

  use(req: FastifyRequest, res: FastifyReply, next: () => void): void {
    const startTime = Date.now();
    const correlationId = this.generateCorrelationId();

    // 设置关联ID
    req.headers['x-correlation-id'] = correlationId;
    res.header('x-correlation-id', correlationId);

    // 记录请求开始
    this.logger.info('HTTP Request Started', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      correlationId,
    });

    // 监听响应结束
    res.addHook('onSend', async (request, reply, payload) => {
      const duration = Date.now() - startTime;

      this.logger.info('HTTP Request Completed', {
        method: req.method,
        url: req.url,
        statusCode: reply.statusCode,
        duration,
        correlationId,
      });

      return payload;
    });

    next();
  }

  private generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 🗃️ 数据库管理模块 (Database Module)

### 业务需求映射

基于现有的数据隔离和安全合规需求：

- **多数据库支持**: PostgreSQL（默认）、MongoDB（扩展）
- **数据隔离**: 租户级、组织级、部门级数据隔离
- **安全控制**: 数据加密、访问控制、审计日志
- **性能优化**: 连接池、查询优化、索引管理

### 模块结构

```
libs/infrastructure/database/
├── src/
│   ├── database.module.ts         # 🏗️ 数据库模块主文件
│   ├── config/                    # ⚙️ 数据库配置
│   │   ├── database.config.ts     # 数据库配置接口
│   │   ├── postgresql.config.ts   # PostgreSQL配置
│   │   └── mongodb.config.ts      # MongoDB配置
│   ├── adapters/                  # 🔌 数据库适配器
│   │   ├── postgresql.adapter.ts  # PostgreSQL适配器
│   │   └── mongodb.adapter.ts     # MongoDB适配器
│   ├── factories/                 # 🏭 工厂类
│   │   ├── database-provider.factory.ts # 数据库提供者工厂
│   │   └── entity.factory.ts      # 实体工厂
│   ├── services/                  # 💼 数据库服务
│   │   ├── migration.service.ts   # 迁移服务
│   │   ├── seed.service.ts        # 数据填充服务
│   │   └── health-check.service.ts# 健康检查服务
│   ├── interfaces/                # 📋 接口定义
│   │   ├── database.interface.ts  # 数据库接口
│   │   └── isolation.interface.ts # 数据隔离接口
│   └── index.ts                   # 公共导出
├── package.json
├── tsconfig.json
└── .swcrc
```

### 核心功能实现

#### 1. 数据库提供者工厂

```typescript
/**
 * @class DatabaseProviderFactory
 * @description
 * 数据库提供者工厂，根据配置动态创建数据库连接。
 * 支持PostgreSQL和MongoDB的统一管理。
 *
 * 主要功能：
 * 1. 根据环境配置选择数据库类型
 * 2. 创建和管理数据库连接
 * 3. 提供统一的数据库操作接口
 * 4. 支持连接池和故障恢复
 *
 * 业务规则：
 * 1. 默认使用PostgreSQL，支持MongoDB扩展
 * 2. 连接参数必须加密存储
 * 3. 连接失败必须有重试机制
 * 4. 连接状态必须监控
 */
@Injectable()
export class DatabaseProviderFactory {
  constructor(private readonly configService: ConfigService) {}

  /**
   * @method createProvider
   * @description 创建数据库提供者
   */
  createProvider(): Provider[] {
    const databaseType = this.configService.get<DatabaseType>(
      'DATABASE_TYPE',
      DatabaseType.POSTGRESQL,
    );

    switch (databaseType) {
      case DatabaseType.POSTGRESQL:
        return this.createPostgreSQLProvider();
      case DatabaseType.MONGODB:
        return this.createMongoDBProvider();
      default:
        throw new Error(`Unsupported database type: ${databaseType}`);
    }
  }

  private createPostgreSQLProvider(): Provider[] {
    return [
      {
        provide: 'DATABASE_CONNECTION',
        useFactory: async () => {
          const config = this.getPostgreSQLConfig();
          return MikroORM.init(config);
        },
        inject: [ConfigService],
      },
    ];
  }

  private createMongoDBProvider(): Provider[] {
    return [
      {
        provide: 'DATABASE_CONNECTION',
        useFactory: async () => {
          const config = this.getMongoDBConfig();
          return MikroORM.init(config);
        },
        inject: [ConfigService],
      },
    ];
  }

  private getPostgreSQLConfig(): Options {
    return {
      type: 'postgresql',
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      user: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      dbName: this.configService.get('DB_DATABASE'),
      entities: ['dist/**/*.entity.js'],
      entitiesTs: ['src/**/*.entity.ts'],
      migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations',
      },
      pool: {
        min: 2,
        max: 10,
      },
      debug: this.configService.get('NODE_ENV') === 'development',
    };
  }

  private getMongoDBConfig(): Options {
    return {
      type: 'mongo',
      clientUrl: this.configService.get('MONGODB_URI'),
      entities: ['dist/**/*.mongodb-entity.js'],
      entitiesTs: ['src/**/*.mongodb-entity.ts'],
      debug: this.configService.get('NODE_ENV') === 'development',
    };
  }
}
```

#### 2. 数据隔离拦截器

```typescript
/**
 * @class DataIsolationInterceptor
 * @description
 * 数据隔离拦截器，自动为查询添加数据隔离条件。
 * 基于用户上下文自动应用租户、组织、部门级别的数据隔离。
 */
@Injectable()
export class DataIsolationInterceptor implements CallHandler {
  constructor(
    private readonly userContextService: UserContextService,
    private readonly logger: PinoLoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userContext = this.userContextService.getUserContext(request);

    // 设置数据隔离上下文
    this.setIsolationContext(userContext);

    return next.handle().pipe(
      tap(() => {
        // 记录数据访问日志
        this.logger.audit('data_access', {
          userId: userContext.userId,
          tenantId: userContext.tenantId,
          organizationId: userContext.organizationId,
          action: 'query',
          resource: context.getClass().name,
        });
      }),
    );
  }

  private setIsolationContext(userContext: UserContext): void {
    // 将用户上下文设置到当前请求的隔离上下文中
    IsolationContext.set({
      tenantId: userContext.tenantId,
      organizationId: userContext.organizationId,
      departmentId: userContext.departmentId,
      userId: userContext.userId,
    });
  }
}
```

---

## 🔒 安全合规模块 (Security Module)

### 业务需求映射

基于 [`security-compliance-business-requirements.md`](../../../business-requirements/security-compliance-business-requirements.md) 的需求分析：

- **身份认证**: 多因素认证、单点登录、OAuth集成
- **数据保护**: 数据加密、脱敏、备份恢复
- **安全监控**: 事件监控、异常检测、审计报告
- **合规管理**: 自动化合规检查、报告生成、培训管理

### 模块结构

```
libs/infrastructure/security/
├── src/
│   ├── security.module.ts         # 🏗️ 安全模块主文件
│   ├── auth/                      # 🔐 认证服务
│   │   ├── jwt.service.ts         # JWT服务
│   │   ├── oauth.service.ts       # OAuth服务
│   │   ├── mfa.service.ts         # 多因素认证服务
│   │   └── session.service.ts     # 会话管理服务
│   ├── encryption/                # 🔒 加密服务
│   │   ├── aes.service.ts         # AES加密服务
│   │   ├── rsa.service.ts         # RSA加密服务
│   │   └── hash.service.ts        # 哈希服务
│   ├── monitoring/                # 📊 安全监控
│   │   ├── security-monitor.service.ts # 安全监控服务
│   │   ├── threat-detection.service.ts # 威胁检测服务
│   │   └── audit.service.ts       # 审计服务
│   ├── compliance/                # 📋 合规管理
│   │   ├── compliance-check.service.ts # 合规检查服务
│   │   ├── report-generator.service.ts # 报告生成服务
│   │   └── policy.service.ts      # 策略管理服务
│   ├── guards/                    # 🛡️ 安全守卫
│   │   ├── jwt-auth.guard.ts      # JWT认证守卫
│   │   ├── role.guard.ts          # 角色守卫
│   │   └── permission.guard.ts    # 权限守卫
│   └── index.ts                   # 公共导出
├── package.json
├── tsconfig.json
└── .swcrc
```

### 核心功能实现

#### 1. 安全监控服务

```typescript
/**
 * @class SecurityMonitorService
 * @description
 * 安全监控服务，实时监控系统安全事件和异常行为。
 * 提供威胁检测、异常告警和安全报告功能。
 *
 * 主要功能：
 * 1. 实时安全事件监控
 * 2. 异常行为检测和告警
 * 3. 安全指标统计和分析
 * 4. 自动化安全响应
 *
 * 业务规则：
 * 1. 所有安全事件必须记录
 * 2. 异常行为必须及时告警
 * 3. 安全响应必须自动化
 * 4. 安全数据必须加密存储
 */
@Injectable()
export class SecurityMonitorService {
  private readonly securityMetrics = new Map<string, number>();

  constructor(
    private readonly logger: PinoLoggerService,
    private readonly threatDetection: ThreatDetectionService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * @method recordSecurityEvent
   * @description 记录安全事件
   */
  async recordSecurityEvent(event: SecurityEvent): Promise<void> {
    // 记录安全事件
    this.logger.audit('security_event', {
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
    });

    // 更新安全指标
    this.updateSecurityMetrics(event);

    // 检查是否需要告警
    if (await this.shouldAlert(event)) {
      await this.triggerSecurityAlert(event);
    }

    // 检查威胁模式
    await this.threatDetection.analyzeEvent(event);
  }

  /**
   * @method detectAnomalousLogin
   * @description 检测异常登录行为
   */
  async detectAnomalousLogin(loginAttempt: LoginAttempt): Promise<boolean> {
    const user = loginAttempt.userId;
    const currentLocation = loginAttempt.ipLocation;
    const currentTime = new Date();

    // 检查登录频率
    const recentLogins = await this.getRecentLogins(user, 1); // 1小时内
    if (recentLogins.length > 5) {
      await this.recordSecurityEvent({
        type: 'suspicious_login_frequency',
        severity: 'medium',
        userId: user,
        details: { loginCount: recentLogins.length },
      });
      return true;
    }

    // 检查地理位置异常
    const lastLocation = await this.getLastLoginLocation(user);
    if (this.isLocationAnomalous(lastLocation, currentLocation)) {
      await this.recordSecurityEvent({
        type: 'unusual_login_location',
        severity: 'high',
        userId: user,
        details: { lastLocation, currentLocation },
      });
      return true;
    }

    // 检查登录时间异常
    if (this.isTimeAnomalous(currentTime, user)) {
      await this.recordSecurityEvent({
        type: 'unusual_login_time',
        severity: 'low',
        userId: user,
        details: { loginTime: currentTime },
      });
      return true;
    }

    return false;
  }

  private async shouldAlert(event: SecurityEvent): Promise<boolean> {
    // 根据事件类型和严重程度决定是否告警
    const highSeverityEvents = [
      'data_breach',
      'unauthorized_access',
      'unusual_login_location',
    ];
    return event.severity === 'high' || highSeverityEvents.includes(event.type);
  }

  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    await this.notificationService.sendSecurityAlert({
      type: 'security_incident',
      severity: event.severity,
      message: `Security event detected: ${event.type}`,
      details: event.details,
      timestamp: new Date(),
    });
  }
}
```

#### 2. 合规检查服务

```typescript
/**
 * @class ComplianceCheckService
 * @description
 * 合规检查服务，自动化执行各种合规标准的检查。
 * 支持SOX、GDPR、ISO27001等多种合规标准。
 */
@Injectable()
export class ComplianceCheckService {
  constructor(
    private readonly policyService: PolicyService,
    private readonly reportGenerator: ReportGeneratorService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method runComplianceCheck
   * @description 执行合规检查
   */
  async runComplianceCheck(
    standard: ComplianceStandard,
  ): Promise<ComplianceReport> {
    this.logger.info('Starting compliance check', { standard });

    const checkResults = await this.executeChecks(standard);
    const report = await this.reportGenerator.generateComplianceReport({
      standard,
      results: checkResults,
      timestamp: new Date(),
    });

    // 记录合规检查事件
    this.logger.audit('compliance_check', {
      standard,
      passed: checkResults.filter(r => r.status === 'passed').length,
      failed: checkResults.filter(r => r.status === 'failed').length,
      warnings: checkResults.filter(r => r.status === 'warning').length,
    });

    return report;
  }

  private async executeChecks(
    standard: ComplianceStandard,
  ): Promise<CheckResult[]> {
    const policies = await this.policyService.getPoliciesForStandard(standard);
    const results: CheckResult[] = [];

    for (const policy of policies) {
      try {
        const result = await this.executePolicy(policy);
        results.push(result);
      } catch (error) {
        this.logger.error('Policy execution failed', error, {
          policyId: policy.id,
        });
        results.push({
          policyId: policy.id,
          status: 'failed',
          message: `Policy execution failed: ${error.message}`,
        });
      }
    }

    return results;
  }

  private async executePolicy(policy: CompliancePolicy): Promise<CheckResult> {
    // 根据策略类型执行不同的检查逻辑
    switch (policy.type) {
      case 'password_policy':
        return this.checkPasswordPolicy(policy);
      case 'access_control':
        return this.checkAccessControl(policy);
      case 'data_encryption':
        return this.checkDataEncryption(policy);
      case 'audit_logging':
        return this.checkAuditLogging(policy);
      default:
        throw new Error(`Unknown policy type: ${policy.type}`);
    }
  }
}
```

---

## ⚙️ 配置管理模块 (Config Module)

### 模块职责

- **多环境配置**: 开发、测试、生产环境配置管理
- **配置验证**: 配置参数的类型验证和业务规则验证
- **敏感信息保护**: 密码、密钥等敏感配置的加密存储
- **动态配置**: 支持运行时配置更新

### 模块结构

```
libs/infrastructure/config/
├── src/
│   ├── config.module.ts           # 🏗️ 配置模块主文件
│   ├── lib/                       # 📚 配置库
│   │   ├── app.config.ts          # 应用配置
│   │   ├── database.config.ts     # 数据库配置
│   │   ├── redis.config.ts        # Redis配置
│   │   ├── jwt.config.ts          # JWT配置
│   │   ├── email.config.ts        # 邮件配置
│   │   └── logging.config.ts      # 日志配置
│   ├── services/                  # 💼 配置服务
│   │   ├── config-loader.service.ts # 配置加载服务
│   │   ├── config-validator.service.ts # 配置验证服务
│   │   └── config-encryption.service.ts # 配置加密服务
│   ├── validators/                # ✅ 验证器
│   │   └── config.validator.ts    # 配置验证器
│   └── index.ts                   # 公共导出
├── package.json
├── tsconfig.json
└── .swcrc
```

### 核心功能实现

```typescript
/**
 * @class ConfigLoaderService
 * @description
 * 配置加载服务，负责从多个源加载和合并配置。
 * 支持环境变量、配置文件、远程配置中心等多种配置源。
 */
@Injectable()
export class ConfigLoaderService {
  private readonly config = new Map<string, any>();

  constructor(
    private readonly validator: ConfigValidatorService,
    private readonly encryption: ConfigEncryptionService,
  ) {
    this.loadConfiguration();
  }

  private async loadConfiguration(): Promise<void> {
    // 1. 加载默认配置
    const defaultConfig = await this.loadDefaultConfig();

    // 2. 加载环境变量
    const envConfig = this.loadEnvironmentVariables();

    // 3. 加载配置文件
    const fileConfig = await this.loadConfigFile();

    // 4. 合并配置
    const mergedConfig = { ...defaultConfig, ...fileConfig, ...envConfig };

    // 5. 验证配置
    await this.validator.validate(mergedConfig);

    // 6. 解密敏感配置
    const decryptedConfig = await this.encryption.decrypt(mergedConfig);

    // 7. 存储配置
    this.storeConfig(decryptedConfig);
  }
}
```

---

## 🔄 模块间协作模式

### 横切关注点处理

基础设施模块之间通过以下模式协作：

```typescript
/**
 * @example 模块间协作示例
 * 用户登录场景中多个基础设施模块的协作
 */

// 1. 安全模块：验证用户身份
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService, // Security Module
    private readonly cacheManager: CacheManagerService, // Cache Module
    private readonly logger: PinoLoggerService, // Logging Module
    private readonly securityMonitor: SecurityMonitorService, // Security Module
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    // 2. 日志模块：记录登录尝试
    this.logger.info('Login attempt', { username: loginDto.username });

    // 3. 缓存模块：检查登录限制
    const attemptKey = `login_attempts:${loginDto.username}`;
    const attempts = (await this.cacheManager.get<number>(attemptKey)) || 0;

    if (attempts >= 5) {
      // 4. 安全模块：记录安全事件
      await this.securityMonitor.recordSecurityEvent({
        type: 'login_rate_limit_exceeded',
        severity: 'medium',
        userId: loginDto.username,
      });
      throw new TooManyRequestsException('Too many login attempts');
    }

    // 5. 认证逻辑...
    const user = await this.validateUser(loginDto);

    // 6. 缓存模块：缓存用户会话
    const token = this.jwtService.sign({ userId: user.id });
    await this.cacheManager.set(`session:${user.id}`, { token, user }, 3600);

    // 7. 日志模块：记录成功登录
    this.logger.audit('user_login', {
      userId: user.id,
      action: 'login',
      result: 'success',
    });

    return { token, user };
  }
}
```

### 配置统一管理

```typescript
/**
 * @example 统一配置管理
 * 所有基础设施模块共享统一的配置管理
 */
@Module({
  imports: [
    // 配置模块作为全局模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig, DatabaseConfig, RedisConfig, JwtConfig, LoggingConfig],
    }),

    // 其他基础设施模块
    CacheModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('redis'),
      inject: [ConfigService],
    }),

    LoggingModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('logging'),
      inject: [ConfigService],
    }),
  ],
})
export class InfrastructureModule {}
```

---

## 🧪 测试策略

### 单元测试

```typescript
/**
 * @example 基础设施模块单元测试
 */
describe('CacheManagerService', () => {
  let service: CacheManagerService;
  let redisClient: jest.Mocked<Redis>;
  let memoryCache: Map<string, any>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CacheManagerService,
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            setex: jest.fn(),
          },
        },
        {
          provide: 'MEMORY_CACHE',
          useValue: new Map(),
        },
      ],
    }).compile();

    service = module.get<CacheManagerService>(CacheManagerService);
    redisClient = module.get('REDIS_CLIENT');
    memoryCache = module.get('MEMORY_CACHE');
  });

  describe('get', () => {
    it('should return value from memory cache first', async () => {
      memoryCache.set('test-key', 'memory-value');
      redisClient.get.mockResolvedValue('redis-value');

      const result = await service.get('test-key');

      expect(result).toBe('memory-value');
      expect(redisClient.get).not.toHaveBeenCalled();
    });

    it('should fallback to redis cache', async () => {
      redisClient.get.mockResolvedValue('"redis-value"');

      const result = await service.get('test-key');

      expect(result).toBe('redis-value');
      expect(redisClient.get).toHaveBeenCalledWith('test-key');
    });
  });
});
```

### 集成测试

```typescript
/**
 * @example 基础设施模块集成测试
 */
describe('Infrastructure Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should log and cache user session', async () => {
    const cacheManager = app.get(CacheManagerService);
    const logger = app.get(PinoLoggerService);

    // 模拟用户登录
    const sessionData = { userId: 'user-123', role: 'admin' };

    // 缓存会话
    await cacheManager.set('session:user-123', sessionData, 3600);

    // 验证缓存
    const cachedSession = await cacheManager.get('session:user-123');
    expect(cachedSession).toEqual(sessionData);

    // 记录日志
    logger.audit('user_session_created', {
      userId: 'user-123',
      action: 'session_create',
    });
  });
});
```

---

## 📊 性能监控与优化

### 性能指标

```typescript
/**
 * @example 基础设施性能监控
 */
@Injectable()
export class InfrastructureMetricsService {
  private readonly metrics = new Map<string, Histogram>();

  constructor() {
    // 缓存性能指标
    this.metrics.set(
      'cache_operation_duration',
      new Histogram({
        name: 'cache_operation_duration_seconds',
        help: 'Cache operation duration',
        labelNames: ['operation', 'cache_type', 'status'],
      }),
    );

    // 数据库性能指标
    this.metrics.set(
      'database_query_duration',
      new Histogram({
        name: 'database_query_duration_seconds',
        help: 'Database query duration',
        labelNames: ['query_type', 'status'],
      }),
    );

    // 日志性能指标
    this.metrics.set(
      'log_processing_duration',
      new Histogram({
        name: 'log_processing_duration_seconds',
        help: 'Log processing duration',
        labelNames: ['log_level', 'handler'],
      }),
    );
  }

  recordCacheOperation(
    operation: string,
    cacheType: string,
    duration: number,
    status: string,
  ): void {
    this.metrics
      .get('cache_operation_duration')
      .labels(operation, cacheType, status)
      .observe(duration / 1000);
  }
}
```

### 性能优化策略

1. **缓存优化**
   - 多级缓存策略
   - 智能预热机制
   - 缓存命中率监控

2. **数据库优化**
   - 连接池管理
   - 查询优化
   - 索引策略

3. **日志优化**
   - 异步日志处理
   - 批量写入
   - 日志分级存储

---

## 🎯 总结

### 架构优势

1. **🛠️ 统一基础设施**: 所有领域共享统一的基础设施服务
2. **📦 模块化设计**: 独立的基础设施模块，可按需集成
3. **🔧 可插拔架构**: 支持不同技术栈的灵活替换
4. **🚀 高性能**: 针对性能优化的基础服务实现
5. **🔒 安全合规**: 内置安全机制和合规支持

### 业务价值

1. **💰 成本控制**: 统一基础设施减少重复投资
2. **⚡ 开发效率**: 开箱即用的基础服务
3. **🛡️ 风险控制**: 统一的安全和合规管理
4. **📈 可扩展性**: 支持业务快速增长

### 技术收益

1. **🔧 开发效率**: 减少基础设施开发工作量
2. **🧪 质量保证**: 经过充分测试的基础组件
3. **📊 可观测性**: 全面的监控和诊断能力
4. **🔄 可维护性**: 清晰的模块边界和责任划分

---

## 📚 相关文档

本文档与以下文档构成完整体系：

1. **[01-iam-business-requirements.md](./01-iam-business-requirements.md)** - IAM业务需求
2. **[04-project-code-organization-architecture.md](./04-project-code-organization-architecture.md)** - 代码组织架构
3. **[05-shared-layer-development-guide.md](./05-shared-layer-development-guide.md)** - 共享层指南
4. **[08-infrastructure-layer-development-guide.md](./08-infrastructure-layer-development-guide.md)** - 基础设施层指南

**业务需求文档**：

- **[cache-management-business-requirements.md](../../../business-requirements/cache-management-business-requirements.md)** - 缓存管理需求
- **[log-management-business-requirements.md](../../../business-requirements/log-management-business-requirements.md)** - 日志管理需求
- **[security-compliance-business-requirements.md](../../../business-requirements/security-compliance-business-requirements.md)** - 安全合规需求
- **[data-isolation-business-requirements.md](../../../business-requirements/data-isolation-business-requirements.md)** - 数据隔离需求

---

_本文档详细阐述了通用基础设施模块的设计理念、技术实现和最佳实践，为团队提供了构建高质量基础设施的完整指导方案。_
