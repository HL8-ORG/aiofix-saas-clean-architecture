# IAM系统技术设计方案 - 第二部分

## 📋 文档信息

- **文档类型**: 技术设计方案 (第二部分)
- **文档版本**: v1.1
- **创建日期**: 2024年12月
- **更新日期**: 2024年12月
- **更新说明**: 引入Passport、JWT、CASL等第三方依赖
- **文档状态**: 正式版
- **目标读者**: 开发团队、架构师

---

## 🔌 API设计规范

### RESTful API设计原则

#### 1. 资源命名规范

```
租户管理: /api/v1/tenants
用户管理: /api/v1/users
组织管理: /api/v1/organizations
部门管理: /api/v1/departments
角色管理: /api/v1/roles
权限管理: /api/v1/permissions
认证管理: /api/v1/auth
```

#### 2. HTTP方法使用

- **GET**: 查询资源
- **POST**: 创建资源
- **PUT**: 更新资源（完整更新）
- **PATCH**: 部分更新资源
- **DELETE**: 删除资源

#### 3. 状态码规范

```typescript
// 成功响应
200: OK - 请求成功
201: Created - 资源创建成功
204: No Content - 请求成功但无返回内容

// 客户端错误
400: Bad Request - 请求参数错误
401: Unauthorized - 未认证
403: Forbidden - 无权限
404: Not Found - 资源不存在
409: Conflict - 资源冲突
422: Unprocessable Entity - 业务逻辑错误

// 服务器错误
500: Internal Server Error - 服务器内部错误
502: Bad Gateway - 网关错误
503: Service Unavailable - 服务不可用
```

### API响应格式

#### 标准响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ApiError {
  field?: string;
  code: string;
  message: string;
}
```

#### 成功响应示例

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "测试租户",
    "code": "TEST001",
    "status": "ACTIVE",
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  },
  "message": "租户创建成功"
}
```

#### 错误响应示例

```json
{
  "success": false,
  "message": "请求参数验证失败",
  "errors": [
    {
      "field": "name",
      "code": "VALIDATION_ERROR",
      "message": "租户名称不能为空"
    },
    {
      "field": "code",
      "code": "DUPLICATE_ERROR",
      "message": "租户代码已存在"
    }
  ]
}
```

---

## 🔐 认证控制器设计

### 认证控制器

```typescript
/**
 * @class AuthController
 * @description 认证控制器
 */
@Controller('auth')
@ApiTags('认证管理')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method login
   * @description 用户登录
   * @param loginDto 登录请求
   * @returns 登录结果
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const user = req.user;
      const accessToken = this.jwtService.generateAccessToken(user);
      const refreshToken = this.jwtService.generateRefreshToken(user);

      // 记录登录日志
      await this.authService.recordLoginLog(
        user,
        req.ip,
        req.headers['user-agent'],
      );

      this.logger.info('用户登录成功', {
        userId: user.id.value,
        email: user.email.value,
      });

      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: UserDto.fromEntity(user),
        },
        message: '登录成功',
      };
    } catch (error) {
      this.logger.error('用户登录失败', { error, loginDto });
      throw error;
    }
  }

  /**
   * @method register
   * @description 用户注册
   * @param registerDto 注册请求
   * @returns 注册结果
   */
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '注册失败' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponse<UserDto>> {
    try {
      const user = await this.authService.register(registerDto);

      return {
        success: true,
        data: UserDto.fromEntity(user),
        message: '注册成功，请查收激活邮件',
      };
    } catch (error) {
      this.logger.error('用户注册失败', { error, registerDto });
      throw error;
    }
  }

  /**
   * @method refresh
   * @description 刷新令牌
   * @param refreshDto 刷新请求
   * @returns 刷新结果
   */
  @Post('refresh')
  @ApiOperation({ summary: '刷新令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新失败' })
  async refresh(
    @Body() refreshDto: RefreshTokenDto,
  ): Promise<ApiResponse<RefreshResponseDto>> {
    try {
      const accessToken = await this.jwtService.refreshToken(
        refreshDto.refreshToken,
      );

      return {
        success: true,
        data: { accessToken },
        message: '令牌刷新成功',
      };
    } catch (error) {
      this.logger.error('令牌刷新失败', { error });
      throw error;
    }
  }

  /**
   * @method logout
   * @description 用户登出
   * @param req 请求对象
   * @returns 登出结果
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@Request() req): Promise<ApiResponse<void>> {
    try {
      const user = req.user;
      await this.authService.logout(user);

      this.logger.info('用户登出成功', { userId: user.id.value });

      return {
        success: true,
        message: '登出成功',
      };
    } catch (error) {
      this.logger.error('用户登出失败', { error });
      throw error;
    }
  }

  /**
   * @method profile
   * @description 获取用户信息
   * @param req 请求对象
   * @returns 用户信息
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async profile(@Request() req): Promise<ApiResponse<UserDto>> {
    try {
      const user = req.user;
      const userWithDetails = await this.authService.getUserProfile(user.id);

      return {
        success: true,
        data: UserDto.fromEntity(userWithDetails),
        message: '获取用户信息成功',
      };
    } catch (error) {
      this.logger.error('获取用户信息失败', { error });
      throw error;
    }
  }
}
```

---

## 🏗️ 服务层设计

### 认证服务实现

#### 认证服务

```typescript
/**
 * @class AuthService
 * @description 认证服务
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly passwordService: PasswordService,
    private readonly eventBus: EventBus,
    private readonly notificationService: NotificationService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method validateUser
   * @description 验证用户凭据
   * @param email 邮箱
   * @param password 密码
   * @returns 用户信息
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return null;
      }

      // 验证密码
      const isValidPassword = await this.passwordService.verify(
        password,
        user.passwordHash,
      );
      if (!isValidPassword) {
        return null;
      }

      // 检查用户状态
      if (!user.isActive) {
        throw new UnauthorizedException('USER_INACTIVE', '用户已停用');
      }

      // 检查租户状态
      if (user.tenant && !user.tenant.isActive) {
        throw new UnauthorizedException('TENANT_SUSPENDED', '租户已暂停');
      }

      return user;
    } catch (error) {
      this.logger.error('用户验证失败', { error, email });
      throw error;
    }
  }

  /**
   * @method register
   * @description 用户注册
   * @param registerDto 注册请求
   * @returns 注册的用户
   */
  async register(registerDto: RegisterDto): Promise<User> {
    try {
      // 1. 验证邮箱唯一性
      const existingUser = await this.userService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new BusinessException('USER_EMAIL_EXISTS', '邮箱已存在');
      }

      // 2. 获取默认租户
      const defaultTenant = await this.tenantService.getDefaultTenant();

      // 3. 创建用户
      const user = new User(
        Uuid.generate(),
        new Email(registerDto.email),
        new Username(registerDto.username),
        await this.passwordService.hash(registerDto.password),
        defaultTenant.id,
      );

      // 4. 保存用户
      const savedUser = await this.userService.save(user);

      // 5. 发布用户注册事件
      await this.eventBus.publish(new UserRegisteredEvent(savedUser));

      // 6. 发送激活邮件
      await this.notificationService.sendUserActivationEmail(savedUser);

      this.logger.info('用户注册成功', {
        userId: savedUser.id.value,
        email: savedUser.email.value,
      });

      return savedUser;
    } catch (error) {
      this.logger.error('用户注册失败', { error, registerDto });
      throw error;
    }
  }

  /**
   * @method logout
   * @description 用户登出
   * @param user 用户信息
   * @returns 登出结果
   */
  async logout(user: User): Promise<void> {
    try {
      // 1. 清除用户会话
      await this.userService.clearUserSessions(user.id);

      // 2. 发布用户登出事件
      await this.eventBus.publish(new UserLoggedOutEvent(user));

      this.logger.info('用户登出成功', { userId: user.id.value });
    } catch (error) {
      this.logger.error('用户登出失败', { error, userId: user.id.value });
      throw error;
    }
  }

  /**
   * @method getUserProfile
   * @description 获取用户详细信息
   * @param userId 用户ID
   * @returns 用户详细信息
   */
  async getUserProfile(userId: Uuid): Promise<User> {
    try {
      const user = await this.userService.findByIdWithDetails(userId);
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND', '用户不存在');
      }

      return user;
    } catch (error) {
      this.logger.error('获取用户详细信息失败', {
        error,
        userId: userId.value,
      });
      throw error;
    }
  }

  /**
   * @method recordLoginLog
   * @description 记录登录日志
   * @param user 用户信息
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   * @returns 记录结果
   */
  async recordLoginLog(
    user: User,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      await this.eventBus.publish(
        new UserLoginEvent(user, ipAddress, userAgent),
      );
    } catch (error) {
      this.logger.error('记录登录日志失败', { error, userId: user.id.value });
    }
  }
}
```

### 应用服务 (Application Services)

#### 租户应用服务

```typescript
/**
 * @class TenantApplicationService
 * @description 租户应用服务，负责租户相关的业务用例
 */
@Injectable()
export class TenantApplicationService {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly eventBus: EventBus,
    private readonly notificationService: NotificationService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method createTenant
   * @description 创建租户
   * @param command 创建租户命令
   * @returns 创建的租户信息
   */
  async createTenant(command: CreateTenantCommand): Promise<TenantDto> {
    try {
      // 1. 验证租户代码唯一性
      const existingTenant = await this.tenantRepository.findByCode(
        command.code,
      );
      if (existingTenant) {
        throw new BusinessException('TENANT_CODE_EXISTS', '租户代码已存在');
      }

      // 2. 创建租户实体
      const tenant = new Tenant(
        Uuid.generate(),
        new TenantCode(command.code),
        command.name,
        command.description,
      );

      // 3. 保存租户
      await this.tenantRepository.save(tenant);

      // 4. 发布租户创建事件
      await this.eventBus.publish(new TenantCreatedEvent(tenant));

      // 5. 发送通知
      await this.notificationService.sendTenantCreatedNotification(tenant);

      this.logger.info('租户创建成功', {
        tenantId: tenant.id.value,
        code: tenant.code.value,
      });

      return TenantDto.fromEntity(tenant);
    } catch (error) {
      this.logger.error('租户创建失败', { error, command });
      throw error;
    }
  }

  /**
   * @method updateTenant
   * @description 更新租户信息
   * @param command 更新租户命令
   * @returns 更新后的租户信息
   */
  async updateTenant(command: UpdateTenantCommand): Promise<TenantDto> {
    try {
      // 1. 查找租户
      const tenant = await this.tenantRepository.findById(command.tenantId);
      if (!tenant) {
        throw new NotFoundException('TENANT_NOT_FOUND', '租户不存在');
      }

      // 2. 更新租户信息
      tenant.updateName(command.name);
      tenant.updateDescription(command.description);

      // 3. 保存更新
      await this.tenantRepository.save(tenant);

      // 4. 发布租户更新事件
      await this.eventBus.publish(new TenantUpdatedEvent(tenant));

      this.logger.info('租户更新成功', { tenantId: tenant.id.value });

      return TenantDto.fromEntity(tenant);
    } catch (error) {
      this.logger.error('租户更新失败', { error, command });
      throw error;
    }
  }

  /**
   * @method suspendTenant
   * @description 暂停租户
   * @param command 暂停租户命令
   * @returns 暂停后的租户信息
   */
  async suspendTenant(command: SuspendTenantCommand): Promise<TenantDto> {
    try {
      // 1. 查找租户
      const tenant = await this.tenantRepository.findById(command.tenantId);
      if (!tenant) {
        throw new NotFoundException('TENANT_NOT_FOUND', '租户不存在');
      }

      // 2. 暂停租户
      tenant.suspend();

      // 3. 保存状态
      await this.tenantRepository.save(tenant);

      // 4. 发布租户暂停事件
      await this.eventBus.publish(new TenantSuspendedEvent(tenant));

      // 5. 发送通知
      await this.notificationService.sendTenantSuspendedNotification(tenant);

      this.logger.info('租户暂停成功', { tenantId: tenant.id.value });

      return TenantDto.fromEntity(tenant);
    } catch (error) {
      this.logger.error('租户暂停失败', { error, command });
      throw error;
    }
  }
}
```

#### 用户应用服务

```typescript
/**
 * @class UserApplicationService
 * @description 用户应用服务，负责用户相关的业务用例
 */
@Injectable()
export class UserApplicationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tenantRepository: ITenantRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly eventBus: EventBus,
    private readonly notificationService: NotificationService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method registerUser
   * @description 用户注册
   * @param command 用户注册命令
   * @returns 注册的用户信息
   */
  async registerUser(command: RegisterUserCommand): Promise<UserDto> {
    try {
      // 1. 验证邮箱唯一性
      const existingUser = await this.userRepository.findByEmail(command.email);
      if (existingUser) {
        throw new BusinessException('USER_EMAIL_EXISTS', '邮箱已存在');
      }

      // 2. 验证租户存在性
      const tenant = await this.tenantRepository.findById(command.tenantId);
      if (!tenant) {
        throw new NotFoundException('TENANT_NOT_FOUND', '租户不存在');
      }

      // 3. 创建用户实体
      const user = new User(
        Uuid.generate(),
        new Email(command.email),
        new Username(command.username),
        command.password,
        tenant.id,
      );

      // 4. 保存用户
      await this.userRepository.save(user);

      // 5. 发布用户注册事件
      await this.eventBus.publish(new UserRegisteredEvent(user));

      // 6. 发送激活邮件
      await this.notificationService.sendUserActivationEmail(user);

      this.logger.info('用户注册成功', {
        userId: user.id.value,
        email: user.email.value,
      });

      return UserDto.fromEntity(user);
    } catch (error) {
      this.logger.error('用户注册失败', { error, command });
      throw error;
    }
  }

  /**
   * @method assignUserToOrganization
   * @description 将用户分配到组织
   * @param command 用户组织分配命令
   * @returns 分配结果
   */
  async assignUserToOrganization(
    command: AssignUserToOrganizationCommand,
  ): Promise<void> {
    try {
      // 1. 查找用户
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND', '用户不存在');
      }

      // 2. 查找组织
      const organization = await this.organizationRepository.findById(
        command.organizationId,
      );
      if (!organization) {
        throw new NotFoundException('ORGANIZATION_NOT_FOUND', '组织不存在');
      }

      // 3. 验证租户一致性
      if (!user.tenantId.equals(organization.tenantId)) {
        throw new BusinessException(
          'TENANT_MISMATCH',
          '用户和组织不属于同一租户',
        );
      }

      // 4. 分配用户到组织
      user.assignToOrganization(organization.id);

      // 5. 保存分配结果
      await this.userRepository.save(user);

      // 6. 发布用户组织分配事件
      await this.eventBus.publish(
        new UserOrganizationAssignedEvent(user, organization),
      );

      // 7. 发送通知
      await this.notificationService.sendUserOrganizationAssignmentNotification(
        user,
        organization,
      );

      this.logger.info('用户组织分配成功', {
        userId: user.id.value,
        organizationId: organization.id.value,
      });
    } catch (error) {
      this.logger.error('用户组织分配失败', { error, command });
      throw error;
    }
  }
}
```

---

## 🎯 命令和查询处理器

### 命令处理器 (Command Handlers)

#### 创建租户命令处理器

```typescript
/**
 * @class CreateTenantCommandHandler
 * @description 创建租户命令处理器
 */
@CommandHandler(CreateTenantCommand)
export class CreateTenantCommandHandler
  implements ICommandHandler<CreateTenantCommand>
{
  constructor(
    private readonly tenantApplicationService: TenantApplicationService,
  ) {}

  /**
   * @method execute
   * @description 执行创建租户命令
   * @param command 创建租户命令
   * @returns 创建的租户信息
   */
  async execute(command: CreateTenantCommand): Promise<TenantDto> {
    return this.tenantApplicationService.createTenant(command);
  }
}
```

#### 更新租户命令处理器

```typescript
/**
 * @class UpdateTenantCommandHandler
 * @description 更新租户命令处理器
 */
@CommandHandler(UpdateTenantCommand)
export class UpdateTenantCommandHandler
  implements ICommandHandler<UpdateTenantCommand>
{
  constructor(
    private readonly tenantApplicationService: TenantApplicationService,
  ) {}

  /**
   * @method execute
   * @description 执行更新租户命令
   * @param command 更新租户命令
   * @returns 更新后的租户信息
   */
  async execute(command: UpdateTenantCommand): Promise<TenantDto> {
    return this.tenantApplicationService.updateTenant(command);
  }
}
```

### 查询处理器 (Query Handlers)

#### 获取租户列表查询处理器

```typescript
/**
 * @class GetTenantsQueryHandler
 * @description 获取租户列表查询处理器
 */
@QueryHandler(GetTenantsQuery)
export class GetTenantsQueryHandler implements IQueryHandler<GetTenantsQuery> {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  /**
   * @method execute
   * @description 执行获取租户列表查询
   * @param query 获取租户列表查询
   * @returns 租户列表
   */
  async execute(query: GetTenantsQuery): Promise<PaginatedResult<TenantDto>> {
    const { page = 1, limit = 10, status, search } = query;

    // 构建查询条件
    const conditions: TenantQueryConditions = {};
    if (status) {
      conditions.status = status;
    }
    if (search) {
      conditions.search = search;
    }

    // 执行分页查询
    const result = await this.tenantRepository.findByConditions(conditions, {
      page,
      limit,
    });

    // 转换为DTO
    const tenants = result.items.map(tenant => TenantDto.fromEntity(tenant));

    return {
      items: tenants,
      meta: {
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      },
    };
  }
}
```

#### 获取租户详情查询处理器

```typescript
/**
 * @class GetTenantByIdQueryHandler
 * @description 获取租户详情查询处理器
 */
@QueryHandler(GetTenantByIdQuery)
export class GetTenantByIdQueryHandler
  implements IQueryHandler<GetTenantByIdQuery>
{
  constructor(private readonly tenantRepository: ITenantRepository) {}

  /**
   * @method execute
   * @description 执行获取租户详情查询
   * @param query 获取租户详情查询
   * @returns 租户详情
   */
  async execute(query: GetTenantByIdQuery): Promise<TenantDto> {
    const tenant = await this.tenantRepository.findById(query.tenantId);
    if (!tenant) {
      throw new NotFoundException('TENANT_NOT_FOUND', '租户不存在');
    }

    return TenantDto.fromEntity(tenant);
  }
}
```

---

## 🔄 事件处理器

### 租户事件处理器

#### 租户创建事件处理器

```typescript
/**
 * @class TenantCreatedEventHandler
 * @description 租户创建事件处理器
 */
@EventsHandler(TenantCreatedEvent)
export class TenantCreatedEventHandler
  implements IEventHandler<TenantCreatedEvent>
{
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * @method handle
   * @description 处理租户创建事件
   * @param event 租户创建事件
   */
  async handle(event: TenantCreatedEvent): Promise<void> {
    try {
      // 1. 记录审计日志
      await this.auditService.logTenantCreated(event.tenant);

      // 2. 记录事件日志
      this.logger.info('租户创建事件处理完成', {
        tenantId: event.tenant.id.value,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error('租户创建事件处理失败', { error, event });
      throw error;
    }
  }
}
```

#### 租户更新事件处理器

```typescript
/**
 * @class TenantUpdatedEventHandler
 * @description 租户更新事件处理器
 */
@EventsHandler(TenantUpdatedEvent)
export class TenantUpdatedEventHandler
  implements IEventHandler<TenantUpdatedEvent>
{
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * @method handle
   * @description 处理租户更新事件
   * @param event 租户更新事件
   */
  async handle(event: TenantUpdatedEvent): Promise<void> {
    try {
      // 1. 记录审计日志
      await this.auditService.logTenantUpdated(event.tenant);

      // 2. 清除相关缓存
      await this.cacheService.invalidateTenantCache(event.tenant.id);

      // 3. 记录事件日志
      this.logger.info('租户更新事件处理完成', {
        tenantId: event.tenant.id.value,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error('租户更新事件处理失败', { error, event });
      throw error;
    }
  }
}
```

### 用户事件处理器

#### 用户注册事件处理器

```typescript
/**
 * @class UserRegisteredEventHandler
 * @description 用户注册事件处理器
 */
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler
  implements IEventHandler<UserRegisteredEvent>
{
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * @method handle
   * @description 处理用户注册事件
   * @param event 用户注册事件
   */
  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      // 1. 记录审计日志
      await this.auditService.logUserRegistered(event.user);

      // 2. 发送欢迎邮件
      await this.notificationService.sendWelcomeEmail(event.user);

      // 3. 记录事件日志
      this.logger.info('用户注册事件处理完成', {
        userId: event.user.id.value,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error('用户注册事件处理失败', { error, event });
      throw error;
    }
  }
}
```

---

## 🔐 认证和授权中间件

### JWT认证中间件

```typescript
/**
 * @class JwtAuthMiddleware
 * @description JWT认证中间件
 */
@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: IUserRepository,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method use
   * @description 中间件处理逻辑
   * @param req 请求对象
   * @param res 响应对象
   * @param next 下一个中间件
   */
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException('TOKEN_MISSING', '访问令牌缺失');
      }

      // 验证JWT令牌
      const payload = await this.jwtService.verifyAsync(token);

      // 查找用户
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('USER_NOT_FOUND', '用户不存在或已停用');
      }

      // 将用户信息添加到请求上下文
      req.user = user;
      req.tenantId = user.tenantId.value;

      next();
    } catch (error) {
      this.logger.error('JWT认证失败', { error, path: req.path });
      next(new UnauthorizedException('INVALID_TOKEN', '无效的访问令牌'));
    }
  }

  /**
   * @method extractTokenFromHeader
   * @description 从请求头中提取令牌
   * @param request 请求对象
   * @returns 令牌字符串
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### 权限验证中间件

```typescript
/**
 * @class PermissionMiddleware
 * @description 权限验证中间件
 */
@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method use
   * @description 中间件处理逻辑
   * @param req 请求对象
   * @param res 响应对象
   * @param next 下一个中间件
   */
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedException('USER_NOT_FOUND', '用户信息缺失');
      }

      // 获取请求的权限要求
      const requiredPermission = this.getRequiredPermission(req);
      if (!requiredPermission) {
        // 没有权限要求，直接通过
        next();
        return;
      }

      // 验证用户权限
      const hasPermission = await this.permissionService.hasPermission(
        user.id,
        requiredPermission,
      );

      if (!hasPermission) {
        throw new ForbiddenException('PERMISSION_DENIED', '权限不足');
      }

      next();
    } catch (error) {
      this.logger.error('权限验证失败', { error, path: req.path });
      next(error);
    }
  }

  /**
   * @method getRequiredPermission
   * @description 获取请求所需的权限
   * @param req 请求对象
   * @returns 所需权限
   */
  private getRequiredPermission(req: Request): string | null {
    // 从路由元数据中获取权限要求
    const handler = req.route?.stack?.find((layer: any) => layer.handle);
    if (handler?.handle?.permission) {
      return handler.handle.permission;
    }

    // 从请求路径和方法推断权限
    const { method, path } = req;
    return this.inferPermissionFromPath(method, path);
  }

  /**
   * @method inferPermissionFromPath
   * @description 从请求路径推断权限
   * @param method HTTP方法
   * @param path 请求路径
   * @returns 推断的权限
   */
  private inferPermissionFromPath(method: string, path: string): string | null {
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length < 3) return null;

    const resource = pathSegments[2]; // /api/v1/tenants -> tenants
    const action = this.getActionFromMethod(method);

    return `${resource}:${action}`;
  }

  /**
   * @method getActionFromMethod
   * @description 从HTTP方法获取操作类型
   * @param method HTTP方法
   * @returns 操作类型
   */
  private getActionFromMethod(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'read';
      case 'POST':
        return 'create';
      case 'PUT':
        return 'update';
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'read';
    }
  }
}
```

---

## 📊 数据访问层设计

### 仓储接口定义

```typescript
/**
 * @interface ITenantRepository
 * @description 租户仓储接口
 */
export interface ITenantRepository {
  /**
   * @method findById
   * @description 根据ID查找租户
   * @param id 租户ID
   * @returns 租户实体
   */
  findById(id: Uuid): Promise<Tenant | null>;

  /**
   * @method findByCode
   * @description 根据代码查找租户
   * @param code 租户代码
   * @returns 租户实体
   */
  findByCode(code: string): Promise<Tenant | null>;

  /**
   * @method findByConditions
   * @description 根据条件查找租户列表
   * @param conditions 查询条件
   * @param pagination 分页参数
   * @returns 分页结果
   */
  findByConditions(
    conditions: TenantQueryConditions,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Tenant>>;

  /**
   * @method save
   * @description 保存租户
   * @param tenant 租户实体
   * @returns 保存后的租户
   */
  save(tenant: Tenant): Promise<Tenant>;

  /**
   * @method delete
   * @description 删除租户
   * @param id 租户ID
   * @returns 删除结果
   */
  delete(id: Uuid): Promise<void>;
}
```

### PostgreSQL仓储实现

```typescript
/**
 * @class PostgresTenantRepository
 * @description PostgreSQL租户仓储实现
 */
@Injectable()
export class PostgresTenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repository: Repository<TenantEntity>,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method findById
   * @description 根据ID查找租户
   * @param id 租户ID
   * @returns 租户实体
   */
  async findById(id: Uuid): Promise<Tenant | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id: id.value },
      });

      return entity ? TenantMapper.toDomain(entity) : null;
    } catch (error) {
      this.logger.error('根据ID查找租户失败', { error, id: id.value });
      throw new DatabaseException('TENANT_FIND_BY_ID_FAILED', '查找租户失败');
    }
  }

  /**
   * @method findByCode
   * @description 根据代码查找租户
   * @param code 租户代码
   * @returns 租户实体
   */
  async findByCode(code: string): Promise<Tenant | null> {
    try {
      const entity = await this.repository.findOne({
        where: { code },
      });

      return entity ? TenantMapper.toDomain(entity) : null;
    } catch (error) {
      this.logger.error('根据代码查找租户失败', { error, code });
      throw new DatabaseException('TENANT_FIND_BY_CODE_FAILED', '查找租户失败');
    }
  }

  /**
   * @method findByConditions
   * @description 根据条件查找租户列表
   * @param conditions 查询条件
   * @param pagination 分页参数
   * @returns 分页结果
   */
  async findByConditions(
    conditions: TenantQueryConditions,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Tenant>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('tenant');

      // 添加查询条件
      if (conditions.status) {
        queryBuilder.andWhere('tenant.status = :status', {
          status: conditions.status,
        });
      }

      if (conditions.search) {
        queryBuilder.andWhere(
          '(tenant.name ILIKE :search OR tenant.code ILIKE :search)',
          { search: `%${conditions.search}%` },
        );
      }

      // 添加排序
      queryBuilder.orderBy('tenant.createdAt', 'DESC');

      // 添加分页
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      // 执行查询
      const [entities, total] = await queryBuilder.getManyAndCount();

      // 转换为领域实体
      const tenants = entities.map(entity => TenantMapper.toDomain(entity));

      return {
        items: tenants,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('根据条件查找租户失败', {
        error,
        conditions,
        pagination,
      });
      throw new DatabaseException(
        'TENANT_FIND_BY_CONDITIONS_FAILED',
        '查找租户失败',
      );
    }
  }

  /**
   * @method save
   * @description 保存租户
   * @param tenant 租户实体
   * @returns 保存后的租户
   */
  async save(tenant: Tenant): Promise<Tenant> {
    try {
      const entity = TenantMapper.toEntity(tenant);
      const savedEntity = await this.repository.save(entity);
      return TenantMapper.toDomain(savedEntity);
    } catch (error) {
      this.logger.error('保存租户失败', { error, tenantId: tenant.id.value });
      throw new DatabaseException('TENANT_SAVE_FAILED', '保存租户失败');
    }
  }

  /**
   * @method delete
   * @description 删除租户
   * @param id 租户ID
   * @returns 删除结果
   */
  async delete(id: Uuid): Promise<void> {
    try {
      await this.repository.delete(id.value);
    } catch (error) {
      this.logger.error('删除租户失败', { error, id: id.value });
      throw new DatabaseException('TENANT_DELETE_FAILED', '删除租户失败');
    }
  }
}
```

---

## 🔄 事件总线实现

### 事件总线接口

```typescript
/**
 * @interface IEventBus
 * @description 事件总线接口
 */
export interface IEventBus {
  /**
   * @method publish
   * @description 发布事件
   * @param event 事件对象
   * @returns 发布结果
   */
  publish<T extends DomainEvent>(event: T): Promise<void>;

  /**
   * @method publishAll
   * @description 批量发布事件
   * @param events 事件列表
   * @returns 发布结果
   */
  publishAll(events: DomainEvent[]): Promise<void>;
}
```

### 事件总线实现

```typescript
/**
 * @class EventBus
 * @description 事件总线实现
 */
@Injectable()
export class EventBus implements IEventBus {
  constructor(
    private readonly eventStore: IEventStore,
    private readonly eventHandlers: Map<string, IEventHandler<any>[]>,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method publish
   * @description 发布事件
   * @param event 事件对象
   * @returns 发布结果
   */
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    try {
      // 1. 存储事件到事件存储
      await this.eventStore.save(event);

      // 2. 获取事件处理器
      const handlers = this.eventHandlers.get(event.constructor.name) || [];

      // 3. 异步执行事件处理器
      const promises = handlers.map(handler =>
        this.executeHandler(handler, event),
      );

      await Promise.allSettled(promises);

      this.logger.info('事件发布成功', {
        eventType: event.constructor.name,
        aggregateId: event.aggregateId.value,
      });
    } catch (error) {
      this.logger.error('事件发布失败', { error, event });
      throw new EventBusException('EVENT_PUBLISH_FAILED', '事件发布失败');
    }
  }

  /**
   * @method publishAll
   * @description 批量发布事件
   * @param events 事件列表
   * @returns 发布结果
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    try {
      // 批量发布事件
      const promises = events.map(event => this.publish(event));
      await Promise.allSettled(promises);
    } catch (error) {
      this.logger.error('批量事件发布失败', {
        error,
        eventCount: events.length,
      });
      throw new EventBusException('EVENTS_PUBLISH_FAILED', '批量事件发布失败');
    }
  }

  /**
   * @method executeHandler
   * @description 执行事件处理器
   * @param handler 事件处理器
   * @param event 事件对象
   * @returns 执行结果
   */
  private async executeHandler(
    handler: IEventHandler<any>,
    event: DomainEvent,
  ): Promise<void> {
    try {
      await handler.handle(event);
    } catch (error) {
      this.logger.error('事件处理器执行失败', {
        error,
        handlerName: handler.constructor.name,
        eventType: event.constructor.name,
      });
      // 不抛出异常，避免影响其他处理器
    }
  }
}
```

---

_本文档的第二部分包含了详细的API设计、服务实现和代码示例，并集成了Passport.js和CASL等第三方依赖。第三部分将包含缓存设计、通知服务、监控告警等高级功能的实现。_
