# AI提示词工程使用示例

## 📚 概述

本文档提供具体的使用示例，展示如何组合使用AI提示词工程框架来完成不同的开发任务。

## 🎯 使用场景示例

### 场景1：创建新的领域实体

**任务**: 需要为IAM系统创建一个组织(Organization)聚合根

**提示词组合**:

```markdown
# 1. 加载基础系统提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md

# 2. 加载领域专家角色

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/domain-expert-prompt.md

# 3. 加载实体生成提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/04-code-generation-prompts/entity-generation-prompt.md

# 4. 引用相关开发指南

@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/06-domain-layer-development-guide.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/01-iam-business-requirements.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/02-saas-platform-domain-division.md

# 5. 具体需求描述

请帮我创建一个组织(Organization)聚合根，需要满足以下业务需求：

## 业务需求

1. 组织具有层级结构，支持多级嵌套
2. 组织可以包含用户和子组织
3. 组织有激活/停用状态管理
4. 支持组织合并和拆分操作
5. 组织变更需要审批流程
6. 需要完整的审计追踪

## 技术要求

1. 遵循DDD充血模型设计
2. 实现完整的业务规则验证
3. 发布相关的领域事件
4. 包含完整的TSDoc注释
5. 处理多租户数据隔离

请生成完整的组织聚合根代码。
```

**预期输出**: 完整的OrganizationAggregate类，包含所有业务方法、事件、异常处理和文档。

---

### 场景2：实现完整的用户创建功能

**任务**: 从API到数据库的完整用户创建功能实现

**提示词组合**:

```markdown
# 1. 加载基础系统提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md

# 2. 加载后端开发者角色

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/backend-developer-prompt.md

# 3. 加载实现工作流提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/03-workflow-prompts/implementation-prompt.md

# 4. 引用相关开发指南

@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/07-application-layer-development-guide.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/08-infrastructure-layer-development-guide.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/09-presentation-layer-development-guide.md

# 5. 具体任务描述

请帮我实现完整的用户创建功能，包括以下组件：

## 需要实现的组件

1. CreateUserCommand - 创建用户命令
2. CreateUserUseCase - 创建用户用例
3. CreateUserHandler - 命令处理器
4. UserController.createUser - API控制器方法
5. CreateUserDto - 数据传输对象
6. 相关的异常处理和验证

## 业务要求

1. 验证租户配额限制
2. 检查用户名和邮箱唯一性
3. 分配默认角色
4. 发送欢迎邮件（异步）
5. 记录审计日志
6. 支持事务回滚

## 技术要求

1. 严格遵循Clean Architecture分层
2. 实现完整的错误处理
3. 包含性能优化考虑
4. 添加详细的日志记录
5. 编写完整的API文档

请按照标准实现流程逐步生成代码。
```

**预期输出**: 完整的多层架构实现，包含所有必需的类、接口、异常处理和文档。

---

### 场景3：代码质量审查

**任务**: 审查一段已写的用户角色分配代码

**提示词组合**:

```markdown
# 1. 加载基础系统提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md

# 2. 加载代码审查者角色

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/code-reviewer-prompt.md

# 3. 加载代码质量审查提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/05-review-validation-prompts/code-quality-prompt.md

# 4. 引用相关开发指南

@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/06-domain-layer-development-guide.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/12-ide-formatting-configuration-guide.md

# 5. 提交待审查的代码

请审查以下用户角色分配的代码实现：

## 待审查代码

\`\`\`typescript
export class UserAggregate extends AggregateRoot {
public assignRole(roleId: string, orgId: string): void {
if (!roleId || !orgId) {
throw new Error('参数不能为空');
}

    this.roles.push({ roleId, orgId, assignedAt: new Date() });

}
}

@Injectable()
export class AssignRoleUseCase {
constructor(private userRepo: any) {}

async execute(userId: string, roleId: string, orgId: string) {
const user = await this.userRepo.findById(userId);
user.assignRole(roleId, orgId);
await this.userRepo.save(user);
return { success: true };
}
}
\`\`\`

## 审查要求

1. 检查架构一致性
2. 评估业务逻辑正确性
3. 分析代码质量问题
4. 提供具体改进建议
5. 给出整体评分

请提供详细的审查报告。
```

**预期输出**: 详细的代码审查报告，包含问题识别、改进建议和重构后的代码示例。

---

### 场景4：设计复杂业务流程

**任务**: 设计用户密码重置的完整业务流程

**提示词组合**:

```markdown
# 1. 加载基础系统提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md

# 2. 加载领域专家角色

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/domain-expert-prompt.md

# 3. 加载架构师角色

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/architect-prompt.md

# 4. 引用相关文档

@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/03-hybrid-architecture-overview.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/01-iam-business-requirements.md

# 5. 设计任务描述

请帮我设计用户密码重置的完整业务流程，包括：

## 业务需求

1. 支持邮箱和短信两种重置方式
2. 重置链接有时效性（15分钟过期）
3. 重置令牌只能使用一次
4. 需要验证用户身份（安全问题或MFA）
5. 密码重置后强制用户重新登录
6. 记录完整的安全审计日志

## 技术要求

1. 使用事件驱动架构设计
2. 支持多租户隔离
3. 防止暴力破解攻击
4. 实现幂等性保证
5. 异步处理通知发送

## 需要设计的组件

1. 事件流程图
2. 聚合根设计
3. 命令和事件定义
4. 安全策略设计
5. API接口设计

请提供完整的架构设计方案。
```

**预期输出**: 完整的业务流程设计，包含事件流程图、聚合设计、安全策略和实现指导。

---

### 场景5：性能优化分析

**任务**: 分析和优化用户权限查询的性能问题

**提示词组合**:

```markdown
# 1. 加载基础系统提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md

# 2. 加载后端开发者角色

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/backend-developer-prompt.md

# 3. 加载性能审查提示词

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/05-review-validation-prompts/performance-review-prompt.md

# 4. 引用相关文档

@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/08-infrastructure-layer-development-guide.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/10-infrastructure-modules-guide.md

# 5. 性能问题描述

当前用户权限查询存在性能问题，请帮我分析和优化：

## 现状分析

1. 用户权限查询响应时间>2秒
2. 数据库连接池经常耗尽
3. 某些查询存在N+1问题
4. 缓存命中率较低(<60%)
5. 高并发时系统响应变慢

## 现有代码问题

\`\`\`typescript
// 有问题的权限查询实现
async getUserPermissions(userId: string): Promise<Permission[]> {
const user = await this.userRepo.findById(userId);
const permissions = [];

for (const role of user.roles) {
const rolePerms = await this.permissionRepo.findByRoleId(role.id);
permissions.push(...rolePerms);
}

return permissions;
}
\`\`\`

## 优化目标

1. 响应时间<200ms
2. 支持1000并发用户
3. 缓存命中率>90%
4. 减少数据库查询次数

请提供详细的性能优化方案。
```

**预期输出**: 全面的性能分析报告，包含问题识别、优化策略、重构代码和监控建议。

## 🔧 高级使用技巧

### 1. 渐进式提示

```markdown
# 对于复杂任务，可以分阶段进行

## 第一阶段：业务分析

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/domain-expert-prompt.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/01-iam-business-requirements.md

请先分析XXX功能的业务需求和领域模型...

## 第二阶段：架构设计

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/architect-prompt.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/development/03-hybrid-architecture-overview.md

基于前面的业务分析，请设计技术架构...

## 第三阶段：代码实现

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/backend-developer-prompt.md
@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/03-workflow-prompts/implementation-prompt.md

基于前面的设计，请实现具体代码...
```

### 2. 上下文传递

```markdown
# 在同一个会话中保持上下文

## 任务1：创建实体

[实体创建任务和代码生成]

## 任务2：基于上面的实体创建Use Case

基于刚才创建的XXXAggregate实体，现在请创建相应的Use Case...

## 任务3：创建API控制器

基于前面的实体和Use Case，现在请创建API控制器...
```

### 3. 迭代优化

```markdown
# 对生成的代码进行迭代优化

## 第一轮：基础实现

[生成初始代码]

## 第二轮：性能优化

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/05-review-validation-prompts/performance-review-prompt.md
请对刚才的代码进行性能优化...

## 第三轮：安全加固

@/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/05-review-validation-prompts/security-review-prompt.md
请对代码进行安全审查和加固...
```

## 📊 效果评估

### 使用前后对比

**使用提示词工程前**:

- 代码质量不一致
- 架构规范执行不严格
- 业务逻辑表达不清晰
- 文档缺失或不完整
- 需要大量人工审查

**使用提示词工程后**:

- 代码质量统一且高标准
- 严格遵循架构规范
- 业务逻辑清晰准确
- 文档完整详细
- 自动化质量保证

### 量化指标

- **代码质量提升**: ESLint错误率从30%降至<5%
- **架构一致性**: 架构违规从20%降至<2%
- **文档完整性**: TSDoc覆盖率从40%提升至>95%
- **开发效率**: 功能开发时间缩短50%
- **代码审查**: 审查时间缩短70%

## 🎯 最佳实践建议

### 1. 选择合适的提示词组合

```markdown
# 根据任务类型选择提示词

业务分析 → domain-expert-prompt.md
架构设计 → architect-prompt.md
代码实现 → backend-developer-prompt.md + implementation-prompt.md
代码审查 → code-reviewer-prompt.md + quality-review-prompt.md
```

### 2. 保持上下文一致性

- 在同一个会话中完成相关任务
- 传递前面步骤的输出作为后续输入
- 保持业务术语和技术概念的一致性

### 3. 迭代式改进

- 先生成基础版本，再逐步优化
- 每次只关注一个维度（功能→性能→安全）
- 收集反馈，持续改进提示词

### 4. 质量验证

- 每次生成后都进行代码审查
- 运行自动化测试验证功能
- 检查是否符合架构规范

---

**记住**: AI提示词工程是一个持续优化的过程，根据实际使用效果不断调整和完善提示词内容。
