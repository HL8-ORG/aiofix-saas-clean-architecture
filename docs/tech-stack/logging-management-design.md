# 日志管理设计文档

## 📋 文档信息

- **文档类型**: 日志管理技术设计文档
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 设计版
- **目标读者**: 架构师、技术负责人、开发团队、运维工程师

---

## 🎯 设计目标

### 架构愿景

构建一个高性能、可扩展的日志管理系统，为整个SaaS平台提供统一的日志服务，实现：

- **高性能日志**: 基于Pino的高性能结构化日志记录
- **多租户隔离**: 支持多租户、多组织、多部门的日志隔离
- **完整追踪**: 提供请求追踪、方法追踪、错误追踪
- **智能分析**: 支持日志聚合、分析和监控
- **开发友好**: 提供声明式日志装饰器和AOP支持
- **运维支持**: 提供日志收集、存储、查询和分析能力

### 设计原则

1. **高性能**: 基于Pino的高性能日志记录，最小化对应用性能的影响
2. **结构化**: 提供结构化的JSON日志输出，便于分析和处理
3. **上下文追踪**: 支持请求上下文、租户上下文、用户上下文追踪
4. **多级日志**: 支持不同级别的日志记录和过滤
5. **安全可靠**: 敏感信息过滤、日志完整性保证
6. **可扩展性**: 支持多种日志传输和存储方案

### 技术目标

- 支持高并发的日志记录
- 提供完整的请求追踪能力
- 实现智能日志聚合和分析
- 支持多种日志传输方案
- 确保日志数据完整性和安全性
- 提供完善的监控和运维能力

---

## 🏗️ 架构概览

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application Layer)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ 日志装饰器  │ │ 日志拦截器  │ │ 日志服务    │            │
│  │ (Decorators)│ │ (Interceptors)│ │ (Services)  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                  日志管理层 (Logging Management Layer)       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ 日志管理器  │ │ 日志聚合    │ │ 日志分析    │            │
│  │ (Manager)   │ │ (Aggregation)│ │ (Analytics) │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                  日志服务层 (Logging Service Layer)          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Pino日志    │ │ 日志传输    │ │ 日志存储    │            │
│  │ (Pino)      │ │ (Transport) │ │ (Storage)   │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                  基础设施层 (Infrastructure Layer)           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ 文件系统    │ │ 消息队列    │ │ 监控系统    │            │
│  │ (File System)│ │ (Message Q) │ │ (Monitoring) │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 日志流程架构

```
应用请求 → 日志中间件 → 日志拦截器 → 日志服务 → 日志传输 → 日志存储
    ↓         ↓           ↓           ↓         ↓         ↓
请求追踪   上下文提取   方法追踪    日志记录   格式转换   持久化
    ↓         ↓           ↓           ↓         ↓         ↓
响应记录   性能监控    错误追踪    日志聚合   传输分发   查询分析
```

### 多租户日志隔离

```
租户A日志空间
├── 请求日志 (tenant:A:request:*)
├── 业务日志 (tenant:A:business:*)
├── 错误日志 (tenant:A:error:*)
└── 性能日志 (tenant:A:performance:*)

租户B日志空间
├── 请求日志 (tenant:B:request:*)
├── 业务日志 (tenant:B:business:*)
├── 错误日志 (tenant:B:error:*)
└── 性能日志 (tenant:B:performance:*)
```

---

## 🔄 架构模式说明

### 1. 中间件模式

- **职责**: 处理HTTP请求和响应的日志记录
- **特点**:
  - 自动为每个请求生成唯一ID
  - 记录请求开始和结束时间
  - 计算请求处理时间
  - 支持租户和用户追踪
- **优势**: 自动化日志记录、性能监控、错误追踪

### 2. 拦截器模式

- **职责**: 处理方法调用的日志记录
- **特点**:
  - 记录方法调用的开始和结束
  - 计算方法执行时间
  - 记录方法参数和返回值
  - 支持异常捕获和记录
- **优势**: 方法级追踪、性能分析、调试支持

### 3. 工厂模式

- **职责**: 创建和配置日志器实例
- **特点**:
  - 根据配置创建Pino实例
  - 配置传输器和格式化器
  - 处理不同环境的配置差异
  - 提供统一的创建接口
- **优势**: 配置灵活、环境适配、统一管理

### 4. 装饰器模式

- **职责**: 提供声明式日志记录
- **特点**:
  - 日志级别装饰器
  - 日志上下文装饰器
  - 性能监控装饰器
  - 错误追踪装饰器
- **优势**: 开发友好、代码简洁、易于维护

### 5. 传输模式

- **职责**: 处理日志的传输和存储
- **特点**:
  - 支持多种传输目标
  - 异步传输处理
  - 失败重试机制
  - 批量传输优化
- **优势**: 传输可靠、性能优化、扩展性强

---

## 📦 技术栈选择

### 后端技术栈

- **日志框架**: Pino (Node.js高性能日志库)
- **传输方案**:
  - 文件传输: 本地文件系统
  - 网络传输: HTTP/HTTPS、TCP/UDP
  - 消息队列: Redis、RabbitMQ、Kafka
- **存储方案**:
  - 本地存储: 文件系统
  - 分布式存储: Elasticsearch、MongoDB
  - 云存储: AWS S3、阿里云OSS
- **监控**: Prometheus + Grafana
- **配置管理**: @nestjs/config

### 开发工具

- **版本控制**: Git
- **测试框架**: Jest
- **代码规范**: ESLint + Prettier
- **文档生成**: TypeDoc
- **容器化**: Docker + Docker Compose

---

## 🎯 架构决策记录 (ADR)

### ADR-001: Pino日志框架选择

- **状态**: 已接受
- **背景**: 需要高性能的Node.js日志解决方案
- **决策**: 选择Pino作为核心日志框架
- **影响**:
  - 提供极高的日志性能
  - 支持结构化JSON输出
  - 具备丰富的生态系统

### ADR-002: 结构化日志设计

- **状态**: 已接受
- **背景**: 需要便于分析和处理的日志格式
- **决策**: 采用JSON结构化日志格式
- **影响**:
  - 便于日志分析和处理
  - 支持复杂的查询和过滤
  - 提高日志处理效率

### ADR-003: 多租户日志隔离设计

- **状态**: 已接受
- **背景**: 需要支持多租户的日志隔离
- **决策**: 采用命名空间隔离的日志设计
- **影响**:
  - 支持多租户数据隔离
  - 便于租户级日志管理
  - 提高日志安全性

### ADR-004: 请求追踪设计

- **状态**: 已接受
- **背景**: 需要完整的请求追踪能力
- **决策**: 采用请求ID和上下文传递的追踪机制
- **影响**:
  - 提供完整的请求链路追踪
  - 支持分布式系统追踪
  - 便于问题定位和调试

---

## 🔧 技术实现详解

### 1. 日志模块设计

#### 模块结构

```typescript
// 日志模块主文件
@Global()
@Module({
  imports: [
    // 事件发射器模块，用于日志事件发布
    EventEmitterModule.forRoot(),
    // 上下文本地存储模块，用于请求上下文管理
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          // 设置请求上下文
          cls.set(
            'requestId',
            req.headers['x-request-id'] || cls.get('requestId'),
          );
          cls.set(
            'tenantId',
            req.headers['x-tenant-id'] || cls.get('tenantId'),
          );
          cls.set('userId', req.headers['x-user-id'] || cls.get('userId'));
          cls.set(
            'sessionId',
            req.headers['x-session-id'] || cls.get('sessionId'),
          );
        },
      },
    }),
  ],
  providers: [
    // 日志配置服务
    PinoLoggerConfigService,
    // 日志工厂
    PinoLoggerFactory,
    // 主日志服务
    PinoLoggerService,
    // 日志中间件
    PinoLoggingMiddleware,
    // 日志拦截器
    PinoLoggingInterceptor,
  ],
  exports: [
    // 导出日志服务供其他模块使用
    PinoLoggerService,
    PinoLoggerConfigService,
    PinoLoggerFactory,
    // 导出中间件和拦截器
    PinoLoggingMiddleware,
    PinoLoggingInterceptor,
  ],
})
export class LoggingModule {}
```

### 2. 日志服务接口设计

#### 核心接口定义

```typescript
/**
 * @interface ILoggerService
 * @description 日志服务接口
 */
export interface ILoggerService {
  /**
   * @method debug
   * @description 记录调试日志
   * @param message 日志消息
   * @param context 日志上下文
   * @param metadata 日志元数据
   * @param error 错误对象
   */
  debug(
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
    error?: Error,
  ): void;

  /**
   * @method info
   * @description 记录信息日志
   * @param message 日志消息
   * @param context 日志上下文
   * @param metadata 日志元数据
   * @param error 错误对象
   */
  info(
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
    error?: Error,
  ): void;

  /**
   * @method warn
   * @description 记录警告日志
   * @param message 日志消息
   * @param context 日志上下文
   * @param metadata 日志元数据
   * @param error 错误对象
   */
  warn(
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
    error?: Error,
  ): void;

  /**
   * @method error
   * @description 记录错误日志
   * @param message 日志消息
   * @param context 日志上下文
   * @param metadata 日志元数据
   * @param error 错误对象
   */
  error(
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
    error?: Error,
  ): void;

  /**
   * @method fatal
   * @description 记录致命错误日志
   * @param message 日志消息
   * @param context 日志上下文
   * @param metadata 日志元数据
   * @param error 错误对象
   */
  fatal(
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
    error?: Error,
  ): void;

  /**
   * @method createChildLogger
   * @description 创建子日志器
   * @param context 子日志器上下文
   * @returns 子日志器实例
   */
  createChildLogger(context: Record<string, any>): ILoggerService;

  /**
   * @method getStats
   * @description 获取日志统计信息
   * @returns 日志统计信息
   */
  getStats(): Promise<LogStats>;
}
```

### 3. Pino日志服务实现

#### 服务核心功能

```typescript
/**
 * @class PinoLoggerService
 * @description 基于Pino的日志服务实现
 */
@Injectable()
export class PinoLoggerService implements ILoggerService, OnModuleDestroy {
  private logger: pino.Logger;
  private stats: {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByContext: Record<LogContext, number>;
    totalLogSize: number;
    lastLogTime?: Date;
  };

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: PinoLoggerConfigService,
    private readonly loggerFactory: PinoLoggerFactory,
    private readonly cls: ClsService,
  ) {
    this.initializeStats();
    this.initializeLogger();
  }

  /**
   * @method log
   * @description 通用日志记录方法
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
    error?: Error,
  ): void {
    // 获取请求上下文
    const requestId = this.cls.get('requestId');
    const tenantId = this.cls.get('tenantId');
    const userId = this.cls.get('userId');
    const sessionId = this.cls.get('sessionId');

    // 构建日志数据
    const logData = {
      level,
      message,
      context: context || LogContext.SYSTEM,
      timestamp: new Date().toISOString(),
      requestId,
      tenantId,
      userId,
      sessionId,
      ...metadata,
    };

    // 如果有错误，添加错误信息
    if (error) {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    // 记录日志
    this.logger[level](logData);

    // 更新统计信息
    this.updateStats(level, context);

    // 发布日志事件
    this.eventEmitter.emit('log.recorded', logData);
  }

  /**
   * @method info
   * @description 记录信息日志
   */
  info(
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
    error?: Error,
  ): void {
    this.log('info', message, context, metadata, error);
  }

  /**
   * @method error
   * @description 记录错误日志
   */
  error(
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
    error?: Error,
  ): void {
    this.log('error', message, context, metadata, error);
  }

  /**
   * @method createChildLogger
   * @description 创建子日志器
   */
  createChildLogger(context: Record<string, any>): ILoggerService {
    const childLogger = this.loggerFactory.createChildLogger(
      this.logger,
      context,
    );
    return new PinoLoggerService(
      this.eventEmitter,
      this.configService,
      this.loggerFactory,
      this.cls,
    );
  }
}
```

### 4. 日志中间件实现

#### 中间件设计

```typescript
/**
 * @class PinoLoggingMiddleware
 * @description Pino日志中间件
 */
@Injectable()
export class PinoLoggingMiddleware implements NestMiddleware {
  private readonly sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  private readonly sensitiveFields = ['password', 'token', 'secret'];

  constructor(private readonly logger: PinoLoggerService) {}

  /**
   * @method use
   * @description 中间件主方法
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const tenantId = this.extractTenantId(req);
    const userId = this.extractUserId(req);

    // 创建请求日志数据
    const requestLogData: RequestLogData = {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: this.getClientIp(req),
      tenantId,
      userId,
      startTime,
      headers: this.sanitizeHeaders(req.headers),
      query: req.query,
      body: this.sanitizeBody(req.body),
    };

    // 记录请求开始日志
    this.logRequest(requestLogData);

    // 重写响应方法以捕获响应数据
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    let responseBody: any = null;
    let responseSize = 0;

    res.send = function (body: any): Response {
      responseBody = body;
      responseSize = Buffer.byteLength(body, 'utf8');
      return originalSend.call(this, body);
    };

    res.json = function (body: any): Response {
      responseBody = body;
      responseSize = Buffer.byteLength(JSON.stringify(body), 'utf8');
      return originalJson.call(this, body);
    };

    res.end = function (chunk?: any): Response {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 创建响应日志数据
      const responseLogData: ResponseLogData = {
        ...requestLogData,
        statusCode: res.statusCode,
        duration,
        responseSize,
        responseBody: this.sanitizeResponse(responseBody),
      };

      // 记录响应日志
      this.logResponse(responseLogData);

      return originalEnd.call(this, chunk);
    }.bind(this);

    next();
  }

  /**
   * @method logRequest
   * @description 记录请求日志
   */
  private logRequest(data: RequestLogData): void {
    this.logger.info('HTTP Request', LogContext.HTTP_REQUEST, {
      requestId: data.requestId,
      method: data.method,
      url: data.url,
      userAgent: data.userAgent,
      ip: data.ip,
      tenantId: data.tenantId,
      userId: data.userId,
      headers: data.headers,
      query: data.query,
      body: data.body,
    });
  }

  /**
   * @method logResponse
   * @description 记录响应日志
   */
  private logResponse(data: ResponseLogData): void {
    const level = data.statusCode >= 400 ? 'error' : 'info';
    this.logger[level]('HTTP Response', LogContext.HTTP_REQUEST, {
      requestId: data.requestId,
      method: data.method,
      url: data.url,
      statusCode: data.statusCode,
      duration: data.duration,
      responseSize: data.responseSize,
      tenantId: data.tenantId,
      userId: data.userId,
      responseBody: data.responseBody,
    });
  }
}
```

### 5. 日志拦截器实现

#### 拦截器设计

```typescript
/**
 * @class PinoLoggingInterceptor
 * @description Pino日志拦截器
 */
@Injectable()
export class PinoLoggingInterceptor implements NestInterceptor {
  private readonly sensitiveParameters = [
    'password',
    'token',
    'secret',
    'apikey',
    'api_key',
    'api-key',
  ];

  constructor(private readonly logger: PinoLoggerService) {}

  /**
   * @method intercept
   * @description 拦截器主方法
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const methodId = this.generateMethodId();
    const request = context.switchToHttp().getRequest();

    // 提取上下文信息
    const requestId = request?.requestId;
    const tenantId = request?.tenantId;
    const userId = request?.userId;

    // 获取方法信息
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    // 获取方法参数
    const parameters = this.extractParameters(context);

    // 创建方法日志数据
    const methodLogData: MethodLogData = {
      methodId,
      className,
      methodName,
      startTime,
      requestId,
      tenantId,
      userId,
      parameters: this.sanitizeParameters(parameters),
    };

    // 记录方法开始日志
    this.logMethodStart(methodLogData);

    return next.handle().pipe(
      tap(result => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 记录方法成功日志
        this.logMethodSuccess({
          ...methodLogData,
          result: this.sanitizeResult(result),
          duration,
        });
      }),
      catchError(error => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 记录方法错误日志
        this.logMethodError({
          ...methodLogData,
          error,
          duration,
        });

        return throwError(() => error);
      }),
    );
  }

  /**
   * @method logMethodStart
   * @description 记录方法开始日志
   */
  private logMethodStart(data: MethodLogData): void {
    this.logger.debug('Method Start', LogContext.BUSINESS, {
      methodId: data.methodId,
      className: data.className,
      methodName: data.methodName,
      requestId: data.requestId,
      tenantId: data.tenantId,
      userId: data.userId,
      parameters: data.parameters,
    });
  }

  /**
   * @method logMethodSuccess
   * @description 记录方法成功日志
   */
  private logMethodSuccess(
    data: MethodLogData & { result: any; duration: number },
  ): void {
    this.logger.debug('Method Success', LogContext.BUSINESS, {
      methodId: data.methodId,
      className: data.className,
      methodName: data.methodName,
      requestId: data.requestId,
      tenantId: data.tenantId,
      userId: data.userId,
      result: data.result,
      duration: data.duration,
    });
  }

  /**
   * @method logMethodError
   * @description 记录方法错误日志
   */
  private logMethodError(
    data: MethodLogData & { error: Error; duration: number },
  ): void {
    this.logger.error('Method Error', LogContext.BUSINESS, {
      methodId: data.methodId,
      className: data.className,
      methodName: data.methodName,
      requestId: data.requestId,
      tenantId: data.tenantId,
      userId: data.userId,
      error: data.error,
      duration: data.duration,
    });
  }
}
```

### 6. 日志工厂实现

#### 工厂设计

```typescript
/**
 * @class PinoLoggerFactory
 * @description Pino日志器工厂
 */
@Injectable()
export class PinoLoggerFactory {
  constructor(private readonly configService: PinoLoggerConfigService) {}

  /**
   * @method createLogger
   * @description 创建Pino日志器实例
   */
  createLogger(): pino.Logger {
    const config = this.configService.getConfig();
    const pinoOptions = this.buildPinoOptions(config);
    return pino(pinoOptions);
  }

  /**
   * @method createChildLogger
   * @description 创建子日志器
   */
  createChildLogger(
    parentLogger: pino.Logger,
    childOptions: Record<string, any>,
  ): pino.Logger {
    return parentLogger.child(childOptions);
  }

  /**
   * @private
   * @method buildPinoOptions
   * @description 构建Pino配置选项
   */
  private buildPinoOptions(config: LogConfig): pino.LoggerOptions {
    const pinoOptions: pino.LoggerOptions = {
      level: config.level,
      timestamp: config.timestamp ? pino.stdTimeFunctions.isoTime : false,
    };

    // 配置传输器
    this.configureTransport(pinoOptions, config);

    // 配置格式化器
    this.configureFormatter(pinoOptions, config);

    return pinoOptions;
  }

  /**
   * @private
   * @method configureTransport
   * @description 配置传输器
   */
  private configureTransport(
    pinoOptions: pino.LoggerOptions,
    config: LogConfig,
  ): void {
    // 在开发环境中使用pino-pretty进行格式化
    if (this.configService.shouldUsePrettyFormat()) {
      pinoOptions.transport = {
        target: 'pino-pretty',
        options: {
          colorize: config.colorize,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      };
    }

    // 配置文件传输
    if (config.filePath) {
      pinoOptions.transport = {
        target: 'pino/file',
        options: {
          destination: config.filePath,
          mkdir: true,
        },
      };
    }

    // 配置远程传输
    if (config.remote) {
      pinoOptions.transport = {
        target: 'pino-http-send',
        options: {
          destination: config.remote.url,
          headers: {
            Authorization: `Bearer ${config.remote.token}`,
          },
          timeout: config.remote.timeout,
          retries: config.remote.retries,
        },
      };
    }
  }
}
```

---

## 🎯 使用示例

### 1. 基本日志使用

#### 服务类日志记录

```typescript
/**
 * @class UserService
 * @description 用户服务示例
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method createUser
   * @description 创建用户（带日志记录）
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.info('Creating user', LogContext.BUSINESS, {
      operation: 'create_user',
      resource: 'user',
      email: createUserDto.email,
    });

    try {
      const user = await this.userRepository.create(createUserDto);

      this.logger.info('User created successfully', LogContext.BUSINESS, {
        operation: 'create_user',
        resource: 'user',
        resourceId: user.id,
        email: user.email,
      });

      return user;
    } catch (error) {
      this.logger.error(
        'Failed to create user',
        LogContext.BUSINESS,
        {
          operation: 'create_user',
          resource: 'user',
          email: createUserDto.email,
        },
        error,
      );

      throw error;
    }
  }

  /**
   * @method getUserById
   * @description 获取用户信息（带性能监控）
   */
  async getUserById(id: string): Promise<User> {
    const startTime = Date.now();

    this.logger.debug('Getting user by ID', LogContext.BUSINESS, {
      operation: 'get_user',
      resource: 'user',
      resourceId: id,
    });

    try {
      const user = await this.userRepository.findById(id);

      const duration = Date.now() - startTime;
      this.logger.debug('User retrieved successfully', LogContext.BUSINESS, {
        operation: 'get_user',
        resource: 'user',
        resourceId: id,
        duration,
      });

      return user;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'Failed to get user',
        LogContext.BUSINESS,
        {
          operation: 'get_user',
          resource: 'user',
          resourceId: id,
          duration,
        },
        error,
      );

      throw error;
    }
  }
}
```

### 2. 控制器日志记录

#### API控制器日志

```typescript
/**
 * @class UserController
 * @description 用户控制器示例
 */
@Controller('api/v1/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method createUser
   * @description 创建用户API
   */
  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponse> {
    this.logger.info('API: Creating user', LogContext.HTTP_REQUEST, {
      operation: 'api_create_user',
      resource: 'user',
      email: createUserDto.email,
    });

    const user = await this.userService.createUser(createUserDto);

    this.logger.info(
      'API: User created successfully',
      LogContext.HTTP_REQUEST,
      {
        operation: 'api_create_user',
        resource: 'user',
        resourceId: user.id,
        email: user.email,
      },
    );

    return this.toUserResponse(user);
  }

  /**
   * @method getUser
   * @description 获取用户API
   */
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    this.logger.debug('API: Getting user', LogContext.HTTP_REQUEST, {
      operation: 'api_get_user',
      resource: 'user',
      resourceId: id,
    });

    const user = await this.userService.getUserById(id);

    this.logger.debug(
      'API: User retrieved successfully',
      LogContext.HTTP_REQUEST,
      {
        operation: 'api_get_user',
        resource: 'user',
        resourceId: id,
      },
    );

    return this.toUserResponse(user);
  }
}
```

### 3. 自定义日志上下文

#### 业务上下文日志

```typescript
/**
 * @class OrderService
 * @description 订单服务示例
 */
@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method processOrder
   * @description 处理订单（带业务上下文）
   */
  async processOrder(orderId: string, userId: string): Promise<Order> {
    // 创建业务上下文日志器
    const businessLogger = this.logger.createChildLogger({
      businessContext: 'order_processing',
      orderId,
      userId,
    });

    businessLogger.info('Starting order processing', LogContext.BUSINESS, {
      operation: 'process_order',
      resource: 'order',
      resourceId: orderId,
      userId,
    });

    try {
      // 获取订单
      const order = await this.orderRepository.findById(orderId);
      businessLogger.debug('Order retrieved', LogContext.BUSINESS, {
        operation: 'get_order',
        resource: 'order',
        resourceId: orderId,
        status: order.status,
      });

      // 验证订单
      await this.validateOrder(order);
      businessLogger.debug('Order validated', LogContext.BUSINESS, {
        operation: 'validate_order',
        resource: 'order',
        resourceId: orderId,
      });

      // 处理支付
      await this.processPayment(order);
      businessLogger.info('Payment processed', LogContext.BUSINESS, {
        operation: 'process_payment',
        resource: 'order',
        resourceId: orderId,
        amount: order.amount,
      });

      // 更新订单状态
      const updatedOrder = await this.orderRepository.update(orderId, {
        status: 'completed',
        processedAt: new Date(),
      });

      businessLogger.info('Order processing completed', LogContext.BUSINESS, {
        operation: 'complete_order',
        resource: 'order',
        resourceId: orderId,
        status: updatedOrder.status,
      });

      return updatedOrder;
    } catch (error) {
      businessLogger.error(
        'Order processing failed',
        LogContext.BUSINESS,
        {
          operation: 'process_order',
          resource: 'order',
          resourceId: orderId,
          userId,
        },
        error,
      );

      throw error;
    }
  }
}
```

---

## 📊 监控和运维

### 1. 日志性能监控

#### 监控指标

```typescript
/**
 * @interface LogMetrics
 * @description 日志监控指标
 */
export interface LogMetrics {
  // 基础指标
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  logsByContext: Record<LogContext, number>;

  // 性能指标
  averageLogSize: number;
  totalLogSize: number;
  logsPerSecond: number;

  // 错误指标
  errorCount: number;
  errorRate: number;
  errorTypes: Record<string, number>;

  // 业务指标
  tenantMetrics: Record<string, LogMetrics>;
  userMetrics: Record<string, LogMetrics>;

  // 系统指标
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
}
```

### 2. 日志健康检查

#### 健康检查实现

```typescript
/**
 * @class LoggingHealthService
 * @description 日志健康检查服务
 */
@Injectable()
export class LoggingHealthService {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly configService: PinoLoggerConfigService,
  ) {}

  /**
   * @method checkHealth
   * @description 检查日志系统健康状态
   */
  async checkHealth(): Promise<LogHealth> {
    const startTime = Date.now();

    try {
      // 测试日志记录
      const testMessage = 'Health check test';
      this.logger.info(testMessage, LogContext.SYSTEM, {
        operation: 'health_check',
        timestamp: new Date().toISOString(),
      });

      const responseTime = Date.now() - startTime;

      // 获取日志统计
      const stats = await this.logger.getStats();

      return {
        healthy: true,
        connected: true,
        responseTime,
        stats,
        lastCheck: Date.now(),
      };
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

### 3. 日志聚合和分析

#### 聚合服务实现

```typescript
/**
 * @class LogAggregationService
 * @description 日志聚合服务
 */
@Injectable()
export class LogAggregationService {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.setupEventListeners();
  }

  /**
   * @method setupEventListeners
   * @description 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听日志记录事件
    this.eventEmitter.on('log.recorded', logData => {
      this.processLogEntry(logData);
    });

    // 监听错误日志事件
    this.eventEmitter.on('log.error', errorData => {
      this.processErrorLog(errorData);
    });
  }

  /**
   * @method processLogEntry
   * @description 处理日志条目
   */
  private processLogEntry(logData: LogEntry): void {
    // 按租户聚合
    if (logData.metadata.tenantId) {
      this.aggregateByTenant(logData);
    }

    // 按用户聚合
    if (logData.metadata.userId) {
      this.aggregateByUser(logData);
    }

    // 按上下文聚合
    this.aggregateByContext(logData);

    // 按级别聚合
    this.aggregateByLevel(logData);
  }

  /**
   * @method processErrorLog
   * @description 处理错误日志
   */
  private processErrorLog(errorData: any): void {
    // 错误统计
    this.updateErrorStats(errorData);

    // 错误告警
    this.checkErrorThresholds(errorData);

    // 错误报告
    this.generateErrorReport(errorData);
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
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: logging-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - '9200:9200'
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - logging-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: logging-kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - '5601:5601'
    depends_on:
      - elasticsearch
    networks:
      - logging-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: logging-logstash
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - '5044:5044'
    depends_on:
      - elasticsearch
    networks:
      - logging-network

  prometheus:
    image: prom/prometheus
    container_name: logging-prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - logging-network

  grafana:
    image: grafana/grafana
    container_name: logging-grafana
    ports:
      - '3000:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - logging-network

volumes:
  elasticsearch-data:
  prometheus-data:
  grafana-data:

networks:
  logging-network:
    driver: bridge
```

### 2. 环境变量配置

#### 环境变量示例

```bash
# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json
LOG_COLORIZE=false
LOG_TIMESTAMP=true
LOG_REQUEST_ID=true
LOG_TENANT_ID=true
LOG_USER_ID=true
LOG_PERFORMANCE=true
LOG_STACK_TRACE=true

# 日志文件配置
LOG_FILE_PATH=/var/log/app/app.log
LOG_FILE_MAX_SIZE=100MB
LOG_FILE_MAX_FILES=10
LOG_FILE_INTERVAL=1d

# 远程日志配置
LOG_REMOTE_URL=http://logstash:5044
LOG_REMOTE_TOKEN=your_token
LOG_REMOTE_TIMEOUT=5000
LOG_REMOTE_RETRIES=3

# Elasticsearch配置
ELASTICSEARCH_URL=http://elasticsearch:9200
ELASTICSEARCH_INDEX=app-logs
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# 监控配置
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
```

---

## 📋 总结

### 🎯 日志系统核心特性

1. **高性能日志记录**: 基于Pino的高性能结构化日志
2. **多租户日志隔离**: 支持多租户、多组织、多部门日志隔离
3. **完整请求追踪**: 请求ID、上下文传递、链路追踪
4. **智能日志聚合**: 按租户、用户、上下文、级别聚合
5. **灵活日志传输**: 文件、网络、消息队列多种传输方案
6. **完善监控体系**: 性能监控、健康检查、统计分析
7. **开发友好**: 装饰器、拦截器、中间件支持

### 🔄 与其他系统的关系

```
应用层 → 日志管理层 → 日志服务层 → 基础设施层
   ↓         ↓           ↓           ↓
业务逻辑   日志聚合    日志记录    存储传输
   ↓         ↓           ↓           ↓
性能监控   智能分析    数据隔离    高可用性
```

### 📚 开发流程

1. **需求分析** → 确定日志需求和性能目标
2. **架构设计** → 设计日志架构和传输方案
3. **实现开发** → 开发日志服务和中间件
4. **测试验证** → 性能测试和功能验证
5. **部署上线** → 容器化部署和监控配置
6. **运维监控** → 日志分析和优化调整

### 🚀 快速开始

1. 阅读本文档了解日志系统架构
2. 配置日志环境和相关参数
3. 在业务代码中使用日志服务
4. 配置监控和告警系统
5. 根据业务需求调整日志策略

---

**注意**: 本文档与 `docs/architecture/tech-stack/` 和 `docs/architecture/development/` 中的其他文档保持一致，请结合使用。
