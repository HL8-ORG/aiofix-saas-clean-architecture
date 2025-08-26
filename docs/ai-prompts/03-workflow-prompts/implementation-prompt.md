# 代码实现工作流提示词

## 🎯 工作流目标

引导AI按照标准的代码实现流程，确保生成的代码符合架构规范、业务需求和质量标准。

## 📋 实施步骤

### 第一步：需求理解与分析

在开始实现之前，必须完成以下分析：

```markdown
## 需求分析检查清单

### 业务需求理解

- [ ] 明确要实现的业务功能和价值
- [ ] 识别涉及的业务实体和概念
- [ ] 理解业务规则和约束条件
- [ ] 确定业务流程和状态转换

### 技术需求分析

- [ ] 确定功能归属的架构层次
- [ ] 识别需要的依赖和接口
- [ ] 评估性能和可扩展性要求
- [ ] 分析安全和权限要求

### 示例分析输出：

功能：用户角色分配

- 业务目标：为用户分配组织角色，控制访问权限
- 涉及实体：User、Role、Organization
- 业务规则：同租户内分配、角色互斥性检查、权限验证
- 技术归属：应用层Use Case + 领域层业务逻辑
```

### 第二步：架构设计

基于需求分析，设计技术实现方案：

```typescript
// ✅ 架构设计示例

/**
 * 架构设计：用户角色分配功能
 *
 * 分层设计：
 * 1. Presentation Layer: UserController.assignRole()
 * 2. Application Layer: AssignUserRoleUseCase
 * 3. Domain Layer: UserAggregate.assignRole()
 * 4. Infrastructure Layer: UserRepository、RoleRepository
 *
 * 事件设计：
 * - UserRoleAssignedEvent: 角色分配成功事件
 * - UserRoleAssignmentFailedEvent: 角色分配失败事件
 *
 * 数据流：
 * API请求 → Controller → UseCase → Domain → Repository → Database
 *          ← Response ← Result ← Event ← Aggregate ←
 */

// 接口设计
interface AssignUserRoleCommand {
  userId: string;
  roleId: string;
  organizationId: string;
  assignedBy: string;
  tenantId: string;
}

interface AssignUserRoleResult {
  success: boolean;
  userId: string;
  roleId: string;
  assignedAt: Date;
}
```

### 第三步：领域层实现

从领域层开始实现，确保业务逻辑正确：

```typescript
// ✅ 领域层实现示例

export class UserAggregate extends AggregateRoot {
  /**
   * @description
   * 为用户分配角色的核心业务方法
   *
   * 业务规则：
   * 1. 角色必须属于同一租户
   * 2. 用户必须是组织成员
   * 3. 不能重复分配相同角色
   * 4. 检查角色互斥性
   * 5. 验证分配者权限
   *
   * @param roleId 角色ID
   * @param organizationId 组织ID
   * @param assignedBy 分配者ID
   * @throws UserNotInOrganizationException 用户不在组织中
   * @throws RoleAlreadyAssignedException 角色已分配
   * @throws ConflictingRoleException 角色冲突
   * @fires UserRoleAssignedEvent 角色分配成功事件
   */
  public assignRole(
    roleId: Uuid,
    organizationId: Uuid,
    assignedBy: Uuid,
  ): void {
    // 1. 验证用户是否在组织中
    this.ensureUserInOrganization(organizationId);

    // 2. 检查角色是否已分配
    this.ensureRoleNotAlreadyAssigned(roleId);

    // 3. 验证角色互斥性
    this.ensureNoConflictingRoles(roleId);

    // 4. 执行角色分配
    const assignment = UserRoleAssignment.create(
      this.id,
      roleId,
      organizationId,
      assignedBy,
      new Date(),
    );

    this.roleAssignments.add(assignment);

    // 5. 发布领域事件
    this.addDomainEvent(
      new UserRoleAssignedEvent(
        this.id,
        roleId,
        organizationId,
        assignedBy,
        this.tenantId,
      ),
    );
  }

  private ensureUserInOrganization(organizationId: Uuid): void {
    if (!this.organizations.some(org => org.getId().equals(organizationId))) {
      throw new UserNotInOrganizationException(this.id, organizationId);
    }
  }

  private ensureRoleNotAlreadyAssigned(roleId: Uuid): void {
    if (
      this.roleAssignments.some(
        assignment =>
          assignment.getRoleId().equals(roleId) && assignment.isActive(),
      )
    ) {
      throw new RoleAlreadyAssignedException(this.id, roleId);
    }
  }

  private ensureNoConflictingRoles(roleId: Uuid): void {
    // 实现角色互斥性检查逻辑
    const conflictingRoles = this.getConflictingRoles(roleId);
    if (conflictingRoles.length > 0) {
      throw new ConflictingRoleException(roleId, conflictingRoles);
    }
  }
}
```

### 第四步：应用层实现

实现Use Case协调业务流程：

```typescript
// ✅ 应用层实现示例

@Injectable()
export class AssignUserRoleUseCase
  implements IUseCase<AssignUserRoleCommand, AssignUserRoleResult>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly eventBus: IEventBus,
    private readonly permissionService: IPermissionService,
    private readonly logger: PinoLoggerService,
  ) {}

  @Transactional()
  async execute(command: AssignUserRoleCommand): Promise<AssignUserRoleResult> {
    this.logger.info('开始执行用户角色分配', { command });

    try {
      // 1. 验证分配者权限
      await this.validateAssignerPermission(command);

      // 2. 加载用户聚合
      const user = await this.loadUserAggregate(
        command.userId,
        command.tenantId,
      );

      // 3. 验证角色有效性
      await this.validateRole(command.roleId, command.tenantId);

      // 4. 执行业务逻辑
      user.assignRole(
        new Uuid(command.roleId),
        new Uuid(command.organizationId),
        new Uuid(command.assignedBy),
      );

      // 5. 持久化更改
      await this.userRepository.save(user);

      // 6. 发布事件
      await this.eventBus.publishAll(user.getUncommittedEvents());

      // 7. 清除权限缓存
      await this.clearPermissionCache(command.userId);

      const result = new AssignUserRoleResult(
        true,
        command.userId,
        command.roleId,
        new Date(),
      );

      this.logger.info('用户角色分配成功', {
        userId: command.userId,
        roleId: command.roleId,
      });

      return result;
    } catch (error) {
      this.logger.error('用户角色分配失败', { command, error });
      throw error;
    }
  }

  private async validateAssignerPermission(
    command: AssignUserRoleCommand,
  ): Promise<void> {
    const hasPermission = await this.permissionService.check(
      command.assignedBy,
      'user:role:assign',
      { organizationId: command.organizationId, tenantId: command.tenantId },
    );

    if (!hasPermission) {
      throw new InsufficientPermissionException('用户角色分配权限不足');
    }
  }

  private async loadUserAggregate(
    userId: string,
    tenantId: string,
  ): Promise<UserAggregate> {
    const user = await this.userRepository.findById(new Uuid(userId), tenantId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return user;
  }

  private async validateRole(roleId: string, tenantId: string): Promise<void> {
    const role = await this.roleRepository.findById(new Uuid(roleId), tenantId);

    if (!role) {
      throw new RoleNotFoundException(roleId);
    }

    if (!role.isActive()) {
      throw new InactiveRoleException(roleId);
    }
  }

  private async clearPermissionCache(userId: string): Promise<void> {
    // 实现权限缓存清除逻辑
  }
}
```

### 第五步：基础设施层实现

实现数据持久化和外部服务集成：

```typescript
// ✅ 基础设施层实现示例

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    private readonly orm: MikroORM,
    private readonly mapper: UserMapper,
    private readonly cache: ICacheService,
    private readonly logger: PinoLoggerService,
  ) {}

  async save(user: UserAggregate): Promise<void> {
    const em = this.orm.em.fork();

    try {
      await em.begin();

      // 1. 映射聚合根到ORM实体
      const userEntity = await this.mapper.toOrm(user, em);

      // 2. 处理角色分配关系
      await this.syncRoleAssignments(user, userEntity, em);

      // 3. 乐观锁检查
      this.handleOptimisticLocking(user, userEntity);

      // 4. 持久化
      em.persist(userEntity);
      await em.commit();

      // 5. 清除相关缓存
      await this.invalidateRelatedCache(user);

      this.logger.info('用户聚合保存成功', {
        userId: user.getId().value,
        version: user.getVersion(),
      });
    } catch (error) {
      await em.rollback();
      this.logger.error('用户聚合保存失败', { error });
      throw new InfrastructureException('用户数据保存失败', error);
    }
  }

  private async syncRoleAssignments(
    user: UserAggregate,
    userEntity: UserOrmEntity,
    em: EntityManager,
  ): Promise<void> {
    // 获取新的角色分配
    const newAssignments = user.getRoleAssignments();

    // 清除现有的角色分配关系
    await em
      .createQueryBuilder(UserRoleOrmEntity)
      .delete()
      .where({ userId: user.getId().value })
      .execute();

    // 创建新的角色分配关系
    for (const assignment of newAssignments) {
      const roleEntity = new UserRoleOrmEntity();
      roleEntity.userId = user.getId().value;
      roleEntity.roleId = assignment.getRoleId().value;
      roleEntity.organizationId = assignment.getOrganizationId().value;
      roleEntity.assignedBy = assignment.getAssignedBy().value;
      roleEntity.assignedAt = assignment.getAssignedAt();
      roleEntity.isActive = assignment.isActive();

      em.persist(roleEntity);
    }
  }

  private handleOptimisticLocking(
    user: UserAggregate,
    userEntity: UserOrmEntity,
  ): void {
    if (user.getVersion() > 0 && userEntity.version !== user.getVersion()) {
      throw new OptimisticLockingException(
        `用户 ${user.getId().value} 已被其他进程修改`,
      );
    }

    userEntity.version = user.getVersion() + 1;
  }

  private async invalidateRelatedCache(user: UserAggregate): Promise<void> {
    const cacheKeys = [
      `user:${user.getId().value}:${user.getTenantId()}`,
      `user:permissions:${user.getId().value}:${user.getTenantId()}`,
      `user:roles:${user.getId().value}:${user.getTenantId()}`,
    ];

    await Promise.all(cacheKeys.map(key => this.cache.del(key)));
  }
}
```

### 第六步：表现层实现

实现API控制器和数据传输对象：

```typescript
// ✅ 表现层实现示例

@ApiTags('用户管理')
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  constructor(
    private readonly assignUserRoleUseCase: AssignUserRoleUseCase,
    private readonly logger: PinoLoggerService,
  ) {}

  @Post(':id/roles')
  @RequirePermissions('user:role:assign')
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '角色分配成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '用户或角色不存在' })
  @ApiResponse({ status: 409, description: '角色已分配或角色冲突' })
  async assignRole(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @TenantId() tenantId: string,
  ): Promise<ApiResponseWrapper<AssignUserRoleResponseDto>> {
    this.logger.info('接收到用户角色分配请求', {
      userId,
      roleId: assignRoleDto.roleId,
      operatorId: currentUser.id,
      tenantId,
    });

    try {
      // 1. 构建命令
      const command = new AssignUserRoleCommand(
        userId,
        assignRoleDto.roleId,
        assignRoleDto.organizationId,
        currentUser.id,
        tenantId,
      );

      // 2. 执行用例
      const result = await this.assignUserRoleUseCase.execute(command);

      // 3. 构建响应
      const response = new AssignUserRoleResponseDto(
        result.userId,
        result.roleId,
        result.assignedAt,
        '角色分配成功',
      );

      this.logger.info('用户角色分配成功', {
        userId: result.userId,
        roleId: result.roleId,
      });

      return ApiResponseWrapper.success(response, '角色分配成功');
    } catch (error) {
      this.logger.error('用户角色分配失败', { error, userId, tenantId });

      // 异常映射
      if (error instanceof UserNotFoundException) {
        throw new NotFoundException('用户不存在');
      }

      if (error instanceof RoleNotFoundException) {
        throw new NotFoundException('角色不存在');
      }

      if (error instanceof RoleAlreadyAssignedException) {
        throw new ConflictException('角色已分配');
      }

      if (error instanceof ConflictingRoleException) {
        throw new ConflictException('角色冲突，无法分配');
      }

      if (error instanceof InsufficientPermissionException) {
        throw new ForbiddenException('权限不足');
      }

      throw new InternalServerErrorException('角色分配失败');
    }
  }
}

// DTO定义
export class AssignRoleDto {
  @ApiProperty({ description: '角色ID' })
  @IsUUID('4', { message: '角色ID格式错误' })
  roleId!: string;

  @ApiProperty({ description: '组织ID' })
  @IsUUID('4', { message: '组织ID格式错误' })
  organizationId!: string;
}

export class AssignUserRoleResponseDto {
  @ApiProperty({ description: '用户ID' })
  userId!: string;

  @ApiProperty({ description: '角色ID' })
  roleId!: string;

  @ApiProperty({ description: '分配时间' })
  assignedAt!: Date;

  @ApiProperty({ description: '分配结果消息' })
  message!: string;

  constructor(
    userId: string,
    roleId: string,
    assignedAt: Date,
    message: string,
  ) {
    this.userId = userId;
    this.roleId = roleId;
    this.assignedAt = assignedAt;
    this.message = message;
  }
}
```

## ✅ 实现质量检查

### 代码质量检查清单

```markdown
## 实现完成检查清单

### 架构一致性

- [ ] 代码严格遵循Clean Architecture分层
- [ ] 依赖方向正确（高层不依赖低层）
- [ ] 接口隔离原则得到遵循
- [ ] 单一职责原则得到体现

### 业务逻辑正确性

- [ ] 所有业务规则都在领域层实现
- [ ] 业务不变量得到保护
- [ ] 领域事件正确发布
- [ ] 异常情况得到妥善处理

### 技术实现质量

- [ ] 完整的TypeScript类型定义
- [ ] 详细的TSDoc注释
- [ ] 合理的错误处理
- [ ] 性能优化考虑（缓存、批量操作等）

### 安全性考虑

- [ ] 输入数据验证
- [ ] 权限检查
- [ ] SQL注入防护
- [ ] 敏感信息保护

### 可测试性

- [ ] 依赖注入便于mock
- [ ] 业务逻辑可独立测试
- [ ] 边界条件覆盖
- [ ] 异常场景测试

### 可观测性

- [ ] 关键操作日志记录
- [ ] 性能指标埋点
- [ ] 错误信息详细
- [ ] 调试信息充分
```

## 🔧 常用工具和模式

### 命令模式实现

```typescript
// 命令接口
export interface ICommand {
  readonly commandId: string;
  readonly timestamp: Date;
  readonly userId: string;
  readonly tenantId: string;
}

// 命令基类
export abstract class BaseCommand implements ICommand {
  public readonly commandId: string;
  public readonly timestamp: Date;

  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {
    this.commandId = Uuid.generate().value;
    this.timestamp = new Date();
  }
}
```

### 查询模式实现

```typescript
// 查询接口
export interface IQuery {
  readonly queryId: string;
  readonly timestamp: Date;
  readonly tenantId: string;
}

// 查询基类
export abstract class BaseQuery implements IQuery {
  public readonly queryId: string;
  public readonly timestamp: Date;

  constructor(public readonly tenantId: string) {
    this.queryId = Uuid.generate().value;
    this.timestamp = new Date();
  }
}
```

## 🎯 成功标准

实现完成后，代码应该满足：

1. **功能完整性**: 实现所有指定的业务功能
2. **架构一致性**: 完全符合Clean Architecture和DDD规范
3. **代码质量**: 通过所有Linter检查，测试覆盖率>90%
4. **性能标准**: 满足响应时间和吞吐量要求
5. **安全性**: 通过安全扫描，无安全漏洞
6. **可维护性**: 代码清晰易懂，文档完整

---

**记住**: 高质量的实现需要遵循标准流程，不要跳过任何步骤。每一层的实现都必须完整和正确。
