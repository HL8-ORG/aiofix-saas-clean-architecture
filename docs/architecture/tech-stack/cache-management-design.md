# 缓存管理设计文档

## 📋 文档信息

- **文档类型**: 缓存管理技术设计文档
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 设计版
- **目标读者**: 架构师、技术负责人、开发团队、运维工程师

---

## 🎯 设计目标

### 架构愿景
构建一个高性能、可扩展的多级缓存管理系统，为整个SaaS平台提供统一的缓存服务，实现：
- **性能优化**: 通过多级缓存显著提升系统响应速度
- **数据隔离**: 支持多租户、多组织、多部门的数据隔离缓存
- **高可用性**: 提供分布式缓存和故障转移能力
- **智能管理**: 自动缓存失效、预热和优化策略
- **开发友好**: 提供声明式缓存装饰器和AOP支持

### 设计原则
1. **分层缓存**: 实现L1(内存)、L2(Redis)、L3(数据库)三级缓存架构
2. **数据隔离**: 支持多租户、多组织、多部门的数据隔离
3. **策略灵活**: 支持LRU、LFU、FIFO、TTL等多种缓存策略
4. **高可用性**: 提供故障转移和容错机制
5. **监控完善**: 提供完整的缓存性能监控和分析
6. **开发友好**: 提供声明式缓存装饰器和拦截器

### 技术目标
- 支持高并发的缓存访问
- 提供多级缓存架构
- 实现智能缓存失效策略
- 支持缓存预热和优化
- 确保缓存数据一致性
- 提供完善的监控和运维能力

---

## 🏗️ 架构概览

### 整体架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application Layer)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ 缓存装饰器  │ │ 缓存拦截器  │ │ 缓存服务    │            │
│  │ (Decorators)│ │ (Interceptors)│ │ (Services)  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                  缓存管理层 (Cache Management Layer)         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ 缓存管理器  │ │ 缓存失效    │ │ 缓存预热    │            │
│  │ (Manager)   │ │ (Invalidation)│ │ (Warmup)    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                  缓存服务层 (Cache Service Layer)            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ 内存缓存    │ │ Redis缓存   │ │ 混合缓存    │            │
│  │ (Memory)    │ │ (Redis)     │ │ (Hybrid)    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                  基础设施层 (Infrastructure Layer)           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Redis集群   │ │ 内存存储    │ │ 监控系统    │            │
│  │ (Redis Cluster)│ │ (Memory)    │ │ (Monitoring) │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 多级缓存架构
```
应用层 (Application Layer)
├── L1缓存 (内存缓存) - 最快访问，容量有限
│   ├── 用户会话缓存
│   ├── 权限验证缓存
│   └── 热点数据缓存
├── L2缓存 (Redis缓存) - 分布式缓存，容量较大
│   ├── 业务数据缓存
│   ├── 组织架构缓存
│   └── 配置信息缓存
└── L3缓存 (数据库) - 持久化存储，容量最大
    ├── 主数据库
    └── 只读副本
```

### 数据流架构
```
应用请求 → 缓存装饰器 → 缓存拦截器 → 缓存管理器 → 多级缓存 → 数据源
    ↓         ↓           ↓           ↓           ↓         ↓
缓存检查   键生成      策略选择    层级选择    数据获取   数据返回
    ↓         ↓           ↓           ↓           ↓         ↓
缓存命中   缓存存储    缓存失效    缓存预热    监控记录   响应返回
```

---

## 🔄 架构模式说明

### 1. 多级缓存模式
- **职责**: 提供分层缓存架构
- **特点**: 
  - L1缓存提供最快访问速度
  - L2缓存提供分布式存储能力
  - L3缓存提供持久化存储
  - 支持缓存穿透和缓存雪崩防护
- **优势**: 性能优化、容量扩展、故障隔离

### 2. 策略模式
- **职责**: 支持多种缓存策略
- **特点**:
  - LRU策略：最近最少使用
  - LFU策略：最少使用频率
  - FIFO策略：先进先出
  - TTL策略：基于时间过期
- **优势**: 策略灵活、易于扩展、性能优化

### 3. 装饰器模式
- **职责**: 提供声明式缓存支持
- **特点**:
  - 缓存键装饰器
  - 缓存TTL装饰器
  - 缓存失效装饰器
  - 缓存选项装饰器
- **优势**: 开发友好、代码简洁、易于维护

### 4. 拦截器模式
- **职责**: 提供AOP缓存支持
- **特点**:
  - 缓存获取拦截器
  - 缓存设置拦截器
  - 缓存失效拦截器
  - 缓存统计拦截器
- **优势**: 横切关注点、代码复用、性能监控

### 5. 工厂模式
- **职责**: 创建和管理缓存键
- **特点**:
  - 缓存键工厂
  - 命名空间管理
  - 版本控制
  - 标签管理
- **优势**: 键管理统一、命名规范、易于维护

---

## 📦 技术栈选择

### 后端技术栈
- **框架**: NestJS (Node.js + TypeScript)
- **缓存引擎**: 
  - 内存缓存: Node.js内置Map + LRU Cache
  - 分布式缓存: Redis + Redis Cluster
  - 缓存客户端: ioredis
- **监控**: Prometheus + Grafana
- **日志**: Pino + ELK Stack
- **配置管理**: @nestjs/config

### 开发工具
- **版本控制**: Git
- **测试框架**: Jest
- **代码规范**: ESLint + Prettier
- **文档生成**: TypeDoc
- **容器化**: Docker + Docker Compose

---

## 🎯 架构决策记录 (ADR)

### ADR-001: 多级缓存架构选择
- **状态**: 已接受
- **背景**: 需要平衡性能和容量需求
- **决策**: 采用L1(内存) + L2(Redis) + L3(数据库)三级缓存架构
- **影响**: 
  - 提供最佳性能表现
  - 支持大规模数据缓存
  - 实现故障隔离和容错

### ADR-002: Redis作为分布式缓存选择
- **状态**: 已接受
- **背景**: 需要高性能的分布式缓存解决方案
- **决策**: 选择Redis作为L2缓存存储引擎
- **影响**: 
  - 提供高性能的分布式缓存
  - 支持丰富的数据结构
  - 具备完善的集群和哨兵模式

### ADR-003: 声明式缓存装饰器设计
- **状态**: 已接受
- **背景**: 需要提供开发友好的缓存使用方式
- **决策**: 采用装饰器模式提供声明式缓存支持
- **影响**: 
  - 简化缓存使用代码
  - 提高开发效率
  - 保持代码可读性

### ADR-004: 缓存键命名规范设计
- **状态**: 已接受
- **背景**: 需要统一的缓存键命名规范
- **决策**: 采用分层命名规范：{prefix}:{tenantId}:{orgId}:{deptId}:{type}:{id}:{version}
- **影响**: 
  - 支持多租户数据隔离
  - 便于缓存管理和失效
  - 提高缓存命中率

---

## 🔧 技术实现详解

### 1. 缓存模块设计

#### 模块结构
```typescript
// 缓存模块主文件
@Global()
@Module({
  imports: [
    ConfigModule.forFeature(cacheConfig),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          // 从请求头或JWT中提取租户ID和用户ID
          const tenantId = req.headers['x-tenant-id'] || 'system';
          const userId = req.headers['x-user-id'] || 'anonymous';
          cls.set('tenantId', tenantId);
          cls.set('userId', userId);
        },
      },
    }),
  ],
  providers: [
    // 配置提供者
    {
      provide: 'CACHE_CONFIG',
      useFactory: (config: CacheConfig) => config,
      inject: [cacheConfig.KEY],
    },
    // 缓存服务
    RedisCacheService,
    MemoryCacheService,
    CacheManagerService,
    CacheInvalidationService,
    CacheWarmupService,
    // 工厂
    CacheKeyFactory,
    // 拦截器
    CacheInterceptor,
    CacheGetInterceptor,
    CacheSetInterceptor,
  ],
  exports: [
    'CACHE_CONFIG',
    'REDIS_CONFIG',
    ICacheService,
    ICacheManager,
    ICacheKeyFactory,
    ICacheInvalidationService,
  ],
})
export class CacheModule {}
```

### 2. 缓存服务接口设计

#### 核心接口定义
```typescript
/**
 * @interface ICacheService
 * @description 缓存服务接口
 */
export interface ICacheService {
  /**
   * @method get
   * @description 获取缓存值
   * @param key 缓存键
   * @returns 缓存值或null
   */
  get<T = any>(key: string): Promise<T | null>;

  /**
   * @method set
   * @description 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param options 缓存选项
   */
  set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void>;

  /**
   * @method delete
   * @description 删除缓存
   * @param key 缓存键
   */
  delete(key: string): Promise<boolean>;

  /**
   * @method clear
   * @description 清空缓存
   * @param namespace 命名空间（可选）
   */
  clear(namespace?: string): Promise<void>;

  /**
   * @method has
   * @description 检查缓存是否存在
   * @param key 缓存键
   */
  has(key: string): Promise<boolean>;

  /**
   * @method getStats
   * @description 获取缓存统计信息
   */
  getStats(): Promise<CacheStats>;

  /**
   * @method getHealth
   * @description 获取缓存健康状态
   */
  getHealth(): Promise<CacheHealth>;
}
```

### 3. 缓存管理器实现

#### 管理器核心功能
```typescript
/**
 * @class CacheManagerService
 * @description 缓存管理器服务
 */
@Injectable()
export class CacheManagerService implements ICacheService {
  private readonly logger: PinoLoggerService;
  private readonly layers = new Map<string, CacheLayerConfig>();
  private readonly stats = new Map<string, CacheStats>();

  constructor(
    @Inject('CACHE_CONFIG') private readonly config: CacheConfig,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new PinoLoggerService(CacheManagerService.name);
  }

  /**
   * @method get
   * @description 多级缓存获取
   */
  async get<T = any>(key: string): Promise<T | null> {
    const cacheKey = await this.keyFactory.create(key);
    
    // 从L1缓存开始查找
    for (const [layerName, layer] of this.layers) {
      if (!layer.enabled) continue;
      
      try {
        const value = await layer.service.get<T>(cacheKey.key);
        if (value !== null) {
          // 缓存命中，更新统计
          await this.updateStats(layerName, 'hit');
          
          // 如果是L2缓存命中，回填L1缓存
          if (layerName === 'L2' && this.layers.has('L1')) {
            const l1Layer = this.layers.get('L1')!;
            await l1Layer.service.set(cacheKey.key, value, { ttl: 30000 });
          }
          
          return value;
        }
        
        // 缓存未命中，更新统计
        await this.updateStats(layerName, 'miss');
      } catch (error) {
        this.logger.error('Cache layer error', { layer: layerName, key, error });
      }
    }
    
    return null;
  }

  /**
   * @method set
   * @description 多级缓存设置
   */
  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const cacheKey = await this.keyFactory.create(key);
    
    // 并行设置到所有启用的缓存层
    const promises = Array.from(this.layers.values())
      .filter(layer => layer.enabled && !layer.readOnly)
      .map(async (layer) => {
        try {
          await layer.service.set(cacheKey.key, value, options);
        } catch (error) {
          this.logger.error('Cache set error', { layer: layer.name, key, error });
        }
      });
    
    await Promise.all(promises);
    
    // 发布缓存设置事件
    this.eventEmitter.emit('cache.set', { key: cacheKey.key, value, options });
  }
}
```

### 4. 缓存装饰器实现

#### 装饰器设计
```typescript
/**
 * @function Cacheable
 * @description 缓存装饰器
 */
export const Cacheable = (
  key: string | ((args: any[]) => string),
  ttl?: number,
  options?: Partial<CacheOptions>
) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService || 
        Container.get<ICacheService>('ICacheService');
      
      // 生成缓存键
      const cacheKey = typeof key === 'function' ? key(args) : key;
      
      // 尝试从缓存获取
      const cachedValue = await cacheService.get(cacheKey);
      if (cachedValue !== null) {
        return cachedValue;
      }
      
      // 缓存未命中，执行原方法
      const result = await originalMethod.apply(this, args);
      
      // 设置缓存
      await cacheService.set(cacheKey, result, { ttl, ...options });
      
      return result;
    };
    
    return descriptor;
  };
};

/**
 * @function CacheEvict
 * @description 缓存失效装饰器
 */
export const CacheEvict = (
  keys: string | string[] | ((args: any[]) => string | string[])
) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService || 
        Container.get<ICacheService>('ICacheService');
      
      // 执行原方法
      const result = await originalMethod.apply(this, args);
      
      // 生成要失效的键
      const keysToEvict = typeof keys === 'function' ? keys(args) : keys;
      const keyArray = Array.isArray(keysToEvict) ? keysToEvict : [keysToEvict];
      
      // 失效缓存
      await Promise.all(
        keyArray.map(key => cacheService.delete(key))
      );
      
      return result;
    };
    
    return descriptor;
  };
};
```

### 5. 缓存拦截器实现

#### 拦截器设计
```typescript
/**
 * @class CacheInterceptor
 * @description 缓存拦截器
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: ICacheService,
    private readonly keyFactory: ICacheKeyFactory,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // 检查是否需要缓存
    const cacheMetadata = Reflect.getMetadata(CACHE_KEY_METADATA, context.getHandler());
    if (!cacheMetadata) {
      return next.handle();
    }
    
    // 生成缓存键
    const cacheKey = await this.keyFactory.create(cacheMetadata, request);
    
    // 尝试从缓存获取
    const cachedValue = await this.cacheService.get(cacheKey);
    if (cachedValue !== null) {
      return of(cachedValue);
    }
    
    // 缓存未命中，执行原方法
    return next.handle().pipe(
      tap(async (data) => {
        // 设置缓存
        const ttl = Reflect.getMetadata(CACHE_TTL_METADATA, context.getHandler());
        await this.cacheService.set(cacheKey, data, { ttl });
      })
    );
  }
}
```

### 6. 缓存配置管理

#### 配置设计
```typescript
/**
 * @interface CacheConfig
 * @description 缓存配置接口
 */
export interface CacheConfig {
  /** Redis配置 */
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    connectTimeout: number;
    commandTimeout: number;
    retries: number;
    retryDelay: number;
    cluster: boolean;
    sentinel: boolean;
    sentinels?: Array<{ host: string; port: number }>;
    name?: string;
  };

  /** 内存缓存配置 */
  memory: {
    defaultTtl: number;
    maxSize: number;
    cleanupInterval: number;
    enableCompression: boolean;
    enableEncryption: boolean;
  };

  /** 缓存管理器配置 */
  manager: {
    enabled: boolean;
    defaultStrategy: CacheStrategy;
    monitoringInterval: number;
    cleanupInterval: number;
    maxSize: number;
    enableStats: boolean;
    enableEvents: boolean;
  };

  /** 缓存TTL配置 */
  ttl: {
    userPermissions: number;
    userProfile: number;
    userSessions: number;
    orgTree: number;
    orgInfo: number;
    tenantInfo: number;
    tenantConfig: number;
    rolePermissions: number;
    roleTemplates: number;
    systemConfig: number;
    apiRateLimit: number;
  };
}

/**
 * @function cacheConfig
 * @description 缓存配置工厂
 */
export const cacheConfig = registerAs('cache', (): CacheConfig => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10),
    retries: parseInt(process.env.REDIS_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000', 10),
    cluster: process.env.REDIS_CLUSTER === 'true',
    sentinel: process.env.REDIS_SENTINEL === 'true',
    sentinels: process.env.REDIS_SENTINELS ? 
      JSON.parse(process.env.REDIS_SENTINELS) : undefined,
    name: process.env.REDIS_NAME || 'mymaster',
  },
  memory: {
    defaultTtl: parseInt(process.env.MEMORY_CACHE_TTL || '300000', 10),
    maxSize: parseInt(process.env.MEMORY_CACHE_MAX_SIZE || '1000', 10),
    cleanupInterval: parseInt(process.env.MEMORY_CACHE_CLEANUP_INTERVAL || '60000', 10),
    enableCompression: process.env.MEMORY_CACHE_COMPRESSION === 'true',
    enableEncryption: process.env.MEMORY_CACHE_ENCRYPTION === 'true',
  },
  manager: {
    enabled: process.env.CACHE_MANAGER_ENABLED !== 'false',
    defaultStrategy: (process.env.CACHE_DEFAULT_STRATEGY as CacheStrategy) || CacheStrategy.LRU,
    monitoringInterval: parseInt(process.env.CACHE_MONITORING_INTERVAL || '30000', 10),
    cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || '300000', 10),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '10000', 10),
    enableStats: process.env.CACHE_ENABLE_STATS !== 'false',
    enableEvents: process.env.CACHE_ENABLE_EVENTS !== 'false',
  },
  ttl: {
    userPermissions: parseInt(process.env.CACHE_TTL_USER_PERMISSIONS || '300000', 10),
    userProfile: parseInt(process.env.CACHE_TTL_USER_PROFILE || '600000', 10),
    userSessions: parseInt(process.env.CACHE_TTL_USER_SESSIONS || '1800000', 10),
    orgTree: parseInt(process.env.CACHE_TTL_ORG_TREE || '900000', 10),
    orgInfo: parseInt(process.env.CACHE_TTL_ORG_INFO || '600000', 10),
    tenantInfo: parseInt(process.env.CACHE_TTL_TENANT_INFO || '900000', 10),
    tenantConfig: parseInt(process.env.CACHE_TTL_TENANT_CONFIG || '1800000', 10),
    rolePermissions: parseInt(process.env.CACHE_TTL_ROLE_PERMISSIONS || '600000', 10),
    roleTemplates: parseInt(process.env.CACHE_TTL_ROLE_TEMPLATES || '3600000', 10),
    systemConfig: parseInt(process.env.CACHE_TTL_SYSTEM_CONFIG || '3600000', 10),
    apiRateLimit: parseInt(process.env.CACHE_TTL_API_RATE_LIMIT || '60000', 10),
  },
}));
```

---

## 🎯 使用示例

### 1. 基本缓存使用

#### 服务类缓存装饰器
```typescript
/**
 * @class UserService
 * @description 用户服务示例
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cacheService: ICacheService,
  ) {}

  /**
   * @method getUserById
   * @description 获取用户信息（带缓存）
   */
  @Cacheable('user:{id}', 300000) // 缓存5分钟
  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  /**
   * @method updateUser
   * @description 更新用户信息（失效缓存）
   */
  @CacheEvict('user:{id}')
  async updateUser(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.update(id, updateData);
    return user;
  }

  /**
   * @method deleteUser
   * @description 删除用户（失效相关缓存）
   */
  @CacheEvict(['user:{id}', 'user:list:*'])
  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
```

### 2. 控制器缓存拦截器

#### API控制器缓存
```typescript
/**
 * @class UserController
 * @description 用户控制器示例
 */
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @method getUser
   * @description 获取用户信息（自动缓存）
   */
  @Get(':id')
  @CacheKey('user:{id}')
  @CacheTTL(300000)
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    return this.userService.getUserById(id);
  }

  /**
   * @method getUsers
   * @description 获取用户列表（带分页缓存）
   */
  @Get()
  @CacheKey('users:list:{page}:{limit}:{search}')
  @CacheTTL(60000)
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<PaginatedResponse<UserResponse>> {
    return this.userService.getUsers({ page, limit, search });
  }
}
```

### 3. 自定义缓存键工厂

#### 缓存键生成
```typescript
/**
 * @class CustomCacheKeyFactory
 * @description 自定义缓存键工厂
 */
@Injectable()
export class CustomCacheKeyFactory implements ICacheKeyFactory {
  async create(
    template: string,
    context?: any,
    options?: CacheKeyOptions
  ): Promise<CacheKey> {
    // 提取租户ID和用户ID
    const tenantId = context?.tenantId || 'system';
    const userId = context?.userId || 'anonymous';
    
    // 替换模板变量
    let key = template
      .replace('{tenantId}', tenantId)
      .replace('{userId}', userId);
    
    // 替换其他变量
    if (context?.params) {
      Object.entries(context.params).forEach(([k, v]) => {
        key = key.replace(`{${k}}`, String(v));
      });
    }
    
    return {
      key: `cache:${tenantId}:${key}`,
      namespace: options?.namespace || 'default',
      version: options?.version || 'v1',
      tenantId,
      userId,
      tags: options?.tags || [],
    };
  }
}
```

---

## 📊 监控和运维

### 1. 缓存性能监控

#### 监控指标
```typescript
/**
 * @interface CacheMetrics
 * @description 缓存监控指标
 */
export interface CacheMetrics {
  // 基础指标
  totalRequests: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  
  // 性能指标
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  
  // 容量指标
  totalSize: number;
  itemCount: number;
  maxCapacity: number;
  
  // 错误指标
  errorCount: number;
  errorRate: number;
  
  // 业务指标
  tenantMetrics: Record<string, CacheMetrics>;
  layerMetrics: Record<string, CacheMetrics>;
}
```

### 2. 健康检查

#### 健康检查实现
```typescript
/**
 * @class CacheHealthService
 * @description 缓存健康检查服务
 */
@Injectable()
export class CacheHealthService {
  constructor(
    private readonly cacheService: ICacheService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method checkHealth
   * @description 检查缓存健康状态
   */
  async checkHealth(): Promise<CacheHealth> {
    const startTime = Date.now();
    
    try {
      // 测试缓存连接
      const testKey = 'health:check';
      const testValue = { timestamp: Date.now() };
      
      await this.cacheService.set(testKey, testValue, { ttl: 1000 });
      const retrievedValue = await this.cacheService.get(testKey);
      
      const responseTime = Date.now() - startTime;
      
      if (retrievedValue && retrievedValue.timestamp === testValue.timestamp) {
        return {
          healthy: true,
          connected: true,
          responseTime,
          lastCheck: Date.now(),
        };
      } else {
        return {
          healthy: false,
          connected: false,
          responseTime,
          error: 'Cache read/write test failed',
          lastCheck: Date.now(),
        };
      }
    } catch (error) {
      return {
        healthy: false,
        connected: false,
        responseTime: Date.now() - startTime,
        error: error.message,
        lastCheck: Date.now(),
      };
    }
  }
}
```

### 3. 缓存预热

#### 预热服务实现
```typescript
/**
 * @class CacheWarmupService
 * @description 缓存预热服务
 */
@Injectable()
export class CacheWarmupService {
  constructor(
    private readonly cacheService: ICacheService,
    private readonly userService: UserService,
    private readonly orgService: OrganizationService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method warmup
   * @description 执行缓存预热
   */
  async warmup(): Promise<void> {
    this.logger.info('Starting cache warmup');
    
    try {
      // 预热用户权限缓存
      await this.warmupUserPermissions();
      
      // 预热组织架构缓存
      await this.warmupOrganizationTree();
      
      // 预热系统配置缓存
      await this.warmupSystemConfig();
      
      this.logger.info('Cache warmup completed successfully');
    } catch (error) {
      this.logger.error('Cache warmup failed', { error });
      throw error;
    }
  }

  /**
   * @method warmupUserPermissions
   * @description 预热用户权限缓存
   */
  private async warmupUserPermissions(): Promise<void> {
    const users = await this.userService.getAllActiveUsers();
    
    for (const user of users) {
      try {
        await this.userService.getUserPermissions(user.id);
      } catch (error) {
        this.logger.warn('Failed to warmup user permissions', { userId: user.id, error });
      }
    }
  }
}
```

---

## 🚀 部署和配置

### 1. Docker配置

#### Docker Compose配置
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: cache-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    networks:
      - cache-network

  redis-cluster:
    image: redis:7-alpine
    container_name: cache-redis-cluster
    ports:
      - "7000:7000"
      - "7001:7001"
      - "7002:7002"
    volumes:
      - ./redis-cluster.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - cache-network

  cache-monitor:
    image: prom/prometheus
    container_name: cache-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - cache-network

volumes:
  redis-data:
  prometheus-data:

networks:
  cache-network:
    driver: bridge
```

### 2. 环境变量配置

#### 环境变量示例
```bash
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
REDIS_CLUSTER=false
REDIS_SENTINEL=false

# 缓存配置
CACHE_MANAGER_ENABLED=true
CACHE_DEFAULT_STRATEGY=lru
CACHE_MONITORING_INTERVAL=30000
CACHE_CLEANUP_INTERVAL=300000
CACHE_MAX_SIZE=10000
CACHE_ENABLE_STATS=true
CACHE_ENABLE_EVENTS=true

# 缓存TTL配置
CACHE_TTL_USER_PERMISSIONS=300000
CACHE_TTL_USER_PROFILE=600000
CACHE_TTL_USER_SESSIONS=1800000
CACHE_TTL_ORG_TREE=900000
CACHE_TTL_TENANT_INFO=900000
```

---

## 📋 总结

### 🎯 缓存系统核心特性

1. **多级缓存架构**: L1(内存) + L2(Redis) + L3(数据库)三级缓存
2. **数据隔离支持**: 多租户、多组织、多部门数据隔离
3. **灵活缓存策略**: LRU、LFU、FIFO、TTL等多种策略
4. **声明式缓存**: 装饰器和拦截器支持
5. **智能缓存管理**: 自动失效、预热、优化
6. **完善监控体系**: 性能监控、健康检查、统计分析
7. **高可用设计**: 故障转移、容错机制、集群支持

### 🔄 与其他系统的关系

```
应用层 → 缓存管理层 → 缓存服务层 → 基础设施层
   ↓         ↓           ↓           ↓
业务逻辑   缓存策略    缓存实现    存储引擎
   ↓         ↓           ↓           ↓
性能优化   智能管理    数据隔离    高可用性
```

### 📚 开发流程

1. **需求分析** → 确定缓存需求和性能目标
2. **架构设计** → 设计缓存架构和策略
3. **实现开发** → 开发缓存服务和装饰器
4. **测试验证** → 性能测试和功能验证
5. **部署上线** → 容器化部署和监控配置
6. **运维监控** → 性能监控和优化调整

### 🚀 快速开始

1. 阅读本文档了解缓存系统架构
2. 配置Redis环境和相关参数
3. 在业务代码中使用缓存装饰器
4. 配置监控和告警系统
5. 根据业务需求调整缓存策略

---

**注意**: 本文档与 `docs/architecture/tech-stack/` 和 `docs/architecture/development/` 中的其他文档保持一致，请结合使用。
