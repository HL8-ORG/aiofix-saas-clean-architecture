# 混合架构应用层开发指南

## RESTful API + 事件溯源 + CQRS

## 📋 文档信息

- **文档类型**: 混合架构应用层开发指南
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 正式版
- **目标读者**: 开发团队
- **架构愿景**: 对外简洁、对内强大、历史完整

---

## 🎯 架构愿景与核心原则

### 混合架构目标

构建一个结合RESTful API、事件溯源和CQRS的混合架构，实现：

- **对外简洁**: 提供标准化的RESTful API接口，易于理解和集成
- **对内强大**: 获得事件溯源的历史追踪能力和CQRS的性能优势
- **历史完整**: 通过事件溯源记录完整的业务历史
- **性能优化**: 通过CQRS优化查询性能

### 架构分层与事件流

```
展现层 (Presentation) ← RESTful API
    ↓ 直接调用
应用层 (Application) ← Use-Case业务编排
    ↓ 使用
CQRS层 (Commands/Queries) ← 命令查询分离
    ↓ 操作
领域层 (Domain) ← 聚合根 + 领域事件
    ↓ 发布事件
事件存储 (Event Store) ← 事件溯源
    ↓ 触发
事件处理器 (Event Handlers) ← 更新查询模型
```

### 职责分工与事件溯源

- **Use-Case**: 应用层业务逻辑编排，协调命令和查询，实现业务流程
- **Command**: 状态变更操作，触发聚合根业务逻辑，产生领域事件
- **Query**: 数据查询操作，从读模型获取数据，支持复杂查询
- **Handler**: 命令/查询处理器，操作聚合根，发布/处理事件
- **Event**: 领域事件，记录业务状态变更，存储到事件存储
- **Event Handler**: 事件处理器，更新查询模型，实现最终一致性
- **DTO**: 数据传输对象，用于跨层数据传递

### 事件溯源核心价值

1. **完整历史追踪**: 记录所有业务状态变更，支持审计和合规
2. **状态重建**: 通过事件重放重建任意时点的业务状态
3. **时间旅行查询**: 查询历史状态，分析业务演进过程
4. **最终一致性**: 通过事件异步更新查询模型
5. **系统集成**: 通过事件实现系统间的松耦合集成

---

## 📁 目录结构

```
src/{subdomain}/
├── domain/              # 领域层
├── application/         # 应用层
│   ├── use-cases/      # Use-Case（核心）
│   ├── commands/       # 命令
│   │   └── handlers/   # 命令处理器
│   ├── queries/        # 查询
│   │   └── handlers/   # 查询处理器
│   ├── dtos/          # 数据传输对象
│   ├── index.ts       # 导出文件
│   └── {subdomain}.module.ts # 应用层模块
└── presentation/       # 展现层
    ├── controllers/    # 控制器
    └── {subdomain}-presentation.module.ts
```

---

## 🔧 开发步骤

### 步骤1: 创建DTO

```typescript
// create-{entity}.dto.ts
export class Create{Entity}Dto {
  @ApiProperty({ description: '字段描述' })
  @IsString()
  @IsNotEmpty()
  readonly field!: string;
}

// {entity}-response.dto.ts
export class {Entity}ResponseDto {
  @ApiProperty({ description: '字段描述' })
  public readonly field: string;

  static fromEntity(entity: {Entity}): {Entity}ResponseDto {
    return Object.assign(new {Entity}ResponseDto(), {
      field: entity.field.value,
    });
  }
}
```

### 步骤2: 创建Command/Query

```typescript
// commands/create-{entity}.command.ts
export class Create{Entity}Command extends BaseCommand {
  constructor(
    public readonly field: string,
    // 其他字段
  ) {
    super();
  }
}

// queries/get-{entity}.query.ts
export class Get{Entity}Query extends BaseQuery {
  constructor(public readonly id: string) {
    super();
  }
}
```

### 步骤3: 创建Handler

```typescript
// commands/handlers/create-{entity}.handler.ts
@Injectable()
export class Create{Entity}Handler implements ICommandHandler<Create{Entity}Command> {
  constructor(
    private readonly repository: {Entity}Repository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: Create{Entity}Command): Promise<string> {
    // 1. 业务验证
    // 2. 创建聚合根
    // 3. 保存到仓储
    // 4. 发布事件
    // 5. 返回结果
  }
}

// queries/handlers/get-{entity}.handler.ts
@Injectable()
export class Get{Entity}Handler implements IQueryHandler<Get{Entity}Query> {
  constructor(private readonly repository: {Entity}ReadRepository) {}

  async execute(query: Get{Entity}Query): Promise<{Entity}ResponseDto> {
    // 1. 查询数据
    // 2. 转换为DTO
    // 3. 返回结果
  }
}
```

### 步骤4: 创建领域事件

```typescript
// domain/events/{entity}-created.event.ts
export class {Entity}CreatedEvent extends BaseEvent {
  constructor(
    public readonly {entity}Id: string,
    public readonly field: string,
    // 其他事件数据
  ) {
    super();
  }
}

// domain/events/{entity}-updated.event.ts
export class {Entity}UpdatedEvent extends BaseEvent {
  constructor(
    public readonly {entity}Id: string,
    public readonly updateData: Partial<Update{Entity}Dto>,
  ) {
    super();
  }
}
```

### 步骤5: 创建事件处理器

```typescript
// application/events/handlers/{entity}-created.handler.ts
@Injectable()
export class {Entity}CreatedEventHandler implements IEventHandler<{Entity}CreatedEvent> {
  constructor(
    private readonly {entity}ReadRepository: {Entity}ReadRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async handle(event: {Entity}CreatedEvent): Promise<void> {
    // 1. 更新查询模型
    await this.{entity}ReadRepository.create({
      id: event.{entity}Id,
      field: event.field,
      createdAt: new Date(),
    });

    // 2. 发送通知
    await this.notificationService.send{Entity}CreatedNotification(event);

    // 3. 记录审计日志
    await this.auditService.log{Entity}Creation(event);
  }
}
```

### 步骤6: 更新聚合根以发布事件

```typescript
// domain/entities/{entity}.entity.ts
export class {Entity} extends AggregateRoot {
  static create(field: string): {Entity} {
    const entity = new {Entity}();
    entity.id = Uuid.generate();
    entity.field = new Field(field);

    // 发布领域事件
    entity.apply(new {Entity}CreatedEvent(entity.id.value, field));

    return entity;
  }

  update(updateData: Partial<Update{Entity}Dto>): void {
    // 更新实体状态
    if (updateData.field) {
      this.field = new Field(updateData.field);
    }

    // 发布更新事件
    this.apply(new {Entity}UpdatedEvent(this.id.value, updateData));
  }
}
```

### 步骤7: 创建Use-Case

```typescript
// use-cases/create-{entity}.use-case.ts
@Injectable()
export class Create{Entity}UseCase implements IUseCase<Create{Entity}Dto, {Entity}ResponseDto> {
  constructor(
    private readonly commandBus: ICommandBus,
    private readonly queryBus: IQueryBus,
  ) {}

  async execute(dto: Create{Entity}Dto): Promise<{Entity}ResponseDto> {
    // 1. 创建命令
    const command = new Create{Entity}Command(dto.field);

    // 2. 执行命令（会触发事件）
    const id = await this.commandBus.execute(command);

    // 3. 查询结果（从读模型）
    const query = new Get{Entity}Query(id);
    return this.queryBus.execute(query);
  }
}
```

### 步骤8: 创建控制器

```typescript
// presentation/controllers/{entity}.controller.ts
@ApiTags('{Entity}管理')
@Controller('api/v1/{entities}')
export class {Entity}Controller {
  constructor(
    private readonly create{Entity}UseCase: Create{Entity}UseCase,
    private readonly get{Entity}UseCase: Get{Entity}UseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建{Entity}' })
  async create(@Body() dto: Create{Entity}Dto): Promise<{Entity}ResponseDto> {
    return this.create{Entity}UseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取{Entity}' })
  async get(@Param('id') id: string): Promise<{Entity}ResponseDto> {
    return this.get{Entity}UseCase.execute(id);
  }
}
```

### 步骤9: 配置CQRS模块

```typescript
// application/{entity}.module.ts
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule, // NestJS CQRS 支持
  ],
  providers: [
    // Use-Cases
    Create{Entity}UseCase,
    Get{Entity}UseCase,
    Update{Entity}UseCase,
    Delete{Entity}UseCase,

    // Command Handlers
    Create{Entity}Handler,
    Update{Entity}Handler,
    Delete{Entity}Handler,

    // Query Handlers
    Get{Entity}Handler,
    Get{Entity}sHandler,

    // Event Handlers
    {Entity}CreatedEventHandler,
    {Entity}UpdatedEventHandler,
    {Entity}DeletedEventHandler,
  ],
  exports: [
    Create{Entity}UseCase,
    Get{Entity}UseCase,
    Update{Entity}UseCase,
    Delete{Entity}UseCase,
  ],
})
export class {Entity}ApplicationModule {}

// presentation/{entity}-presentation.module.ts
@Module({
  imports: [{Entity}ApplicationModule],
  controllers: [{Entity}Controller],
  exports: [{Entity}Controller],
})
export class {Entity}PresentationModule {}

// {entity}.module.ts
@Module({
  imports: [
    {Entity}ApplicationModule,
    {Entity}PresentationModule,
    {Entity}DomainModule, // 领域层模块
    {Entity}InfrastructureModule, // 基础设施层模块
  ],
  exports: [
    {Entity}ApplicationModule,
    {Entity}PresentationModule,
  ],
})
export class {Entity}Module {}
```

---

## ⚠️ 关键要点

### DO ✅ 事件溯源最佳实践

1. **控制器直接使用Use-Case**：保持RESTful API简洁
2. **聚合根必须发布领域事件**：记录所有状态变更
3. **事件处理器更新查询模型**：实现CQRS读写分离
4. **所有业务操作通过事件记录**：确保完整的审计追踪
5. **事件数据包含完整上下文**：便于事件重放和状态重建
6. **Use-Case协调命令和查询**：实现业务流程编排
7. **读写模型独立设计**：优化查询性能
8. **事件存储不可变**：保证历史数据完整性

### DON'T ❌ 事件溯源反模式

1. **不要跳过事件发布**：所有状态变更必须通过事件记录
2. **不要在事件中包含可变数据**：事件应该是不可变的
3. **不要直接修改查询模型**：只能通过事件处理器更新
4. **不要混合命令和查询数据库**：严格分离读写存储
5. **不要忽略事件版本控制**：确保事件模式演进兼容性
6. **不要在聚合根间直接引用**：通过事件实现松耦合
7. **不要删除历史事件**：事件存储是系统的真实来源
8. **不要忽略最终一致性**：接受异步事件处理的延迟

---

## 🏗️ 事件溯源架构模板

### 基础CRUD + 事件溯源模板

```typescript
// 1. 创建操作流程
API请求 → CreateDto → CreateCommand → CommandHandler → 聚合根 → 领域事件 → 事件存储
                                                                    ↓
                                                              事件处理器 → 更新查询模型

// 2. 查询操作流程
API请求 → GetDto → GetQuery → QueryHandler → 查询模型 → 返回结果

// 3. 更新操作流程
API请求 → UpdateDto → UpdateCommand → CommandHandler → 聚合根 → 领域事件 → 事件存储
                                                                      ↓
                                                              事件处理器 → 更新查询模型
```

### 事件溯源完整流程

```typescript
// 混合架构完整流程
@Injectable()
export class Create{Entity}UseCase {
  async execute(dto: Create{Entity}Dto): Promise<{Entity}ResponseDto> {
    // 1. 业务验证（应用层）
    await this.validateBusinessRules(dto);

    // 2. 创建命令
    const command = new Create{Entity}Command(dto);

    // 3. 执行命令 → 聚合根 → 领域事件 → 事件存储
    const entityId = await this.commandBus.execute(command);

    // 4. 查询结果（从读模型，可能需要等待事件处理完成）
    const query = new Get{Entity}Query(entityId);
    return this.queryBus.execute(query);
  }
}

// 事件处理器自动处理
@EventHandler({Entity}CreatedEvent)
export class {Entity}CreatedEventHandler {
  async handle(event: {Entity}CreatedEvent): Promise<void> {
    // 1. 更新查询模型
    await this.updateReadModel(event);

    // 2. 发送通知
    await this.sendNotifications(event);

    // 3. 集成其他系统
    await this.integrateExternalSystems(event);
  }
}
```

### 复杂业务流程模板

```typescript
// 复杂业务流程（多聚合根协调）
@Injectable()
export class User{Entity}RegistrationUseCase {
  async execute(dto: UserRegistrationDto): Promise<RegistrationResult> {
    // 1. 用户注册命令
    const createUserCommand = new CreateUserCommand(dto);
    const userId = await this.commandBus.execute(createUserCommand);

    // 2. 分配默认角色命令
    const assignRoleCommand = new AssignDefaultRoleCommand(userId);
    await this.commandBus.execute(assignRoleCommand);

    // 3. 创建用户档案命令
    const createProfileCommand = new CreateUserProfileCommand(userId, dto);
    await this.commandBus.execute(createProfileCommand);

    // 4. 查询注册结果
    const query = new GetUserQuery(userId);
    const user = await this.queryBus.execute(query);

    // 5. 返回结果
    return {
      user,
      registrationComplete: true,
      message: '用户注册成功，欢迎使用系统！'
    };
  }
}
```

---

## 📝 注释规范

```typescript
/**
 * @class ClassName
 * @description 类的描述
 *
 * 主要原理与机制：
 * 1. 原理1
 * 2. 原理2
 *
 * 功能与业务规则：
 * 1. 功能1
 * 2. 功能2
 */
```

---

## 🔍 常见问题与技术实现

### Q: 什么时候需要Service层？

A: 只有在需要协调多个Use-Case或处理跨领域业务时才创建Service层。

### Q: Use-Case和Handler的区别？

A:

- **Use-Case**: 应用层业务逻辑，包含业务流程编排、业务验证、事务控制
- **Handler**: 技术实现层，负责与数据库、外部服务等基础设施交互
- **关系**: Use-Case调用Handler来完成技术操作，但业务决策在Use-Case中

### Q: 如何配置NestJS CQRS？

A: 在应用模块中导入CqrsModule：

```typescript
// app.module.ts
@Module({
  imports: [
    CqrsModule.forRoot(),
    // 其他模块
  ],
})
export class AppModule {}

// 在应用层模块中使用
@Module({
  imports: [CqrsModule],
  providers: [
    // Use-Cases, Handlers, Event Handlers
  ],
})
export class {Entity}ApplicationModule {}
```

### Q: 如何处理事务？

A: 在Use-Case层使用事务装饰器，确保业务操作的原子性：

```typescript
@Injectable()
export class Create{Entity}UseCase {
  @Transactional() // 事务装饰器
  async execute(dto: Create{Entity}Dto): Promise<{Entity}ResponseDto> {
    // 业务操作会在事务中执行
  }
}
```

### Q: 如何处理权限验证？

A: 在控制器层使用守卫（Guard）进行权限验证：

```typescript
@Controller('api/v1/{entities}')
@UseGuards(JwtAuthGuard, RoleGuard) // 权限守卫
export class {Entity}Controller {
  @Post()
  @RequirePermissions('create:{entity}') // 权限装饰器
  async create(@Body() dto: Create{Entity}Dto) {
    // 控制器逻辑
  }
}
```

### Q: 如何处理事件处理器失败？

A: 使用事件处理器基类提供的重试机制：

```typescript
@EventsHandler({Entity}CreatedEvent)
export class {Entity}CreatedEventHandler extends BaseEventHandler<{Entity}CreatedEvent> {
  constructor() {
    super({
      retryCount: 3,
      retryDelay: 1000,
      enableDlq: true, // 死信队列
    });
  }

  async processEvent(event: {Entity}CreatedEvent): Promise<void> {
    // 事件处理逻辑
  }
}
```

### Q: 如何实现事件版本控制？

A: 在事件类中添加版本信息：

```typescript
export class {Entity}CreatedEvent extends BaseEvent {
  readonly version = 1; // 事件版本

  constructor(data: {Entity}CreatedEventData) {
    super();
    this.eventType = '{Entity}Created';
    this.eventVersion = this.version;
  }

  // 事件升级处理
  static fromPreviousVersion(oldEvent: any): {Entity}CreatedEvent {
    // 处理事件版本升级逻辑
  }
}
```

### Q: 如何实现读写模型分离？

A: 使用不同的仓储接口：

```typescript
// 写模型仓储（领域层）
export interface {Entity}Repository {
  save(entity: {Entity}): Promise<void>;
  findById(id: string): Promise<{Entity} | null>;
}

// 读模型仓储（应用层）
export interface {Entity}ReadRepository {
  findById(id: string): Promise<{Entity}ReadModel | null>;
  findAll(query: {Entity}Query): Promise<PaginatedResult<{Entity}ReadModel>>;
}
```

### Q: 如何处理最终一致性？

A: 通过事件处理器异步更新读模型：

```typescript
@EventsHandler({Entity}CreatedEvent)
export class {Entity}ReadModelUpdater {
  async handle(event: {Entity}CreatedEvent): Promise<void> {
    // 异步更新读模型
    await this.{entity}ReadRepository.create({
      id: event.{entity}Id,
      // 其他字段
      lastUpdated: new Date(),
    });
  }
}
```

---

## ⚡ 性能优化建议

### 事件处理优化

```typescript
// 1. 批量事件处理
@EventsHandler({Entity}CreatedEvent)
export class {Entity}BatchProcessor {
  private eventBatch: {Entity}CreatedEvent[] = [];
  private batchTimer: NodeJS.Timeout;

  async handle(event: {Entity}CreatedEvent): Promise<void> {
    this.eventBatch.push(event);

    if (this.eventBatch.length >= BATCH_SIZE) {
      await this.processBatch();
    } else {
      this.scheduleBatchProcessing();
    }
  }

  private async processBatch(): Promise<void> {
    const batch = [...this.eventBatch];
    this.eventBatch = [];

    // 批量处理事件
    await this.{entity}ReadRepository.createMany(
      batch.map(event => this.mapToReadModel(event))
    );
  }
}

// 2. 事件处理并行化
@EventsHandler({Entity}UpdatedEvent)
export class {Entity}ParallelProcessor {
  async handle(event: {Entity}UpdatedEvent): Promise<void> {
    // 并行执行多个事件处理任务
    await Promise.all([
      this.updateReadModel(event),
      this.sendNotification(event),
      this.updateCache(event),
      this.triggerIntegration(event),
    ]);
  }
}
```

### 查询性能优化

```typescript
// 1. 查询缓存
@Injectable()
export class {Entity}QueryHandler {
  constructor(
    private readonly repository: {Entity}ReadRepository,
    private readonly cache: CacheService,
  ) {}

  async execute(query: Get{Entity}Query): Promise<{Entity}ResponseDto> {
    const cacheKey = `{entity}:${query.id}`;

    // 优先从缓存获取
    let result = await this.cache.get<{Entity}ResponseDto>(cacheKey);

    if (!result) {
      const entity = await this.repository.findById(query.id);
      result = {Entity}ResponseDto.fromEntity(entity);

      // 缓存结果
      await this.cache.set(cacheKey, result, 300); // 5分钟缓存
    }

    return result;
  }
}

// 2. 分页优化
@Injectable()
export class Get{Entity}sHandler {
  async execute(query: Get{Entity}sQuery): Promise<PaginatedResponse<{Entity}ResponseDto>> {
    // 使用游标分页替代偏移分页
    const { cursor, limit } = query;

    const entities = await this.repository.findWithCursor({
      cursor,
      limit: Math.min(limit, MAX_PAGE_SIZE),
      orderBy: { createdAt: 'desc' },
    });

    return PaginatedResponse.fromEntities(entities);
  }
}
```

---

## 🧪 测试指南

### 单元测试

```typescript
// Use-Case 测试
describe('Create{Entity}UseCase', () => {
  let useCase: Create{Entity}UseCase;
  let commandBus: jest.Mocked<ICommandBus>;
  let queryBus: jest.Mocked<IQueryBus>;

  beforeEach(() => {
    const mockCommandBus = {
      execute: jest.fn(),
    };
    const mockQueryBus = {
      execute: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        Create{Entity}UseCase,
        { provide: ICommandBus, useValue: mockCommandBus },
        { provide: IQueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    useCase = module.get<Create{Entity}UseCase>(Create{Entity}UseCase);
    commandBus = module.get(ICommandBus);
    queryBus = module.get(IQueryBus);
  });

  it('should create entity successfully', async () => {
    // Arrange
    const dto = new Create{Entity}Dto();
    dto.field = 'test value';

    const entityId = 'test-id';
    const expectedResult = new {Entity}ResponseDto();

    commandBus.execute.mockResolvedValue(entityId);
    queryBus.execute.mockResolvedValue(expectedResult);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(Create{Entity}Command)
    );
    expect(queryBus.execute).toHaveBeenCalledWith(
      expect.any(Get{Entity}Query)
    );
    expect(result).toBe(expectedResult);
  });
});

// Event Handler 测试
describe('{Entity}CreatedEventHandler', () => {
  let handler: {Entity}CreatedEventHandler;
  let readRepository: jest.Mocked<{Entity}ReadRepository>;

  beforeEach(() => {
    const mockRepository = {
      create: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        {Entity}CreatedEventHandler,
        { provide: {Entity}ReadRepository, useValue: mockRepository },
      ],
    }).compile();

    handler = module.get<{Entity}CreatedEventHandler>({Entity}CreatedEventHandler);
    readRepository = module.get({Entity}ReadRepository);
  });

  it('should update read model on entity created', async () => {
    // Arrange
    const event = new {Entity}CreatedEvent('test-id', 'test-field');

    // Act
    await handler.handle(event);

    // Assert
    expect(readRepository.create).toHaveBeenCalledWith({
      id: 'test-id',
      field: 'test-field',
      createdAt: expect.any(Date),
    });
  });
});
```

### 集成测试

```typescript
describe('{Entity} Integration Tests', () => {
  let app: INestApplication;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [{Entity}ApplicationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    commandBus = moduleFixture.get<CommandBus>(CommandBus);
    queryBus = moduleFixture.get<QueryBus>(QueryBus);
  });

  it('should handle create entity flow', async () => {
    // Arrange
    const command = new Create{Entity}Command('test-field');

    // Act
    const entityId = await commandBus.execute(command);
    const query = new Get{Entity}Query(entityId);
    const result = await queryBus.execute(query);

    // Assert
    expect(result.id).toBe(entityId);
    expect(result.field).toBe('test-field');
  });
});
```

---

## 📚 参考资料

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [NestJS CQRS](https://docs.nestjs.com/recipes/cqrs)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [DDD and Event Sourcing](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)

---

## 🎯 总结

遵循这些要点，确保应用层的设计清晰、可维护、可扩展：

### 核心原则

1. **事件溯源优先**: 所有状态变更必须通过事件记录
2. **读写分离**: 严格分离命令和查询模型
3. **最终一致性**: 接受异步事件处理带来的延迟
4. **聚合边界**: 通过事件实现聚合间的松耦合

### 实施步骤

1. 先实现领域事件和聚合根
2. 再创建命令和查询处理器
3. 然后实现事件处理器和读模型
4. 最后创建Use-Case和控制器

### 性能关键

1. 事件批量处理和并行化
2. 查询缓存和分页优化
3. 读模型的合理设计
4. 监控和度量事件处理性能

这样的架构设计能够充分发挥事件溯源和CQRS的优势，同时保持RESTful API的简洁性。
