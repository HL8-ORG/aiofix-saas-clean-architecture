# 混合架构技术文档：RESTful API + 事件溯源 + CQRS

## 📋 文档信息

- **文档类型**: 混合架构技术设计文档
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 设计版
- **目标读者**: 架构师、技术负责人、开发团队、运维工程师

---

## 🎯 设计目标

### 架构愿景
构建一个结合RESTful API、事件溯源和CQRS的混合架构，实现：
- **对外简洁**: 提供标准化的RESTful API接口，易于理解和集成
- **对内强大**: 获得事件溯源的历史追踪能力和CQRS的性能优势
- **灵活扩展**: 支持系统的灵活扩展和第三方集成
- **技术先进**: 采用现代化的架构模式，提升系统能力

### 设计原则
1. **接口一致性**: 对外提供一致的RESTful API接口
2. **内部解耦**: 内部使用事件驱动架构，实现系统解耦
3. **历史完整**: 通过事件溯源记录完整的业务历史
4. **性能优化**: 通过CQRS优化查询性能
5. **可扩展性**: 支持系统的水平扩展和功能扩展
6. **可维护性**: 清晰的架构层次，便于维护和演进

### 技术目标
- 支持高并发的API访问
- 提供完整的业务历史追踪
- 优化复杂查询的性能
- 支持事件驱动的系统集成
- 确保数据的一致性和可靠性
- 提供完善的监控和运维能力

---

## 🏗️ 架构概览

### 整体架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    外部接口层 (External Interface Layer)     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  API网关    │ │  RESTful API│ │  API文档    │            │
│  │ (Gateway)   │ │  (Controllers)│ │ (Swagger)   │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                    应用服务层 (Application Service Layer)    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  Use-Case   │ │  服务协调器 │ │  业务编排   │            │
│  │ (Use Cases) │ │ (Services)  │ │ (Orchestration)│         │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                    CQRS层 (CQRS Layer)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  命令处理   │ │  查询处理   │ │  事件处理   │            │
│  │ (Commands)  │ │ (Queries)   │ │ (Events)    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                    领域层 (Domain Layer)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  聚合根     │ │  领域服务   │ │  领域事件   │            │
│  │ (Aggregates)│ │ (Services)  │ │ (Events)    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                  基础设施层 (Infrastructure Layer)           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  事件存储   │ │  查询存储   │ │  命令存储   │            │
│  │ (EventStore)│ │ (QueryStore)│ │ (CommandDB) │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  消息队列   │ │   缓存      │ │   搜索引擎  │            │
│  │ (Message Q) │ │  (Cache)    │ │ (Search)    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 数据流架构
```
外部请求 → API网关 → RESTful API → Use-Case → CQRS → 领域层 → 基础设施层
    ↓         ↓         ↓           ↓         ↓         ↓         ↓
HTTP请求   路由转发   参数验证    业务编排    命令/查询   业务逻辑   数据存储
    ↓         ↓         ↓           ↓         ↓         ↓         ↓
响应返回   响应聚合   结果封装    结果聚合    结果处理   事件发布   事件存储
```

### 核心组件关系
```
RESTful API (外部接口)
    ↓
Use-Case (应用层) ← 业务逻辑编排和协调
    ↓
命令处理 (Command Handlers) / 查询处理 (Query Handlers)
    ↓
聚合根 (Aggregate Roots)
    ↓
领域事件 (Domain Events)
    ↓
事件存储 (Event Store)
    ↓
事件处理器 (Event Handlers)
    ↓
查询模型更新 (Query Models)
    ↓
Use-Case响应 (应用层)
    ↓
RESTful API响应 (外部响应)
```

---

## 🔄 架构模式说明

### 1. RESTful API模式
- **职责**: 提供标准化的HTTP接口
- **特点**: 
  - 使用标准HTTP方法（GET、POST、PUT、DELETE）
  - 资源导向的URL设计
  - 统一的响应格式
  - 支持版本管理
- **优势**: 易于理解、标准化、广泛支持

### 2. 事件溯源模式
- **职责**: 记录完整的业务事件历史
- **特点**:
  - 所有状态变更都通过事件记录
  - 支持状态重建和历史追踪
  - 提供完整的审计能力
  - 支持时间旅行查询
- **优势**: 完整历史、审计能力、状态重建

### 3. CQRS模式
- **职责**: 分离读写操作，优化性能
- **特点**:
  - 命令和查询职责分离
  - 读写模型独立优化
  - 支持复杂查询需求
  - 提高系统扩展性
- **优势**: 性能优化、扩展性、查询灵活性

### 4. Use-Case模式
- **职责**: 封装业务用例，协调命令和查询
- **特点**:
  - 每个Use-Case对应一个具体的业务场景
  - 可以组合多个命令和查询
  - 负责业务逻辑编排和验证
  - 保持架构的一致性和可维护性
- **优势**: 业务逻辑清晰、易于测试、支持复杂场景

### 5. 混合架构优势
- **对外简洁**: 客户端只需要了解RESTful API
- **对内强大**: 内部获得事件溯源和CQRS的所有优势
- **架构一致**: 通过Use-Case统一业务操作入口
- **灵活扩展**: 支持系统的灵活扩展和集成
- **技术先进**: 采用现代化的架构模式

---

## 📦 技术栈选择

### 后端技术栈
- **框架**: NestJS (Node.js + TypeScript)
- **数据库**: 
  - 主数据库: PostgreSQL (写模型)
  - 查询数据库: PostgreSQL + Redis (读模型)
  - 事件存储: EventStoreDB 或 PostgreSQL
- **ORM**: MikroORM
- **消息队列**: Bull + Redis 或 Apache Kafka
- **缓存**: Redis
- **搜索引擎**: Elasticsearch
- **API文档**: Swagger/OpenAPI

### 前端技术栈
- **框架**: React + TypeScript
- **状态管理**: Redux Toolkit
- **UI组件库**: Ant Design
- **构建工具**: Vite
- **包管理**: pnpm

### 开发工具
- **版本控制**: Git
- **CI/CD**: GitHub Actions
- **容器化**: Docker
- **编排**: Docker Compose
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack

---

## 🎯 架构决策记录 (ADR)

### ADR-001: 混合架构模式选择
- **状态**: 已接受
- **背景**: 需要既保持API简洁性，又获得高级架构能力
- **决策**: 采用RESTful API + 事件溯源 + CQRS混合架构
- **影响**: 
  - 对外提供标准RESTful API
  - 内部获得事件溯源和CQRS优势
  - 支持系统灵活扩展

### ADR-002: NestJS框架选择
- **状态**: 已接受
- **背景**: 需要支持TypeScript和CQRS模式
- **决策**: 选择NestJS作为后端框架
- **影响**: 
  - 原生支持CQRS模式
  - 良好的TypeScript支持
  - 丰富的生态系统

### ADR-003: 事件存储选择
- **状态**: 待决策
- **背景**: 需要选择合适的事件存储方案
- **决策**: 待技术调研后确定
- **影响**: 
  - 影响事件溯源实现
  - 影响系统性能
  - 影响运维复杂度

### ADR-004: Use-Case与CQRS关系设计
- **状态**: 已接受
- **背景**: 需要确定Clean Architecture中Use-Case与CQRS的关系
- **决策**: 采用Use-Case作为CQRS包装器的架构模式
- **影响**: 
  - 保持架构一致性，所有业务操作都通过Use-Case
  - 支持简单操作到复杂业务的演进
  - 便于业务逻辑编排和协调
  - 符合Clean Architecture的分层原则

---

## 🔧 技术实现详解

### 1. RESTful API层实现

#### API控制器设计
```typescript
// 用户API控制器
@Controller('api/v1/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '获取用户成功' })
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    return this.userService.getUser(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponse> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 204, description: '用户删除成功' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }

  @Get()
  @ApiOperation({ summary: '查询用户列表' })
  @ApiResponse({ status: 200, description: '查询用户列表成功' })
  async getUsers(@Query() query: GetUsersQuery): Promise<PaginatedResponse<UserResponse>> {
    return this.userService.getUsers(query);
  }
}
```

#### DTO设计
```typescript
// 创建用户DTO
export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '组织ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: '角色列表', required: false })
  @IsArray()
  @IsOptional()
  roleIds?: string[];
}

// 更新用户DTO
export class UpdateUserDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}

// 用户响应DTO
export class UserResponse {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({ description: '状态' })
  status: UserStatus;

  @ApiProperty({ description: '组织ID' })
  organizationId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
```

### 2. 应用服务层实现

#### Use-Case与CQRS的关系设计

在Clean Architecture中，我们采用**Use-Case作为CQRS的包装器**的架构模式：

```
Controller (接口层)
    ↓
Use-Case (应用层) ← 业务逻辑编排和协调
    ↓
Command/Query (CQRS层) ← 状态变更和查询操作
    ↓
Domain Layer (领域层) ← 核心业务规则
```

**设计原则**：
1. **Use-Case负责业务逻辑编排**：协调多个命令和查询，处理复杂的业务场景
2. **Command/Query负责具体操作**：执行状态变更和查询，保持单一职责
3. **保持架构一致性**：所有业务操作都通过Use-Case，无论简单还是复杂
4. **支持未来扩展**：简单操作未来可能复杂化，统一架构便于演进

#### 用户Use-Case实现

```typescript
// 创建用户Use-Case
@Injectable()
export class CreateUserUseCase {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private userDomainService: UserDomainService
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponse> {
    // 1. 业务验证
    await this.userDomainService.validateUserCreation(
      dto.username,
      dto.email,
      dto.organizationId
    );

    // 2. 创建命令
    const command = new CreateUserCommand(
      dto.username,
      dto.email,
      dto.organizationId,
      dto.roleIds
    );

    // 3. 执行命令
    await this.commandBus.execute(command);

    // 4. 查询结果
    const query = new GetUserQuery(command.userId);
    return this.queryBus.execute(query);
  }
}

// 获取用户Use-Case
@Injectable()
export class GetUserUseCase {
  constructor(private queryBus: QueryBus) {}

  async execute(userId: string): Promise<UserResponse> {
    const query = new GetUserQuery(userId);
    return this.queryBus.execute(query);
  }
}

// 更新用户Use-Case
@Injectable()
export class UpdateUserUseCase {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private userDomainService: UserDomainService
  ) {}

  async execute(userId: string, updateData: UpdateUserDto): Promise<UserResponse> {
    // 1. 业务验证
    await this.userDomainService.validateUserUpdate(userId, updateData);

    // 2. 创建命令
    const command = new UpdateUserCommand(userId, updateData);

    // 3. 执行命令
    await this.commandBus.execute(command);

    // 4. 查询结果
    const query = new GetUserQuery(userId);
    return this.queryBus.execute(query);
  }
}

// 删除用户Use-Case
@Injectable()
export class DeleteUserUseCase {
  constructor(
    private commandBus: CommandBus,
    private userDomainService: UserDomainService
  ) {}

  async execute(userId: string): Promise<void> {
    // 1. 业务验证
    await this.userDomainService.validateUserDeletion(userId);

    // 2. 创建命令
    const command = new DeleteUserCommand(userId);

    // 3. 执行命令
    await this.commandBus.execute(command);
  }
}

// 查询用户列表Use-Case
@Injectable()
export class GetUsersUseCase {
  constructor(private queryBus: QueryBus) {}

  async execute(query: GetUsersQuery): Promise<PaginatedResponse<UserResponse>> {
    const queryCommand = new GetUsersQueryCommand(query);
    return this.queryBus.execute(queryCommand);
  }
}

// 复杂业务Use-Case示例：用户注册
@Injectable()
export class UserRegistrationUseCase {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private userDomainService: UserDomainService
  ) {}

  async execute(dto: UserRegistrationDto): Promise<RegistrationResult> {
    // 1. 业务验证
    await this.userDomainService.validateUserCreation(
      dto.username,
      dto.email,
      dto.organizationId
    );

    // 2. 创建用户
    const createUserCommand = new CreateUserCommand(
      dto.username,
      dto.email,
      dto.organizationId,
      dto.roleIds
    );
    await this.commandBus.execute(createUserCommand);

    // 3. 分配默认角色（如果没有指定角色）
    if (!dto.roleIds || dto.roleIds.length === 0) {
      const assignRoleCommand = new AssignDefaultRoleCommand(createUserCommand.userId);
      await this.commandBus.execute(assignRoleCommand);
    }

    // 4. 发送欢迎邮件
    const sendWelcomeCommand = new SendWelcomeEmailCommand(createUserCommand.userId);
    await this.commandBus.execute(sendWelcomeCommand);

    // 5. 查询用户信息
    const query = new GetUserQuery(createUserCommand.userId);
    const user = await this.queryBus.execute(query);

    return { 
      user, 
      registrationComplete: true,
      message: '用户注册成功，欢迎邮件已发送'
    };
  }
}
```

#### 用户服务层（Use-Case的协调器）

```typescript
@Injectable()
export class UserService {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserUseCase: GetUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private getUsersUseCase: GetUsersUseCase,
    private userRegistrationUseCase: UserRegistrationUseCase
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async getUser(id: string): Promise<UserResponse> {
    return this.getUserUseCase.execute(id);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  async deleteUser(id: string): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }

  async getUsers(query: GetUsersQuery): Promise<PaginatedResponse<UserResponse>> {
    return this.getUsersUseCase.execute(query);
  }

  async registerUser(registrationDto: UserRegistrationDto): Promise<RegistrationResult> {
    return this.userRegistrationUseCase.execute(registrationDto);
  }
}
```

### 3. 命令处理层实现

#### 命令定义
```typescript
// 创建用户命令
export class CreateUserCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly organizationId: string,
    public readonly roleIds?: string[]
  ) {}
}

// 更新用户命令
export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly updateData: Partial<UpdateUserDto>
  ) {}
}

// 删除用户命令
export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}
```

#### 命令处理器
```typescript
// 创建用户命令处理器
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private userRepository: UserRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    // 1. 验证命令
    await this.validateCommand(command);

    // 2. 创建用户聚合根
    const user = User.create(
      command.username,
      command.email,
      command.organizationId,
      command.roleIds
    );

    // 3. 保存聚合根
    await this.userRepository.save(user);

    // 4. 发布事件
    this.eventBus.publishAll(user.getUncommittedEvents());
  }

  private async validateCommand(command: CreateUserCommand): Promise<void> {
    // 验证用户名唯一性
    const existingUser = await this.userRepository.findByUsername(command.username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 验证邮箱唯一性
    const existingEmail = await this.userRepository.findByEmail(command.email);
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }
  }
}

// 更新用户命令处理器
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private userRepository: UserRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    // 1. 获取用户聚合根
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 2. 更新用户
    user.update(command.updateData);

    // 3. 保存聚合根
    await this.userRepository.save(user);

    // 4. 发布事件
    this.eventBus.publishAll(user.getUncommittedEvents());
  }
}

// 删除用户命令处理器
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private userRepository: UserRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    // 1. 获取用户聚合根
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 2. 删除用户
    user.delete();

    // 3. 保存聚合根
    await this.userRepository.save(user);

    // 4. 发布事件
    this.eventBus.publishAll(user.getUncommittedEvents());
  }
}
```

### 4. 查询处理层实现

#### 查询定义
```typescript
// 获取用户查询
export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

// 获取用户列表查询
export class GetUsersQueryCommand {
  constructor(public readonly query: GetUsersQuery) {}
}
```

#### 查询处理器
```typescript
// 获取用户查询处理器
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private userReadRepository: UserReadRepository) {}

  async execute(query: GetUserQuery): Promise<UserResponse> {
    const user = await this.userReadRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }
}

// 获取用户列表查询处理器
@QueryHandler(GetUsersQueryCommand)
export class GetUsersHandler implements IQueryHandler<GetUsersQueryCommand> {
  constructor(private userReadRepository: UserReadRepository) {}

  async execute(query: GetUsersQueryCommand): Promise<PaginatedResponse<UserResponse>> {
    return this.userReadRepository.findUsers(query.query);
  }
}
```

---

## 🏗️ 领域层实现

### 1. 聚合根设计

#### 用户聚合根
```typescript
// 用户聚合根
@Entity()
export class User extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column()
  organizationId: string;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  // 私有构造函数，强制使用工厂方法
  private constructor() {
    super();
  }

  // 工厂方法：创建用户
  static create(
    username: string,
    email: string,
    organizationId: string,
    roleIds?: string[]
  ): User {
    const user = new User();
    user.id = uuidv4();
    user.username = username;
    user.email = email;
    user.organizationId = organizationId;
    user.status = UserStatus.ACTIVE;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    // 发布用户创建事件
    user.apply(new UserCreatedEvent(
      user.id,
      user.username,
      user.email,
      user.organizationId,
      roleIds
    ));

    return user;
  }

  // 更新用户信息
  update(updateData: Partial<UpdateUserDto>): void {
    if (updateData.username) {
      this.username = updateData.username;
    }
    if (updateData.email) {
      this.email = updateData.email;
    }
    if (updateData.status) {
      this.status = updateData.status;
    }
    this.updatedAt = new Date();

    // 发布用户更新事件
    this.apply(new UserUpdatedEvent(
      this.id,
      updateData
    ));
  }

  // 删除用户
  delete(): void {
    this.status = UserStatus.DELETED;
    this.deletedAt = new Date();
    this.updatedAt = new Date();

    // 发布用户删除事件
    this.apply(new UserDeletedEvent(this.id));
  }

  // 分配角色
  assignRoles(roleIds: string[]): void {
    // 实现角色分配逻辑
    this.updatedAt = new Date();

    // 发布角色分配事件
    this.apply(new UserRolesAssignedEvent(this.id, roleIds));
  }

  // 移除角色
  removeRoles(roleIds: string[]): void {
    // 实现角色移除逻辑
    this.updatedAt = new Date();

    // 发布角色移除事件
    this.apply(new UserRolesRemovedEvent(this.id, roleIds));
  }
}
```

#### 组织聚合根
```typescript
// 组织聚合根
@Entity()
export class Organization extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE
  })
  status: OrganizationStatus;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  private constructor() {
    super();
  }

  static create(
    name: string,
    code: string,
    tenantId: string
  ): Organization {
    const organization = new Organization();
    organization.id = uuidv4();
    organization.name = name;
    organization.code = code;
    organization.tenantId = tenantId;
    organization.status = OrganizationStatus.ACTIVE;
    organization.createdAt = new Date();
    organization.updatedAt = new Date();

    // 发布组织创建事件
    organization.apply(new OrganizationCreatedEvent(
      organization.id,
      organization.name,
      organization.code,
      organization.tenantId
    ));

    return organization;
  }

  update(updateData: Partial<UpdateOrganizationDto>): void {
    if (updateData.name) {
      this.name = updateData.name;
    }
    if (updateData.code) {
      this.code = updateData.code;
    }
    if (updateData.status) {
      this.status = updateData.status;
    }
    this.updatedAt = new Date();

    // 发布组织更新事件
    this.apply(new OrganizationUpdatedEvent(
      this.id,
      updateData
    ));
  }

  delete(): void {
    this.status = OrganizationStatus.DELETED;
    this.updatedAt = new Date();

    // 发布组织删除事件
    this.apply(new OrganizationDeletedEvent(this.id));
  }
}
```

### 2. 领域事件设计

#### 用户相关事件
```typescript
// 用户创建事件
export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly email: string,
    public readonly organizationId: string,
    public readonly roleIds?: string[]
  ) {
    super();
  }
}

// 用户更新事件
export class UserUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly updateData: Partial<UpdateUserDto>
  ) {
    super();
  }
}

// 用户删除事件
export class UserDeletedEvent extends DomainEvent {
  constructor(public readonly userId: string) {
    super();
  }
}

// 用户角色分配事件
export class UserRolesAssignedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly roleIds: string[]
  ) {
    super();
  }
}

// 用户角色移除事件
export class UserRolesRemovedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly roleIds: string[]
  ) {
    super();
  }
}
```

#### 组织相关事件
```typescript
// 组织创建事件
export class OrganizationCreatedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly tenantId: string
  ) {
    super();
  }
}

// 组织更新事件
export class OrganizationUpdatedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: string,
    public readonly updateData: Partial<UpdateOrganizationDto>
  ) {
    super();
  }
}

// 组织删除事件
export class OrganizationDeletedEvent extends DomainEvent {
  constructor(public readonly organizationId: string) {
    super();
  }
}
```

### 3. 事件处理器实现

#### 用户事件处理器
```typescript
// 用户创建事件处理器
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    private userReadRepository: UserReadRepository,
    private notificationService: NotificationService
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    // 1. 更新查询模型
    await this.userReadRepository.create({
      id: event.userId,
      username: event.username,
      email: event.email,
      organizationId: event.organizationId,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. 发送欢迎通知
    await this.notificationService.sendWelcomeEmail(event.email, event.username);

    // 3. 记录审计日志
    await this.auditService.logUserCreation(event.userId, event.username);
  }
}

// 用户更新事件处理器
@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  constructor(
    private userReadRepository: UserReadRepository,
    private notificationService: NotificationService
  ) {}

  async handle(event: UserUpdatedEvent): Promise<void> {
    // 1. 更新查询模型
    await this.userReadRepository.update(event.userId, {
      ...event.updateData,
      updatedAt: new Date()
    });

    // 2. 发送更新通知
    if (event.updateData.email) {
      await this.notificationService.sendEmailUpdateNotification(
        event.updateData.email,
        event.userId
      );
    }

    // 3. 记录审计日志
    await this.auditService.logUserUpdate(event.userId, event.updateData);
  }
}

// 用户删除事件处理器
@EventsHandler(UserDeletedEvent)
export class UserDeletedHandler implements IEventHandler<UserDeletedEvent> {
  constructor(
    private userReadRepository: UserReadRepository,
    private notificationService: NotificationService
  ) {}

  async handle(event: UserDeletedEvent): Promise<void> {
    // 1. 更新查询模型
    await this.userReadRepository.update(event.userId, {
      status: UserStatus.DELETED,
      deletedAt: new Date(),
      updatedAt: new Date()
    });

    // 2. 发送删除通知
    await this.notificationService.sendAccountDeletionNotification(event.userId);

    // 3. 记录审计日志
    await this.auditService.logUserDeletion(event.userId);
  }
}
```

#### 组织事件处理器
```typescript
// 组织创建事件处理器
@EventsHandler(OrganizationCreatedEvent)
export class OrganizationCreatedHandler implements IEventHandler<OrganizationCreatedEvent> {
  constructor(
    private organizationReadRepository: OrganizationReadRepository,
    private notificationService: NotificationService
  ) {}

  async handle(event: OrganizationCreatedEvent): Promise<void> {
    // 1. 更新查询模型
    await this.organizationReadRepository.create({
      id: event.organizationId,
      name: event.name,
      code: event.code,
      tenantId: event.tenantId,
      status: OrganizationStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. 发送组织创建通知
    await this.notificationService.sendOrganizationCreationNotification(
      event.organizationId,
      event.name
    );

    // 3. 记录审计日志
    await this.auditService.logOrganizationCreation(event.organizationId, event.name);
  }
}

// 组织更新事件处理器
@EventsHandler(OrganizationUpdatedEvent)
export class OrganizationUpdatedHandler implements IEventHandler<OrganizationUpdatedEvent> {
  constructor(
    private organizationReadRepository: OrganizationReadRepository,
    private notificationService: NotificationService
  ) {}

  async handle(event: OrganizationUpdatedEvent): Promise<void> {
    // 1. 更新查询模型
    await this.organizationReadRepository.update(event.organizationId, {
      ...event.updateData,
      updatedAt: new Date()
    });

    // 2. 发送组织更新通知
    await this.notificationService.sendOrganizationUpdateNotification(
      event.organizationId,
      event.updateData
    );

    // 3. 记录审计日志
    await this.auditService.logOrganizationUpdate(event.organizationId, event.updateData);
  }
}
```

### 4. 领域服务实现

#### 用户领域服务
```typescript
// 用户领域服务
@Injectable()
export class UserDomainService {
  constructor(
    private userRepository: UserRepository,
    private organizationRepository: OrganizationRepository
  ) {}

  // 验证用户是否可以创建
  async validateUserCreation(
    username: string,
    email: string,
    organizationId: string
  ): Promise<void> {
    // 验证用户名唯一性
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 验证邮箱唯一性
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 验证组织是否存在
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('组织不存在');
    }

    // 验证组织状态
    if (organization.status !== OrganizationStatus.ACTIVE) {
      throw new BadRequestException('组织状态无效');
    }
  }

  // 验证用户是否可以更新
  async validateUserUpdate(
    userId: string,
    updateData: Partial<UpdateUserDto>
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证用户名唯一性（如果更新用户名）
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await this.userRepository.findByUsername(updateData.username);
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 验证邮箱唯一性（如果更新邮箱）
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(updateData.email);
      if (existingEmail) {
        throw new ConflictException('邮箱已存在');
      }
    }
  }

  // 验证用户是否可以删除
  async validateUserDeletion(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户是否有活跃的会话
    const activeSessions = await this.sessionRepository.findActiveByUserId(userId);
    if (activeSessions.length > 0) {
      throw new BadRequestException('用户有活跃会话，无法删除');
    }

    // 检查用户是否有未完成的任务
    const pendingTasks = await this.taskRepository.findPendingByUserId(userId);
    if (pendingTasks.length > 0) {
      throw new BadRequestException('用户有未完成的任务，无法删除');
    }
  }
}
```

---

*这是第三部分，包含领域层实现和事件处理。后续部分将包含数据设计、性能优化、部署配置等内容。*
