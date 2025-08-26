# IAM系统技术设计方案

## 📋 文档信息

- **文档类型**: 技术设计方案
- **文档版本**: v1.1
- **创建日期**: 2024年12月
- **更新日期**: 2024年12月
- **更新说明**: 引入Passport、JWT、CASL等第三方依赖
- **文档状态**: 正式版
- **目标读者**: 架构师、开发团队、技术负责人

---

## 🎯 设计目标

### 核心目标

基于业务需求文档，设计一个高性能、高可用、可扩展的IAM系统技术架构，支持多租户、多层级数据隔离、事件溯源等核心功能。

### 技术目标

1. **高性能**: 支持高并发访问，响应时间 < 100ms
2. **高可用**: 系统可用性 > 99.9%
3. **可扩展**: 支持水平扩展，支持业务快速增长
4. **安全性**: 满足企业级安全要求
5. **可维护**: 代码结构清晰，易于维护和扩展
6. **可监控**: 完整的监控和日志体系

---

## 🏗️ 整体架构设计

### 架构模式

采用**领域驱动设计(DDD) + 事件驱动架构(EDA) + 微服务架构**的混合模式：

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
├─────────────────────────────────────────────────────────────┤
│                   负载均衡 & 路由                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  认证服务   │  │  用户服务   │  │  权限服务   │         │
│  │ Auth Service│  │User Service │  │Permission   │         │
│  │             │  │             │  │Service      │         │
│  │Passport JWT │  │             │  │CASL         │         │
│  └─────────────┘  └─────────────┘  │Permissions  │         │
│                                     └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  租户服务   │  │  组织服务   │  │  事件服务   │         │
│  │Tenant Service│ │Organization │  │Event Service│         │
│  └─────────────┘  │Service      │  └─────────────┘         │
│                    └─────────────┘                          │
├─────────────────────────────────────────────────────────────┤
│                   事件总线 (Event Bus)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  通知服务   │  │  缓存服务   │  │  日志服务   │         │
│  │Notification │  │Cache Service│  │Log Service  │         │
│  │Service      │  └─────────────┘  └─────────────┘         │
│  └─────────────┘                                          │
├─────────────────────────────────────────────────────────────┤
│                   数据层 (Data Layer)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  主数据库   │  │  事件存储   │  │  缓存存储   │         │
│  │Primary DB   │  │Event Store  │  │Cache Store  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选择

#### 后端技术栈

- **框架**: NestJS (Node.js)
- **语言**: TypeScript
- **认证框架**: Passport.js + @nestjs/passport
- **JWT处理**: @nestjs/jwt + passport-jwt
- **本地认证**: passport-local
- **权限管理**: CASL (Conditional Access Control Lists)
- **数据库**: PostgreSQL (主数据库) + Redis (缓存)
- **事件存储**: Apache Kafka + PostgreSQL (事件表)
- **消息队列**: RabbitMQ
- **API文档**: Swagger/OpenAPI
- **测试**: Jest + Supertest
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes (生产环境)

#### 前端技术栈

- **框架**: React + TypeScript
- **状态管理**: Redux Toolkit
- **UI组件库**: Ant Design
- **路由**: React Router
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **测试**: Vitest + React Testing Library

#### 基础设施

- **反向代理**: Nginx
- **负载均衡**: Nginx + HAProxy
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **CI/CD**: GitHub Actions
- **代码质量**: ESLint + Prettier + Husky

---

## 🔐 认证架构设计

### Passport.js 认证策略

#### 认证策略架构

```
┌─────────────────────────────────────────────────────────────┐
│                    认证中间件 (Auth Middleware)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  JWT策略    │  │  本地策略   │  │  OAuth策略  │         │
│  │JWT Strategy │  │Local Strategy│  │OAuth Strategy│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    用户验证服务                              │
├─────────────────────────────────────────────────────────────┤
│                    权限验证服务 (CASL)                       │
└─────────────────────────────────────────────────────────────┘
```

#### JWT认证策略

```typescript
/**
 * @class JwtStrategy
 * @description JWT认证策略
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly logger: PinoLoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * @method validate
   * @description 验证JWT令牌
   * @param payload JWT载荷
   * @returns 用户信息
   */
  async validate(payload: JwtPayload): Promise<User> {
    try {
      const user = await this.userService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('USER_NOT_FOUND', '用户不存在或已停用');
      }

      // 验证租户状态
      if (user.tenant && !user.tenant.isActive) {
        throw new UnauthorizedException('TENANT_SUSPENDED', '租户已暂停');
      }

      this.logger.info('JWT认证成功', { userId: user.id.value });
      return user;
    } catch (error) {
      this.logger.error('JWT认证失败', { error, payload });
      throw new UnauthorizedException('INVALID_TOKEN', '无效的访问令牌');
    }
  }
}
```

#### 本地认证策略

```typescript
/**
 * @class LocalStrategy
 * @description 本地认证策略
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: PinoLoggerService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * @method validate
   * @description 验证用户凭据
   * @param email 邮箱
   * @param password 密码
   * @returns 用户信息
   */
  async validate(email: string, password: string): Promise<User> {
    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        throw new UnauthorizedException(
          'INVALID_CREDENTIALS',
          '邮箱或密码错误',
        );
      }

      this.logger.info('本地认证成功', { email });
      return user;
    } catch (error) {
      this.logger.error('本地认证失败', { error, email });
      throw error;
    }
  }
}
```

### JWT服务实现

#### JWT服务

```typescript
/**
 * @class JwtService
 * @description JWT服务
 */
@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method generateAccessToken
   * @description 生成访问令牌
   * @param user 用户信息
   * @returns 访问令牌
   */
  generateAccessToken(user: User): string {
    const payload = {
      sub: user.id.value,
      email: user.email.value,
      tenantId: user.tenantId.value,
      roles: user.roles.map(role => role.code.value),
      permissions: user.permissions.map(permission => permission.code.value),
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
  }

  /**
   * @method generateRefreshToken
   * @description 生成刷新令牌
   * @param user 用户信息
   * @returns 刷新令牌
   */
  generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id.value,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }

  /**
   * @method verifyToken
   * @description 验证令牌
   * @param token 令牌
   * @returns 载荷信息
   */
  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error('令牌验证失败', { error });
      throw new UnauthorizedException('INVALID_TOKEN', '无效的令牌');
    }
  }

  /**
   * @method refreshToken
   * @description 刷新令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌
   */
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('INVALID_TOKEN_TYPE', '无效的令牌类型');
      }

      // 获取用户信息
      const user = await this.userService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('USER_NOT_FOUND', '用户不存在或已停用');
      }

      return this.generateAccessToken(user);
    } catch (error) {
      this.logger.error('令牌刷新失败', { error });
      throw new UnauthorizedException(
        'INVALID_REFRESH_TOKEN',
        '无效的刷新令牌',
      );
    }
  }
}
```

---

## 🔒 CASL权限管理设计

### CASL权限架构

#### 权限管理架构

```
┌─────────────────────────────────────────────────────────────┐
│                    权限中间件 (Permission Middleware)        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  权限检查   │  │  能力检查   │  │  条件检查   │         │
│  │Permission   │  │Ability      │  │Condition    │         │
│  │Check        │  │Check        │  │Check        │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    CASL能力定义                              │
├─────────────────────────────────────────────────────────────┤
│                    权限规则引擎                              │
└─────────────────────────────────────────────────────────────┘
```

### CASL能力定义

#### 基础能力定义

```typescript
/**
 * @enum Action
 * @description 操作类型枚举
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

/**
 * @enum Subject
 * @description 资源类型枚举
 */
export enum Subject {
  ALL = 'all',
  TENANT = 'tenant',
  USER = 'user',
  ORGANIZATION = 'organization',
  DEPARTMENT = 'department',
  ROLE = 'role',
  PERMISSION = 'permission',
}

/**
 * @interface AppAbility
 * @description 应用能力接口
 */
export interface AppAbility extends Ability {
  // 扩展CASL能力接口
}

/**
 * @class AbilityFactory
 * @description 能力工厂类
 */
@Injectable()
export class AbilityFactory {
  /**
   * @method createForUser
   * @description 为用户创建能力
   * @param user 用户信息
   * @returns 用户能力
   */
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    // 系统管理员拥有所有权限
    if (user.hasRole('SYSTEM_ADMIN')) {
      can(Action.MANAGE, Subject.ALL);
      return build();
    }

    // 租户管理员拥有租户内所有权限
    if (user.hasRole('TENANT_ADMIN')) {
      can(Action.MANAGE, Subject.TENANT, { tenantId: user.tenantId.value });
      can(Action.MANAGE, Subject.USER, { tenantId: user.tenantId.value });
      can(Action.MANAGE, Subject.ORGANIZATION, {
        tenantId: user.tenantId.value,
      });
      can(Action.MANAGE, Subject.DEPARTMENT, { tenantId: user.tenantId.value });
      can(Action.MANAGE, Subject.ROLE, { tenantId: user.tenantId.value });
      can(Action.MANAGE, Subject.PERMISSION, { tenantId: user.tenantId.value });
      return build();
    }

    // 普通用户权限
    user.permissions.forEach(permission => {
      const { action, subject, conditions } = permission;

      if (conditions) {
        can(action, subject, conditions);
      } else {
        can(action, subject);
      }
    });

    // 组织级权限
    user.organizations.forEach(organization => {
      can(Action.READ, Subject.ORGANIZATION, { id: organization.id.value });
      can(Action.READ, Subject.DEPARTMENT, {
        organizationId: organization.id.value,
      });
    });

    // 部门级权限
    user.departments.forEach(department => {
      can(Action.READ, Subject.DEPARTMENT, { id: department.id.value });
      can(Action.READ, Subject.USER, { departmentId: department.id.value });
    });

    // 数据隔离规则
    can(Action.READ, Subject.USER, { tenantId: user.tenantId.value });
    can(Action.UPDATE, Subject.USER, { id: user.id.value });

    return build();
  }
}
```

### 权限装饰器

#### 权限检查装饰器

```typescript
/**
 * @decorator CheckPolicies
 * @description 权限检查装饰器
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata('check_policy', handlers);

/**
 * @decorator PoliciesGuard
 * @description 权限守卫
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: AbilityFactory,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * @method canActivate
   * @description 检查是否可以激活
   * @param context 执行上下文
   * @returns 是否可以激活
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        'check_policy',
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.abilityFactory.createForUser(user);

    const results = await Promise.all(
      policyHandlers.map(handler =>
        this.execPolicyHandler(handler, context, ability),
      ),
    );

    return results.every(result => result === true);
  }

  /**
   * @method execPolicyHandler
   * @description 执行权限处理器
   * @param handler 处理器
   * @param context 执行上下文
   * @param ability 用户能力
   * @returns 执行结果
   */
  private execPolicyHandler(
    handler: PolicyHandler,
    context: ExecutionContext,
    ability: AppAbility,
  ): boolean | Promise<boolean> {
    if (typeof handler === 'function') {
      return handler(context, ability);
    }
    return handler.handle(context, ability);
  }
}
```

#### 权限处理器

```typescript
/**
 * @interface PolicyHandler
 * @description 权限处理器接口
 */
export interface PolicyHandler {
  handle(
    context: ExecutionContext,
    ability: AppAbility,
  ): boolean | Promise<boolean>;
}

/**
 * @class CreateTenantPolicyHandler
 * @description 创建租户权限处理器
 */
export class CreateTenantPolicyHandler implements PolicyHandler {
  handle(context: ExecutionContext, ability: AppAbility): boolean {
    return ability.can(Action.CREATE, Subject.TENANT);
  }
}

/**
 * @class UpdateTenantPolicyHandler
 * @description 更新租户权限处理器
 */
export class UpdateTenantPolicyHandler implements PolicyHandler {
  handle(context: ExecutionContext, ability: AppAbility): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.params.id;

    return ability.can(Action.UPDATE, Subject.TENANT, { id: tenantId });
  }
}

/**
 * @class DeleteTenantPolicyHandler
 * @description 删除租户权限处理器
 */
export class DeleteTenantPolicyHandler implements PolicyHandler {
  handle(context: ExecutionContext, ability: AppAbility): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.params.id;

    return ability.can(Action.DELETE, Subject.TENANT, { id: tenantId });
  }
}
```

### 权限中间件

#### 权限中间件实现

```typescript
/**
 * @class PermissionMiddleware
 * @description 权限中间件
 */
@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  constructor(
    private readonly abilityFactory: AbilityFactory,
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

      // 创建用户能力
      const ability = this.abilityFactory.createForUser(user);
      req.ability = ability;

      // 获取请求的权限要求
      const requiredPermission = this.getRequiredPermission(req);
      if (!requiredPermission) {
        // 没有权限要求，直接通过
        next();
        return;
      }

      // 验证用户权限
      const { action, subject, conditions } = requiredPermission;
      const hasPermission = ability.can(action, subject, conditions);

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
  private getRequiredPermission(req: Request): RequiredPermission | null {
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
  private inferPermissionFromPath(
    method: string,
    path: string,
  ): RequiredPermission | null {
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length < 3) return null;

    const resource = pathSegments[2]; // /api/v1/tenants -> tenants
    const action = this.getActionFromMethod(method);

    return {
      action,
      subject: this.mapResourceToSubject(resource),
      conditions: null,
    };
  }

  /**
   * @method getActionFromMethod
   * @description 从HTTP方法获取操作类型
   * @param method HTTP方法
   * @returns 操作类型
   */
  private getActionFromMethod(method: string): Action {
    switch (method.toUpperCase()) {
      case 'GET':
        return Action.READ;
      case 'POST':
        return Action.CREATE;
      case 'PUT':
        return Action.UPDATE;
      case 'PATCH':
        return Action.UPDATE;
      case 'DELETE':
        return Action.DELETE;
      default:
        return Action.READ;
    }
  }

  /**
   * @method mapResourceToSubject
   * @description 映射资源到主题
   * @param resource 资源名称
   * @returns 主题类型
   */
  private mapResourceToSubject(resource: string): Subject {
    const resourceMap = {
      tenants: Subject.TENANT,
      users: Subject.USER,
      organizations: Subject.ORGANIZATION,
      departments: Subject.DEPARTMENT,
      roles: Subject.ROLE,
      permissions: Subject.PERMISSION,
    };

    return resourceMap[resource] || Subject.ALL;
  }
}
```

---

## 🏛️ 领域驱动设计架构

### 领域层 (Domain Layer)

```
libs/domain/iam/
├── src/
│   ├── domain/
│   │   ├── tenant/           # 租户领域
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── repositories/
│   │   │   └── services/
│   │   ├── user/             # 用户领域
│   │   ├── organization/     # 组织领域
│   │   ├── role/             # 角色领域
│   │   ├── permission/       # 权限领域
│   │   ├── auth/             # 认证领域
│   │   └── event/            # 事件领域
│   └── index.ts
```

### 应用层 (Application Layer)

```
apps/api/src/
├── iam/
│   ├── application/
│   │   ├── commands/         # 命令处理器
│   │   ├── queries/          # 查询处理器
│   │   ├── events/           # 事件处理器
│   │   └── services/         # 应用服务
│   ├── infrastructure/       # 基础设施层
│   └── interfaces/           # 接口层
```

### 基础设施层 (Infrastructure Layer)

```
libs/infrastructure/
├── database/                 # 数据库适配器
├── cache/                    # 缓存适配器
├── messaging/                # 消息队列适配器
├── logging/                  # 日志适配器
└── notification/             # 通知适配器
```

---

## 📊 数据架构设计

### 数据库设计原则

1. **多租户隔离**: 使用租户ID进行数据隔离
2. **事件溯源**: 所有业务操作记录为事件
3. **审计追踪**: 完整的操作历史记录
4. **性能优化**: 合理的索引和分区策略
5. **数据一致性**: 使用事务确保数据一致性

### 核心数据模型

```sql
-- 租户表
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 组织表
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE(tenant_id, code)
);

-- 部门表
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    parent_id UUID,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (parent_id) REFERENCES departments(id),
    UNIQUE(organization_id, code)
);

-- 角色表
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE(tenant_id, code)
);

-- 权限表
CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    scope VARCHAR(20) NOT NULL,
    action VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    UNIQUE(organization_id, code)
);

-- 事件表 (事件溯源)
CREATE TABLE events (
    id UUID PRIMARY KEY,
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    event_version INTEGER NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

---

## 🔄 事件驱动架构设计

### 事件类型定义

```typescript
// 租户事件
export enum TenantEventType {
  TENANT_CREATED = 'tenant.created',
  TENANT_UPDATED = 'tenant.updated',
  TENANT_SUSPENDED = 'tenant.suspended',
  TENANT_ACTIVATED = 'tenant.activated',
  TENANT_DELETED = 'tenant.deleted',
}

// 用户事件
export enum UserEventType {
  USER_REGISTERED = 'user.registered',
  USER_ACTIVATED = 'user.activated',
  USER_SUSPENDED = 'user.suspended',
  USER_ORGANIZATION_ASSIGNED = 'user.organization.assigned',
  USER_DEPARTMENT_ASSIGNED = 'user.department.assigned',
  USER_ROLE_ASSIGNED = 'user.role.assigned',
}

// 组织事件
export enum OrganizationEventType {
  ORGANIZATION_CREATED = 'organization.created',
  ORGANIZATION_UPDATED = 'organization.updated',
  ORGANIZATION_DELETED = 'organization.deleted',
}

// 权限事件
export enum PermissionEventType {
  PERMISSION_GRANTED = 'permission.granted',
  PERMISSION_REVOKED = 'permission.revoked',
  ROLE_ASSIGNED = 'role.assigned',
  ROLE_REMOVED = 'role.removed',
}
```

### 事件处理流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   业务操作   │───▶│  事件发布   │───▶│  事件总线   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐    ┌─────────────┐
                    │  事件存储   │    │  事件处理   │
                    │             │    │             │
                    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐    ┌─────────────┐
                    │  审计日志   │    │  通知服务   │
                    │             │    │             │
                    └─────────────┘    └─────────────┘
```

---

## 🚀 性能优化设计

### 缓存策略

1. **用户会话缓存**: Redis存储用户会话信息
2. **权限缓存**: Redis缓存用户权限和角色信息
3. **组织架构缓存**: Redis缓存组织架构树
4. **查询结果缓存**: Redis缓存常用查询结果

### 数据库优化

1. **索引优化**: 为常用查询字段创建索引
2. **分区策略**: 按租户ID进行表分区
3. **读写分离**: 主从数据库分离
4. **连接池**: 使用数据库连接池

### API性能优化

1. **分页查询**: 支持分页和游标查询
2. **字段过滤**: 支持字段选择
3. **批量操作**: 支持批量创建和更新
4. **异步处理**: 非关键操作异步处理

---

## 📈 监控和运维设计

### 监控指标

1. **业务指标**: 用户注册、登录、权限变更等
2. **性能指标**: 响应时间、吞吐量、错误率
3. **系统指标**: CPU、内存、磁盘、网络
4. **安全指标**: 异常登录、权限异常等

### 日志体系

1. **应用日志**: 业务操作日志
2. **访问日志**: API访问日志
3. **错误日志**: 系统错误日志
4. **审计日志**: 安全审计日志

### 告警机制

1. **性能告警**: 响应时间超时、错误率过高
2. **安全告警**: 异常登录、权限异常
3. **业务告警**: 用户注册异常、系统异常
4. **系统告警**: 服务不可用、资源不足

---

## 🔧 部署架构设计

### 开发环境

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  前端应用   │    │  后端API    │    │   数据库    │
│  (Vite)     │    │  (NestJS)   │    │ (PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
```

### 测试环境

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  负载均衡   │    │  应用集群   │    │  数据库集群 │
│  (Nginx)    │    │  (Docker)   │    │ (PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
```

### 生产环境

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  CDN/负载均衡│    │  K8s集群    │    │  数据库集群 │
│  (Cloud)    │    │  (K8s)      │    │ (PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 📋 实施计划

### 第一阶段：基础架构 (2-3周)

1. 搭建开发环境
2. 实现基础DDD架构
3. 集成Passport.js认证
4. 实现JWT服务
5. 集成CASL权限管理

### 第二阶段：核心功能 (4-5周)

1. 实现租户管理
2. 实现组织架构管理
3. 实现用户管理
4. 实现角色权限管理

### 第三阶段：高级功能 (3-4周)

1. 实现事件溯源
2. 实现通知服务
3. 实现缓存优化
4. 实现监控告警

### 第四阶段：优化和测试 (2-3周)

1. 性能优化
2. 安全加固
3. 全面测试
4. 文档完善

---

## 🎯 风险评估和应对

### 技术风险

1. **性能风险**: 高并发下的性能问题
   - **应对**: 充分的性能测试和优化
2. **安全风险**: 数据泄露和权限漏洞
   - **应对**: 安全审计和渗透测试
3. **可用性风险**: 系统故障和服务中断
   - **应对**: 高可用架构和故障恢复

### 业务风险

1. **需求变更风险**: 业务需求频繁变更
   - **应对**: 灵活架构设计和迭代开发
2. **集成风险**: 与现有系统集成困难
   - **应对**: 标准化接口和兼容性设计

---

## 📚 参考资料

1. [IAM业务需求文档](../business-requirements/iam-business-requirements.md)
2. [领域驱动设计指南](https://martinfowler.com/bliki/DomainDrivenDesign.html)
3. [事件驱动架构指南](https://martinfowler.com/articles/201701-event-driven.html)
4. [微服务架构指南](https://martinfowler.com/microservices/)
5. [NestJS官方文档](https://nestjs.com/)
6. [TypeScript官方文档](https://www.typescriptlang.org/)
7. [Passport.js官方文档](http://www.passportjs.org/)
8. [CASL官方文档](https://casl.js.org/)
9. [JWT官方文档](https://jwt.io/)

---

_本文档将根据项目进展持续更新和完善。_
