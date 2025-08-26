# 混合架构展现层开发指南

## RESTful API + Clean Architecture + 权限控制

## 📋 文档信息

- **文档类型**: 混合架构展现层开发指南
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **文档状态**: 正式版
- **目标读者**: 开发团队
- **架构愿景**: 简洁易用、安全可靠、标准规范

---

## 🎯 展现层核心原则

### 混合架构中的展现层职责

展现层是混合架构的**对外接口**，承载着以下关键职责：

- **RESTful API**: 提供标准化的HTTP接口，遵循REST设计原则
- **请求处理**: 接收HTTP请求，参数验证，格式转换
- **响应管理**: 统一的响应格式，错误处理，状态码管理
- **权限控制**: 身份验证，授权检查，资源访问控制
- **接口文档**: 自动生成API文档，便于前端和第三方集成

### 🚨 展现层纯净性原则

**展现层必须保持简洁，只负责HTTP协议相关的处理：**

#### ✅ 展现层职责

- **HTTP处理**: 接收请求、返回响应、状态码管理
- **参数验证**: 请求参数的格式验证和基础校验
- **DTO转换**: 请求/响应数据的格式转换
- **权限检查**: 调用权限验证和授权检查
- **错误映射**: 将业务异常映射为HTTP错误响应

#### ❌ 禁止的操作

- **不能**包含业务逻辑，所有业务操作委托给应用层
- **不能**直接访问数据库或基础设施层
- **不能**处理事务和复杂的业务规则
- **不能**与领域层直接交互

### 架构分层中的位置

```
>>>>>>>>>> 展现层 (Presentation) ← RESTful API <<<<<<<<<<
    ↓ 直接调用
应用层 (Application) ← Use-Case 业务编排
    ↓ 使用
领域层 (Domain) ← 业务核心（纯净）
    ↓ 依赖
基础设施层 (Infrastructure) ← 技术实现
```

### 展现层组件关系

```
HTTP请求 → 控制器 (Controller)
    ↓ 验证
请求DTO (Request DTO) → 参数验证
    ↓ 调用
Use-Case (Application Layer)
    ↓ 返回
响应DTO (Response DTO) → HTTP响应
```

---

## 📁 展现层目录结构

```
src/{subdomain}/presentation/
├── controllers/                 # 控制器
│   ├── {entity}.controller.ts
│   └── index.ts
├── guards/                     # 权限守卫
│   ├── jwt-auth.guard.ts
│   ├── role.guard.ts
│   └── index.ts
├── decorators/                 # 自定义装饰器
│   ├── require-permissions.decorator.ts
│   ├── current-user.decorator.ts
│   └── index.ts
├── pipes/                      # 管道
│   ├── validation.pipe.ts
│   └── index.ts
├── filters/                    # 异常过滤器
│   ├── domain-exception.filter.ts
│   ├── http-exception.filter.ts
│   └── index.ts
├── interceptors/               # 拦截器
│   ├── response.interceptor.ts
│   ├── logging.interceptor.ts
│   └── index.ts
├── dtos/                       # 展现层DTO
│   ├── request/
│   │   ├── create-{entity}.dto.ts
│   │   ├── update-{entity}.dto.ts
│   │   └── query-{entity}.dto.ts
│   ├── response/
│   │   ├── {entity}-response.dto.ts
│   │   └── paginated-response.dto.ts
│   └── index.ts
├── index.ts                    # 导出文件
└── {subdomain}-presentation.module.ts # 展现层模块
```

---

## 🔧 开发步骤

### 步骤1: 创建请求DTO

```typescript
// dtos/request/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @class CreateUserProfileDto
 * @description 用户档案创建DTO
 */
export class CreateUserProfileDto {
  @ApiProperty({ description: '名', example: '张' })
  @IsString()
  @IsNotEmpty()
  readonly firstName!: string;

  @ApiProperty({ description: '姓', example: '三' })
  @IsString()
  @IsNotEmpty()
  readonly lastName!: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  readonly avatar?: string;

  @ApiProperty({ description: '电话号码', required: false })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiProperty({ description: '部门', required: false })
  @IsOptional()
  @IsString()
  readonly department?: string;

  @ApiProperty({ description: '职位', required: false })
  @IsOptional()
  @IsString()
  readonly title?: string;
}

/**
 * @class CreateUserDto
 * @description 创建用户请求DTO
 *
 * 主要原理与机制：
 * 1. 使用class-validator进行参数验证
 * 2. 使用Swagger装饰器生成API文档
 * 3. 只包含HTTP层的数据验证，不包含业务逻辑
 * 4. 通过class-transformer进行类型转换
 *
 * 功能与业务规则：
 * 1. 用户创建时的必填和可选参数定义
 * 2. 参数格式验证和长度限制
 * 3. 嵌套对象的验证支持
 */
export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  readonly username!: string;

  @ApiProperty({ description: '邮箱地址', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({ description: '组织ID' })
  @IsString()
  @IsNotEmpty()
  readonly organizationId!: string;

  @ApiProperty({ description: '用户档案信息' })
  @ValidateNested()
  @Type(() => CreateUserProfileDto)
  readonly profile!: CreateUserProfileDto;

  @ApiProperty({ description: '角色ID列表', type: [String], required: false })
  @IsOptional()
  @IsString({ each: true })
  readonly roleIds?: string[];
}

// dtos/request/update-user.dto.ts
export class UpdateUserDto {
  @ApiProperty({ description: '用户档案信息', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserProfileDto)
  readonly profile?: CreateUserProfileDto;

  @ApiProperty({ description: '角色ID列表', type: [String], required: false })
  @IsOptional()
  @IsString({ each: true })
  readonly roleIds?: string[];
}

// dtos/request/query-users.dto.ts
export class QueryUsersDto {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  readonly page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  readonly limit?: number = 20;

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiProperty({ description: '组织ID', required: false })
  @IsOptional()
  @IsString()
  readonly organizationId?: string;

  @ApiProperty({ description: '部门ID', required: false })
  @IsOptional()
  @IsString()
  readonly departmentId?: string;

  @ApiProperty({
    description: '用户状态',
    enum: ['pending', 'active', 'suspended', 'locked', 'disabled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'active', 'suspended', 'locked', 'disabled'])
  readonly status?: string;

  @ApiProperty({
    description: '排序字段',
    default: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly orderBy?: string = 'createdAt';

  @ApiProperty({
    description: '排序方向',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  readonly orderDirection?: 'asc' | 'desc' = 'desc';
}
```

### 步骤2: 创建响应DTO

```typescript
// dtos/response/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

/**
 * @class UserProfileResponseDto
 * @description 用户档案响应DTO
 */
export class UserProfileResponseDto {
  @ApiProperty({ description: '名' })
  readonly firstName!: string;

  @ApiProperty({ description: '姓' })
  readonly lastName!: string;

  @ApiProperty({ description: '头像URL', required: false })
  readonly avatar?: string;

  @ApiProperty({ description: '电话号码', required: false })
  readonly phone?: string;

  @ApiProperty({ description: '部门', required: false })
  readonly department?: string;

  @ApiProperty({ description: '职位', required: false })
  readonly title?: string;
}

/**
 * @class UserResponseDto
 * @description 用户响应DTO
 *
 * 主要原理与机制：
 * 1. 定义API返回给客户端的数据结构
 * 2. 使用Swagger装饰器生成响应文档
 * 3. 提供静态工厂方法进行数据转换
 * 4. 隐藏敏感信息，只暴露必要字段
 *
 * 功能与业务规则：
 * 1. 用户信息的标准化输出格式
 * 2. 包含用户基本信息和档案信息
 * 3. 审计字段的时间格式化
 */
export class UserResponseDto {
  @ApiProperty({ description: '用户ID' })
  readonly id!: string;

  @ApiProperty({ description: '用户名' })
  readonly username!: string;

  @ApiProperty({ description: '邮箱地址' })
  readonly email!: string;

  @ApiProperty({
    description: '用户状态',
    enum: ['pending', 'active', 'suspended', 'locked', 'disabled'],
  })
  readonly status!: string;

  @ApiProperty({ description: '用户档案信息' })
  readonly profile!: UserProfileResponseDto;

  @ApiProperty({ description: '组织ID' })
  readonly organizationId!: string;

  @ApiProperty({ description: '租户ID' })
  readonly tenantId!: string;

  @ApiProperty({ description: '部门ID列表', type: [String] })
  readonly departmentIds!: string[];

  @ApiProperty({ description: '角色ID列表', type: [String] })
  readonly roleIds!: string[];

  @ApiProperty({ description: '创建时间' })
  readonly createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  readonly updatedAt!: Date;

  /**
   * @static
   * @method fromApplicationDto
   * @description 从应用层DTO转换为展现层响应DTO
   */
  static fromApplicationDto(applicationDto: any): UserResponseDto {
    return {
      id: applicationDto.id,
      username: applicationDto.username,
      email: applicationDto.email,
      status: applicationDto.status,
      profile: {
        firstName: applicationDto.profile.firstName,
        lastName: applicationDto.profile.lastName,
        avatar: applicationDto.profile.avatar,
        phone: applicationDto.profile.phone,
        department: applicationDto.profile.department,
        title: applicationDto.profile.title,
      },
      organizationId: applicationDto.organizationId,
      tenantId: applicationDto.tenantId,
      departmentIds: applicationDto.departmentIds || [],
      roleIds: applicationDto.roleIds || [],
      createdAt: applicationDto.createdAt,
      updatedAt: applicationDto.updatedAt,
    };
  }
}

// dtos/response/paginated-response.dto.ts
export class PaginationMetaDto {
  @ApiProperty({ description: '当前页码' })
  readonly page!: number;

  @ApiProperty({ description: '每页数量' })
  readonly limit!: number;

  @ApiProperty({ description: '总记录数' })
  readonly total!: number;

  @ApiProperty({ description: '总页数' })
  readonly totalPages!: number;

  @ApiProperty({ description: '是否有下一页' })
  readonly hasNext!: boolean;

  @ApiProperty({ description: '是否有上一页' })
  readonly hasPrev!: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: '数据列表' })
  readonly data!: T[];

  @ApiProperty({ description: '分页元信息' })
  readonly meta!: PaginationMetaDto;

  static fromApplicationResponse<T>(
    applicationResponse: any,
  ): PaginatedResponseDto<T> {
    return {
      data: applicationResponse.data,
      meta: {
        page: applicationResponse.page,
        limit: applicationResponse.limit,
        total: applicationResponse.total,
        totalPages: applicationResponse.totalPages,
        hasNext: applicationResponse.page < applicationResponse.totalPages,
        hasPrev: applicationResponse.page > 1,
      },
    };
  }
}
```

### 步骤3: 创建控制器

```typescript
// controllers/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';

import { CreateUserDto } from '../dtos/request/create-user.dto';
import { UpdateUserDto } from '../dtos/request/update-user.dto';
import { QueryUsersDto } from '../dtos/request/query-users.dto';
import { UserResponseDto } from '../dtos/response/user-response.dto';
import { PaginatedResponseDto } from '../dtos/response/paginated-response.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

/**
 * @class UserController
 * @description 用户管理控制器
 *
 * 主要原理与机制：
 * 1. 提供RESTful API接口，遵循REST设计原则
 * 2. 使用NestJS装饰器进行路由定义和参数验证
 * 3. 通过Use-Case模式调用应用层业务逻辑
 * 4. 集成权限验证和API文档生成
 *
 * 功能与业务规则：
 * 1. 用户CRUD操作的HTTP接口
 * 2. 统一的错误处理和响应格式
 * 3. 基于角色和权限的访问控制
 * 4. 自动生成的API文档
 */
@ApiTags('用户管理')
@Controller('api/v1/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  /**
   * @method create
   * @description 创建用户
   */
  @Post()
  @ApiOperation({
    summary: '创建用户',
    description: '创建新用户，需要管理员权限',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '用户创建成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '权限不足',
  })
  @RequirePermissions('user:create')
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    // 添加当前操作用户信息
    const applicationDto = {
      ...createUserDto,
      operatorId: currentUser.id,
      tenantId: currentUser.tenantId,
    };

    // 调用应用层Use-Case
    const result = await this.createUserUseCase.execute(applicationDto);

    // 转换为展现层响应DTO
    return UserResponseDto.fromApplicationDto(result);
  }

  /**
   * @method findById
   * @description 根据ID获取用户
   */
  @Get(':id')
  @ApiOperation({
    summary: '获取用户详情',
    description: '根据用户ID获取用户详细信息',
  })
  @ApiParam({
    name: 'id',
    description: '用户ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '用户不存在',
  })
  @RequirePermissions('user:read')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const result = await this.getUserUseCase.execute({
      id,
      tenantId: currentUser.tenantId,
    });

    return UserResponseDto.fromApplicationDto(result);
  }

  /**
   * @method findAll
   * @description 获取用户列表
   */
  @Get()
  @ApiOperation({
    summary: '获取用户列表',
    description: '分页获取用户列表，支持搜索和过滤',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '搜索关键词',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  @RequirePermissions('user:read')
  async findAll(
    @Query() queryDto: QueryUsersDto,
    @CurrentUser() currentUser: any,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const applicationQuery = {
      ...queryDto,
      tenantId: currentUser.tenantId,
    };

    const result = await this.getUsersUseCase.execute(applicationQuery);

    // 转换每个用户数据
    const responseData = result.data.map(user =>
      UserResponseDto.fromApplicationDto(user),
    );

    return {
      data: responseData,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
    };
  }

  /**
   * @method update
   * @description 更新用户
   */
  @Put(':id')
  @ApiOperation({
    summary: '更新用户',
    description: '更新用户信息，需要相应权限',
  })
  @ApiParam({
    name: 'id',
    description: '用户ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '用户不存在',
  })
  @RequirePermissions('user:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const applicationDto = {
      id,
      ...updateUserDto,
      operatorId: currentUser.id,
      tenantId: currentUser.tenantId,
    };

    const result = await this.updateUserUseCase.execute(applicationDto);

    return UserResponseDto.fromApplicationDto(result);
  }

  /**
   * @method remove
   * @description 删除用户
   */
  @Delete(':id')
  @ApiOperation({
    summary: '删除用户',
    description: '软删除用户，需要管理员权限',
  })
  @ApiParam({
    name: 'id',
    description: '用户ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '删除成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '用户不存在',
  })
  @RequirePermissions('user:delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.deleteUserUseCase.execute({
      id,
      operatorId: currentUser.id,
      tenantId: currentUser.tenantId,
    });
  }

  /**
   * @method activate
   * @description 激活用户
   */
  @Put(':id/activate')
  @ApiOperation({
    summary: '激活用户',
    description: '激活指定用户账号',
  })
  @ApiParam({
    name: 'id',
    description: '用户ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '激活成功',
    type: UserResponseDto,
  })
  @RequirePermissions('user:activate')
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    // 这里可以调用专门的激活Use-Case
    const result = await this.updateUserUseCase.execute({
      id,
      status: 'active',
      operatorId: currentUser.id,
      tenantId: currentUser.tenantId,
    });

    return UserResponseDto.fromApplicationDto(result);
  }

  /**
   * @method suspend
   * @description 暂停用户
   */
  @Put(':id/suspend')
  @ApiOperation({
    summary: '暂停用户',
    description: '暂停指定用户账号',
  })
  @RequirePermissions('user:suspend')
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() suspendDto: { reason?: string },
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const result = await this.updateUserUseCase.execute({
      id,
      status: 'suspended',
      reason: suspendDto.reason,
      operatorId: currentUser.id,
      tenantId: currentUser.tenantId,
    });

    return UserResponseDto.fromApplicationDto(result);
  }
}
```

### 步骤7: 创建拦截器

```typescript
// interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @interface StandardResponse
 * @description 标准响应格式
 */
export interface StandardResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
}

/**
 * @class ResponseInterceptor
 * @description 响应格式化拦截器
 *
 * 主要原理与机制：
 * 1. 拦截所有成功的HTTP响应
 * 2. 将响应数据包装为统一的格式
 * 3. 添加时间戳和请求路径信息
 * 4. 区分成功和失败的响应状态
 *
 * 功能与业务规则：
 * 1. 统一的API响应格式
 * 2. 客户端友好的数据结构
 * 3. 便于前端处理的响应格式
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        message: this.getSuccessMessage(request.method),
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }

  private getSuccessMessage(method: string): string {
    const methodMessages: Record<string, string> = {
      GET: '查询成功',
      POST: '创建成功',
      PUT: '更新成功',
      PATCH: '更新成功',
      DELETE: '删除成功',
    };

    return methodMessages[method] || '操作成功';
  }
}

// interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * @class LoggingInterceptor
 * @description 请求日志拦截器
 *
 * 主要原理与机制：
 * 1. 记录所有HTTP请求的详细信息
 * 2. 计算请求处理时间
 * 3. 记录请求参数和响应数据（可配置）
 * 4. 异常情况的日志记录
 *
 * 功能与业务规则：
 * 1. 全面的API访问日志
 * 2. 性能监控和分析
 * 3. 调试和故障排查
 * 4. 安全审计跟踪
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, params, query, body, user, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(`[${method}] ${url} - 请求开始`, {
      method,
      url,
      params,
      query,
      // 生产环境中可能需要过滤敏感信息
      body: this.filterSensitiveData(body),
      userId: user?.id,
      userAgent,
      ip,
    });

    return next.handle().pipe(
      tap(data => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 记录请求成功
        this.logger.log(`[${method}] ${url} - 请求成功 ${duration}ms`, {
          method,
          url,
          duration,
          userId: user?.id,
          dataSize: JSON.stringify(data).length,
        });
      }),
      catchError(error => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 记录请求失败
        this.logger.error(`[${method}] ${url} - 请求失败 ${duration}ms`, {
          method,
          url,
          duration,
          userId: user?.id,
          error: error.message,
          stack: error.stack,
        });

        return throwError(() => error);
      }),
    );
  }

  private filterSensitiveData(data: any): any {
    if (!data) return data;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];
    const filtered = { ...data };

    sensitiveFields.forEach(field => {
      if (field in filtered) {
        filtered[field] = '***';
      }
    });

    return filtered;
  }
}
```

### 步骤8: 创建验证管道

```typescript
// pipes/validation.pipe.ts
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe as BaseValidationPipe,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * @class CustomValidationPipe
 * @description 自定义验证管道
 *
 * 主要原理与机制：
 * 1. 继承NestJS的ValidationPipe
 * 2. 自定义验证错误消息格式
 * 3. 支持国际化的错误消息
 * 4. 提供详细的验证失败信息
 *
 * 功能与业务规则：
 * 1. 请求参数的自动验证
 * 2. 友好的验证错误消息
 * 3. 支持嵌套对象验证
 * 4. 类型转换和格式化
 */
@Injectable()
export class CustomValidationPipe extends BaseValidationPipe {
  constructor() {
    super({
      whitelist: true, // 自动删除非DTO属性
      forbidNonWhitelisted: true, // 禁止非白名单属性
      transform: true, // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = this.formatValidationErrors(errors);
        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: '请求参数验证失败',
          details: formattedErrors,
        });
      },
    });
  }

  private formatValidationErrors(errors: ValidationError[]): any {
    return errors.reduce((acc, error) => {
      const field = error.property;

      if (error.children && error.children.length > 0) {
        // 处理嵌套对象验证错误
        acc[field] = this.formatValidationErrors(error.children);
      } else {
        // 处理基础字段验证错误
        acc[field] = Object.values(error.constraints || {});
      }

      return acc;
    }, {});
  }
}

// pipes/parse-uuid.pipe.ts
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate as isUuid } from 'uuid';

/**
 * @class ParseUuidPipe
 * @description UUID解析管道
 *
 * 主要原理与机制：
 * 1. 验证字符串是否为有效的UUID格式
 * 2. 提供友好的UUID验证错误消息
 * 3. 支持不同版本的UUID验证
 *
 * 功能与业务规则：
 * 1. URL参数的UUID格式验证
 * 2. 防止无效UUID导致的数据库错误
 * 3. 统一的UUID验证逻辑
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isUuid(value)) {
      throw new BadRequestException({
        code: 'INVALID_UUID',
        message: `参数 "${metadata.data}" 必须是有效的UUID格式`,
        details: {
          field: metadata.data,
          value,
          expectedFormat: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
      });
    }
    return value;
  }
}
```

### 步骤9: 配置展现层模块

```typescript
// user-presentation.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserController } from './controllers/user.controller';
import { UserApplicationModule } from '../application/user-application.module';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { DomainExceptionFilter } from './filters/domain-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { CustomValidationPipe } from './pipes/validation.pipe';

/**
 * @class UserPresentationModule
 * @description 用户展现层模块
 *
 * 主要原理与机制：
 * 1. 配置展现层的所有组件和依赖
 * 2. 集成身份验证和权限控制
 * 3. 注册全局中间件和过滤器
 * 4. 提供统一的API接口
 *
 * 功能与业务规则：
 * 1. 用户管理API的完整配置
 * 2. 安全和监控机制
 * 3. 错误处理和响应格式化
 */
@Module({
  imports: [
    // 导入应用层模块
    UserApplicationModule,

    // JWT配置
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    // 全局守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },

    // 全局拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // 全局验证管道
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
  exports: [UserController],
})
export class UserPresentationModule {}

// 主模块集成
// user.module.ts
import { Module } from '@nestjs/common';
import { UserDomainModule } from './domain/user-domain.module';
import { UserApplicationModule } from './application/user-application.module';
import { UserPresentationModule } from './presentation/user-presentation.module';

/**
 * @class UserModule
 * @description 用户模块总集成
 *
 * 主要原理与机制：
 * 1. 集成用户相关的所有层次模块
 * 2. 提供完整的用户管理功能
 * 3. 遵循Clean Architecture的分层原则
 * 4. 支持模块化的独立部署
 *
 * 功能与业务规则：
 * 1. 用户CRUD操作的完整实现
 * 2. 权限控制和安全机制
 * 3. 事件驱动的业务流程
 * 4. 标准化的API接口
 */
@Module({
  imports: [
    UserDomainModule, // 领域层
    UserApplicationModule, // 应用层
    UserPresentationModule, // 展现层
  ],
  exports: [UserApplicationModule, UserPresentationModule],
})
export class UserModule {}
```

### 步骤10: API文档配置

```typescript
// swagger/swagger.config.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * @function setupSwagger
 * @description 配置Swagger API文档
 *
 * 主要原理与机制：
 * 1. 使用NestJS的Swagger集成
 * 2. 自动从装饰器生成API文档
 * 3. 支持在线API测试
 * 4. 提供标准的OpenAPI规范
 *
 * 功能与业务规则：
 * 1. 完整的API文档生成
 * 2. 开发和测试便利性
 * 3. 前端集成的API规范
 * 4. 第三方集成的接口文档
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('AIOFIX IAM API')
    .setDescription('身份与访问管理系统API文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('用户管理', '用户相关的CRUD操作')
    .addTag('组织管理', '组织相关的CRUD操作')
    .addTag('角色权限', '角色和权限管理')
    .addTag('认证授权', '登录、登出、令牌管理')
    .addServer('http://localhost:3000', '开发环境')
    .addServer('https://api.aiofix.com', '生产环境')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'AIOFIX IAM API 文档',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });
}
```

---

## ⚠️ 开发要点

### DO ✅ 最佳实践

1. **保持展现层简洁**: 控制器只负责HTTP协议处理，业务逻辑委托给应用层
2. **统一响应格式**: 使用拦截器统一成功和失败的响应格式
3. **完善参数验证**: 使用DTO和装饰器进行严格的参数验证
4. **权限细粒度控制**: 基于权限而非角色进行访问控制
5. **完整的API文档**: 使用Swagger装饰器生成完整的API文档
6. **全面的异常处理**: 区分业务异常和技术异常，提供友好的错误信息
7. **安全的敏感信息处理**: 过滤日志中的敏感数据，防止信息泄露
8. **RESTful设计**: 遵循REST设计原则，使用合适的HTTP动词和状态码

### DON'T ❌ 反模式

1. **不要在控制器中写业务逻辑**: 控制器只负责协议转换
2. **不要直接访问数据库**: 必须通过应用层的Use-Case
3. **不要忽略权限验证**: 所有敏感操作都需要权限检查
4. **不要忽略参数验证**: 所有外部输入都必须验证
5. **不要硬编码状态码**: 使用HttpStatus枚举
6. **不要在响应中暴露敏感信息**: 通过DTO控制输出字段
7. **不要忽略日志记录**: 记录关键操作和异常情况
8. **不要忽略API版本管理**: 为API变更做好版本控制

---

## 🏗️ 实际使用示例

### 完整的API调用流程

```typescript
// 1. 客户端请求
POST /api/v1/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "organizationId": "org-123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "roleIds": ["role-user"]
}

// 2. 成功响应
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "user-456",
    "username": "john_doe",
    "email": "john@example.com",
    "status": "pending",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    },
    "organizationId": "org-123",
    "tenantId": "tenant-789",
    "departmentIds": [],
    "roleIds": ["role-user"],
    "createdAt": "2024-12-25T10:30:00.000Z",
    "updatedAt": "2024-12-25T10:30:00.000Z"
  },
  "message": "创建成功",
  "timestamp": "2024-12-25T10:30:00.000Z",
  "path": "/api/v1/users"
}

// 3. 验证失败响应
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": {
      "email": ["邮箱格式无效"],
      "profile": {
        "firstName": ["名不能为空"]
      }
    },
    "timestamp": "2024-12-25T10:30:00.000Z",
    "path": "/api/v1/users"
  }
}

// 4. 权限不足响应
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "HTTP_403",
    "message": "权限不足，需要权限: user:create",
    "timestamp": "2024-12-25T10:30:00.000Z",
    "path": "/api/v1/users"
  }
}
```

### 权限配置示例

```typescript
// 权限配置文件
export const USER_PERMISSIONS = {
  // 基础权限
  'user:read': '查看用户信息',
  'user:create': '创建用户',
  'user:update': '更新用户信息',
  'user:delete': '删除用户',

  // 状态管理权限
  'user:activate': '激活用户',
  'user:suspend': '暂停用户',
  'user:lock': '锁定用户',

  // 高级权限
  'user:manage': '用户管理（包含所有用户权限）',
  'user:*': '用户所有权限',
  '*': '超级管理员权限',
};

// 角色权限映射
export const ROLE_PERMISSIONS = {
  admin: ['*'],
  user_manager: ['user:*'],
  user_operator: ['user:read', 'user:create', 'user:update'],
  user_viewer: ['user:read'],
};
```

---

## 🧪 测试指南

### 控制器单元测试

```typescript
// user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../application/use-cases/get-user.use-case';
import { CreateUserDto } from './dtos/request/create-user.dto';
import { UserResponseDto } from './dtos/response/user-response.dto';

describe('UserController', () => {
  let controller: UserController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let getUserUseCase: jest.Mocked<GetUserUseCase>;

  beforeEach(async () => {
    const mockCreateUserUseCase = {
      execute: jest.fn(),
    };

    const mockGetUserUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
        { provide: GetUserUseCase, useValue: mockGetUserUseCase },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    createUserUseCase = module.get(CreateUserUseCase);
    getUserUseCase = module.get(GetUserUseCase);
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        username: 'john_doe',
        email: 'john@example.com',
        organizationId: 'org-123',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const currentUser = {
        id: 'admin-123',
        tenantId: 'tenant-789',
      };

      const expectedResult = {
        id: 'user-456',
        username: 'john_doe',
        email: 'john@example.com',
        status: 'pending',
        // ... 其他字段
      };

      createUserUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createUserDto, currentUser);

      // Assert
      expect(createUserUseCase.execute).toHaveBeenCalledWith({
        ...createUserDto,
        operatorId: currentUser.id,
        tenantId: currentUser.tenantId,
      });
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe(expectedResult.id);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidDto = {
        username: '', // 无效的用户名
        email: 'invalid-email', // 无效的邮箱
      } as CreateUserDto;

      // Act & Assert
      await expect(
        controller.create(invalidDto, {
          id: 'admin-123',
          tenantId: 'tenant-789',
        }),
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should get user by id successfully', async () => {
      // Arrange
      const userId = 'user-456';
      const currentUser = { tenantId: 'tenant-789' };
      const expectedUser = {
        id: userId,
        username: 'john_doe',
        // ... 其他字段
      };

      getUserUseCase.execute.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.findById(userId, currentUser);

      // Assert
      expect(getUserUseCase.execute).toHaveBeenCalledWith({
        id: userId,
        tenantId: currentUser.tenantId,
      });
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe(userId);
    });
  });
});
```

### E2E测试

```typescript
// user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserTestHelper } from './helpers/user-test.helper';

describe('User API (e2e)', () => {
  let app: INestApplication;
  let userTestHelper: UserTestHelper;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userTestHelper = new UserTestHelper(app);
    authToken = await userTestHelper.getAdminToken();
  });

  afterEach(async () => {
    await userTestHelper.cleanup();
    await app.close();
  });

  describe('POST /api/v1/users', () => {
    it('should create user successfully with admin token', async () => {
      // Arrange
      const createUserDto = {
        username: 'test_user',
        email: 'test@example.com',
        organizationId: await userTestHelper.getTestOrganizationId(),
        profile: {
          firstName: 'Test',
          lastName: 'User',
        },
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createUserDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(createUserDto.username);
      expect(response.body.data.email).toBe(createUserDto.email);
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 401 without auth token', async () => {
      const createUserDto = {
        username: 'test_user',
        email: 'test@example.com',
        organizationId: 'org-123',
        profile: {
          firstName: 'Test',
          lastName: 'User',
        },
      };

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        username: '', // 无效
        email: 'invalid-email', // 无效
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by id', async () => {
      // Arrange
      const createdUser = await userTestHelper.createTestUser();

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${createdUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdUser.id);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

---

## 📚 参考资料

- [NestJS Documentation](https://docs.nestjs.com/)
- [RESTful API Design](https://restfulapi.net/)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)

---

## 🎯 总结

展现层是混合架构的**对外接口**，遵循以下关键原则：

### 核心理念

1. **简洁易用**: 提供标准化的RESTful API，遵循REST设计原则
2. **安全可靠**: 完善的身份验证和权限控制机制
3. **标准规范**: 统一的请求/响应格式和错误处理
4. **文档完善**: 自动生成的API文档，便于集成和维护

### 设计模式

1. **控制器模式**: 处理HTTP请求和响应
2. **DTO模式**: 数据传输对象，控制输入输出格式
3. **守卫模式**: 身份验证和权限控制
4. **拦截器模式**: 请求/响应的统一处理
5. **过滤器模式**: 异常处理和错误响应
6. **管道模式**: 数据验证和转换

### 实施策略

1. 先定义DTO和API接口规范
2. 再实现控制器和基础功能
3. 然后添加权限控制和安全机制
4. 最后完善监控、日志和文档

### 架构特色

1. **分层清晰**: 展现层只负责协议处理，业务逻辑在应用层
2. **权限细粒度**: 基于权限的访问控制，支持多租户
3. **响应统一**: 标准化的成功和失败响应格式
4. **文档自动**: 基于装饰器的API文档生成
5. **监控完善**: 全面的请求日志和性能监控

### 与其他层的配合

```
展现层：提供RESTful API接口 ← 客户端调用
    ↓ 调用
应用层：Use-Case业务编排 ← 混合架构的中枢
    ↓ 使用
领域层：纯净的业务逻辑 ← 业务核心
    ↓ 依赖
基础设施层：技术实现和数据存储 ← 技术支撑
```

这样的展现层设计能够提供简洁易用的API接口，同时保持系统的安全性和可维护性，完美配合混合架构的其他层次，实现"对外简洁、对内强大"的架构愿景。
