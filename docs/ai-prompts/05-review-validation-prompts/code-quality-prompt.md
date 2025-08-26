# 代码质量审查提示词

## 🎯 审查目标

对提交的代码进行全面的质量审查，确保代码符合架构规范、业务需求、技术标准和最佳实践。

## 🔍 审查维度

### 1. 架构一致性审查

```markdown
## 架构一致性检查清单

### Clean Architecture 分层检查

- [ ] 代码是否按照正确的分层组织
- [ ] 依赖方向是否正确（高层不依赖低层）
- [ ] 跨层调用是否通过接口抽象
- [ ] 每层是否只承担自己的职责

### DDD 设计模式检查

- [ ] 聚合根是否正确封装业务逻辑
- [ ] 实体是否为充血模型（包含行为）
- [ ] 值对象是否不可变且表达业务概念
- [ ] 领域服务是否处理跨聚合的复杂业务逻辑
- [ ] 仓储接口是否在领域层定义

### 事件驱动架构检查

- [ ] 业务状态变更是否发布领域事件
- [ ] 事件结构是否包含完整的业务上下文
- [ ] 事件命名是否遵循业务语言
- [ ] 跨聚合操作是否通过事件实现

### CQRS 模式检查

- [ ] 命令和查询是否正确分离
- [ ] 命令是否只执行写操作
- [ ] 查询是否只执行读操作
- [ ] 是否有适当的读写模型分离
```

### 2. 业务逻辑正确性审查

```typescript
// ✅ 业务逻辑审查要点

/**
 * 业务规则实现检查：
 * 1. 所有业务规则是否在领域层实现
 * 2. 业务不变量是否得到保护
 * 3. 业务流程是否完整正确
 * 4. 异常情况是否妥善处理
 */

// 示例：用户角色分配业务逻辑审查
export class UserAggregate extends AggregateRoot {
  public assignRole(
    roleId: Uuid,
    organizationId: Uuid,
    assignedBy: Uuid,
  ): void {
    // ✅ 检查点1：是否验证了前置条件
    this.ensureUserIsActive(); // 用户必须激活
    this.ensureUserInOrganization(organizationId); // 用户必须在组织中

    // ✅ 检查点2：是否实现了业务规则
    this.ensureRoleNotAlreadyAssigned(roleId); // 不能重复分配
    this.ensureNoConflictingRoles(roleId); // 角色互斥性检查

    // ✅ 检查点3：是否正确更新了状态
    const assignment = UserRoleAssignment.create(/*参数*/);
    this.roleAssignments.add(assignment);

    // ✅ 检查点4：是否发布了领域事件
    this.addDomainEvent(new UserRoleAssignedEvent(/*参数*/));
  }
}

/**
 * 审查问题示例：
 * ❌ 业务规则在应用层实现（应该在领域层）
 * ❌ 缺少必要的业务验证
 * ❌ 状态变更后没有发布事件
 * ❌ 异常处理不完整
 */
```

### 3. 代码质量标准审查

```typescript
// ✅ 代码质量检查要点

/**
 * TypeScript 类型安全检查：
 * 1. 所有参数和返回值是否有明确类型
 * 2. 是否使用了any类型（应避免）
 * 3. 是否有未处理的null/undefined
 * 4. 泛型使用是否正确
 */

// ✅ 良好的类型定义示例
export class CreateUserUseCase
  implements IUseCase<CreateUserCommand, UserCreatedResult>
{
  async execute(command: CreateUserCommand): Promise<UserCreatedResult> {
    // 明确的参数和返回类型
  }
}

// ❌ 避免的写法
export class CreateUserUseCase {
  async execute(command: any): Promise<any> {
    // ❌ 使用any类型
    // 实现...
  }
}

/**
 * 命名规范检查：
 * 1. 类名使用PascalCase
 * 2. 方法名使用camelCase
 * 3. 常量使用UPPER_SNAKE_CASE
 * 4. 命名是否表达了业务意图
 */

// ✅ 良好的命名示例
export class UserAggregate extends AggregateRoot {
  public assignRole(roleId: Uuid): void {
    // 清晰的业务方法名
    this.ensureUserIsActive(); // 清晰的验证方法名
  }
}

// ❌ 避免的命名
export class User {
  public doSomething(id: string): void {
    // ❌ 不清晰的方法名
    this.check(); // ❌ 不明确的验证方法名
  }
}
```

### 4. 文档质量审查

````typescript
/**
 * TSDoc 注释质量检查：
 * 1. 是否有完整的功能描述
 * 2. 是否说明了业务规则和原理
 * 3. 是否包含了参数和返回值说明
 * 4. 是否说明了异常情况
 * 5. 是否包含了使用示例
 */

// ✅ 高质量文档示例
/**
 * @description
 * 用户角色分配方法 - 为用户在指定组织中分配角色
 *
 * 业务原理：
 * 1. 验证用户具有执行此操作的权限和状态
 * 2. 检查角色分配的业务规则（唯一性、互斥性等）
 * 3. 创建角色分配记录并更新用户状态
 * 4. 发布领域事件通知系统其他部分
 *
 * 业务规则：
 * 1. 用户必须处于激活状态
 * 2. 用户必须是目标组织的成员
 * 3. 不能重复分配相同的角色
 * 4. 某些角色之间存在互斥关系
 *
 * @param roleId 要分配的角色ID
 * @param organizationId 组织ID，确定角色分配的上下文
 * @param assignedBy 执行分配操作的用户ID，用于审计
 *
 * @throws UserNotActiveException 当用户未激活时
 * @throws UserNotInOrganizationException 当用户不在指定组织中时
 * @throws RoleAlreadyAssignedException 当角色已经分配时
 * @throws ConflictingRoleException 当存在角色冲突时
 *
 * @fires UserRoleAssignedEvent 角色分配成功事件
 *
 * @example
 * ```typescript
 * // 为用户分配管理员角色
 * user.assignRole(
 *   new Uuid('admin-role-id'),
 *   new Uuid('organization-id'),
 *   new Uuid('current-user-id')
 * );
 * ```
 */
public assignRole(roleId: Uuid, organizationId: Uuid, assignedBy: Uuid): void {
  // 实现...
}

// ❌ 不充分的文档
/**
 * 分配角色
 */
public assignRole(roleId: Uuid): void { // ❌ 缺少详细说明
  // 实现...
}
````

### 5. 性能与安全审查

```typescript
/**
 * 性能考虑检查：
 * 1. 是否有N+1查询问题
 * 2. 是否合理使用缓存
 * 3. 是否避免了不必要的计算
 * 4. 批量操作是否优化
 */

// ✅ 性能优化示例
@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  async findByIds(ids: Uuid[], tenantId: string): Promise<UserAggregate[]> {
    // ✅ 批量查询避免N+1问题
    const users = await this.orm.em.find(UserOrmEntity, {
      id: { $in: ids.map(id => id.value) },
      tenantId
    }, {
      populate: ['roles', 'organizations'] // ✅ 预加载关联数据
    });

    return users.map(user => this.mapper.toDomain(user));
  }
}

// ❌ 性能问题示例
async findByIds(ids: Uuid[]): Promise<UserAggregate[]> {
  const users = [];
  for (const id of ids) { // ❌ N+1查询问题
    const user = await this.findById(id);
    users.push(user);
  }
  return users;
}

/**
 * 安全检查要点：
 * 1. 输入数据是否验证
 * 2. 权限检查是否完整
 * 3. 敏感信息是否保护
 * 4. SQL注入是否防护
 */

// ✅ 安全实践示例
@Controller('users')
export class UserController {
  @Post()
  @RequirePermissions('user:create') // ✅ 权限检查
  async createUser(
    @Body() createUserDto: CreateUserDto, // ✅ DTO验证
    @TenantId() tenantId: string, // ✅ 租户隔离
    @CurrentUser() currentUser: AuthenticatedUser
  ): Promise<ApiResponse<UserResponseDto>> {
    // ✅ 输入验证已通过DTO和装饰器完成
    // ✅ 权限检查已通过守卫完成
    // ✅ 租户隔离已通过参数装饰器完成
  }
}
```

## 📋 审查流程

### 第一步：快速扫描

```markdown
## 快速扫描检查清单（5分钟内完成）

### 基础结构检查

- [ ] 文件是否按照正确的目录结构组织
- [ ] 类和方法命名是否清晰
- [ ] 是否有明显的代码异味（过长方法、重复代码等）
- [ ] 导入语句是否整洁有序

### 明显问题识别

- [ ] 是否有编译错误
- [ ] 是否有明显的类型错误
- [ ] 是否有未使用的变量或导入
- [ ] 是否有硬编码的魔法数字
```

### 第二步：深度审查

```typescript
// 深度审查示例：分析一个Use Case

@Injectable()
export class CreateUserUseCase
  implements IUseCase<CreateUserCommand, UserCreatedResult>
{
  // ✅ 审查点1：依赖注入是否正确
  constructor(
    private readonly userRepository: IUserRepository, // ✅ 使用接口而非具体实现
    private readonly eventBus: IEventBus, // ✅ 使用接口
    private readonly tenantService: ITenantService, // ✅ 使用接口
    private readonly logger: PinoLoggerService, // ✅ 日志服务
  ) {}

  // ✅ 审查点2：方法签名是否符合接口
  async execute(command: CreateUserCommand): Promise<UserCreatedResult> {
    // ✅ 审查点3：是否有适当的日志记录
    this.logger.info('开始创建用户', { command });

    try {
      // ✅ 审查点4：是否有业务验证
      await this.validateTenantQuota(command.tenantId);
      await this.validateUserUniqueness(command);

      // ✅ 审查点5：是否正确调用领域对象
      const user = UserAggregate.create(
        Username.create(command.username),
        Email.create(command.email),
        Password.create(command.password),
        UserProfile.create(command.firstName, command.lastName),
        command.tenantId,
      );

      // ✅ 审查点6：是否正确持久化
      await this.userRepository.save(user);

      // ✅ 审查点7：是否发布事件
      await this.eventBus.publishAll(user.getUncommittedEvents());

      // ✅ 审查点8：是否返回正确的结果
      return new UserCreatedResult(user.getId(), user.getStatus());
    } catch (error) {
      // ✅ 审查点9：是否有完整的错误处理
      this.logger.error('用户创建失败', { command, error });
      throw error;
    }
  }
}

/**
 * 深度审查要关注的问题：
 * 1. 业务逻辑是否在正确的层实现
 * 2. 异常处理是否完整
 * 3. 事务边界是否正确
 * 4. 性能考虑是否充分
 * 5. 安全性是否得到保障
 */
```

### 第三步：输出审查报告

```markdown
## 代码审查报告模板

### 基础信息

- 审查者：[AI助手]
- 审查时间：[时间戳]
- 代码文件：[文件路径]
- 代码行数：[行数]

### 审查结果概览

- 总体评分：⭐⭐⭐⭐⭐ (1-5星)
- 是否通过审查：✅ 通过 / ❌ 不通过
- 主要问题数量：[数量]
- 建议改进点：[数量]

### 详细审查结果

#### ✅ 优点

1. [具体的优点1]
2. [具体的优点2]
3. [具体的优点3]

#### ⚠️ 需要改进的问题

1. **[问题类别]**: [具体问题描述]
   - 位置：[文件名:行号]
   - 建议：[具体改进建议]
   - 优先级：🔴 高 / 🟡 中 / 🟢 低

2. **[问题类别]**: [具体问题描述]
   - 位置：[文件名:行号]
   - 建议：[具体改进建议]
   - 优先级：🔴 高 / 🟡 中 / 🟢 低

#### 📋 改进建议

1. [改进建议1]
2. [改进建议2]
3. [改进建议3]

### 架构一致性评估

- Clean Architecture 遵循度：✅ 优秀 / ⚠️ 良好 / ❌ 需改进
- DDD 实践质量：✅ 优秀 / ⚠️ 良好 / ❌ 需改进
- 事件驱动设计：✅ 优秀 / ⚠️ 良好 / ❌ 需改进

### 代码质量评估

- 类型安全：✅ 优秀 / ⚠️ 良好 / ❌ 需改进
- 命名规范：✅ 优秀 / ⚠️ 良好 / ❌ 需改进
- 文档完整性：✅ 优秀 / ⚠️ 良好 / ❌ 需改进
- 错误处理：✅ 优秀 / ⚠️ 良好 / ❌ 需改进

### 性能与安全评估

- 性能考虑：✅ 优秀 / ⚠️ 良好 / ❌ 需改进
- 安全防护：✅ 优秀 / ⚠️ 良好 / ❌ 需改进
- 缓存策略：✅ 优秀 / ⚠️ 良好 / ❌ 需改进

### 下一步行动

1. [必须修复的问题]
2. [建议改进的点]
3. [后续优化方向]
```

## 🎯 审查标准

### 通过标准

代码必须满足以下条件才能通过审查：

1. **架构一致性**: 100%符合Clean Architecture和DDD规范
2. **业务正确性**: 业务逻辑完整正确，无明显缺陷
3. **代码质量**: 通过TypeScript编译，无ESLint错误
4. **文档完整性**: 关键类和方法有完整的TSDoc注释
5. **安全性**: 无明显的安全漏洞，有适当的验证和权限检查

### 评分标准

- **⭐⭐⭐⭐⭐ 优秀**: 代码质量极高，可作为最佳实践示例
- **⭐⭐⭐⭐ 良好**: 代码质量良好，有少数可改进点
- **⭐⭐⭐ 合格**: 代码基本可用，有一些需要改进的问题
- **⭐⭐ 需改进**: 代码有较多问题，需要重大修改
- **⭐ 不合格**: 代码质量差，需要重写

---

**记住**: 严格的代码审查是保证代码质量和架构一致性的重要手段，每个细节都很重要。
