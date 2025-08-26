# AI提示词工程框架

## 📋 概述

基于Aiofix IAM系统的完整开发文档体系，设计的AI开发助手提示词工程框架。该框架旨在引导AI助手深度理解项目架构、开发规范和业务逻辑，从而提供高质量的开发支持。

## 🎯 框架目标

- **深度理解**: AI能够理解DDD、Clean Architecture、事件溯源等复杂架构模式
- **规范遵循**: 确保生成的代码严格遵循项目的架构规范和编码标准
- **上下文感知**: AI能够基于业务上下文和技术上下文做出正确决策
- **渐进式指导**: 支持从架构设计到具体实现的渐进式开发指导

## 🏗️ 框架结构

```
ai-prompts/
├── README.md                           # 本文档
├── 01-base-system-prompt.md            # 基础系统提示词
├── 02-role-specific-prompts/           # 角色特定提示词
│   ├── architect-prompt.md             # 架构师提示词
│   ├── backend-developer-prompt.md     # 后端开发者提示词
│   ├── domain-expert-prompt.md         # 领域专家提示词
│   └── code-reviewer-prompt.md         # 代码审查者提示词
├── 03-workflow-prompts/                # 工作流程提示词
│   ├── analysis-prompt.md              # 需求分析提示词
│   ├── design-prompt.md                # 架构设计提示词
│   ├── implementation-prompt.md        # 代码实现提示词
│   └── testing-prompt.md               # 测试开发提示词
├── 04-code-generation-prompts/         # 代码生成提示词
│   ├── entity-generation-prompt.md     # 实体生成提示词
│   ├── usecase-generation-prompt.md    # Use Case生成提示词
│   ├── api-generation-prompt.md        # API生成提示词
│   └── test-generation-prompt.md       # 测试生成提示词
├── 05-review-validation-prompts/       # 审查验证提示词
│   ├── architecture-review-prompt.md   # 架构审查提示词
│   ├── code-quality-prompt.md          # 代码质量审查提示词
│   ├── security-review-prompt.md       # 安全审查提示词
│   └── performance-review-prompt.md    # 性能审查提示词
└── 06-troubleshooting-prompts/         # 问题排查提示词
    ├── debug-prompt.md                 # 调试提示词
    ├── refactor-prompt.md              # 重构提示词
    └── optimization-prompt.md          # 优化提示词
```

## 🔧 使用方式

### 1. 基础配置

所有AI交互都应该先加载基础系统提示词：

```markdown
/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md
```

### 2. 角色特定配置

根据开发任务选择对应的角色提示词：

```markdown
# 架构设计任务

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/architect-prompt.md

# 后端开发任务

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/backend-developer-prompt.md

# 领域建模任务

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/domain-expert-prompt.md

# 代码审查任务

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/code-reviewer-prompt.md
```

### 3. 工作流程配置

根据开发阶段选择对应的工作流程提示词：

```markdown
# 需求分析阶段

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/03-workflow-prompts/analysis-prompt.md

# 架构设计阶段

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/03-workflow-prompts/design-prompt.md

# 代码实现阶段

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/03-workflow-prompts/implementation-prompt.md

# 测试开发阶段

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/03-workflow-prompts/testing-prompt.md
```

### 4. 具体任务配置

根据具体任务类型选择对应的专项提示词：

```markdown
# 实体开发

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/04-code-generation-prompts/entity-generation-prompt.md

# Use Case开发

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/04-code-generation-prompts/usecase-generation-prompt.md

# API开发

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/04-code-generation-prompts/api-generation-prompt.md
```

## 📚 文档引用规范

### 架构文档引用

```markdown
# 系统整体架构

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/00-saas-platform-architecture.md

# 业务需求

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/01-iam-business-requirements.md

# 领域划分

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/02-saas-platform-domain-division.md

# 混合架构概览

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/03-hybrid-architecture-overview.md

# 项目代码组织

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/04-project-code-organization-architecture.md
```

### 开发指南引用

```markdown
# 共享层开发

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/05-shared-layer-development-guide.md

# 领域层开发

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/06-domain-layer-development-guide.md

# 应用层开发

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/07-application-layer-development-guide.md

# 基础设施层开发

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/08-infrastructure-layer-development-guide.md

# 表现层开发

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/09-presentation-layer-development-guide.md
```

### 技术指南引用

```markdown
# 基础设施模块

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/10-infrastructure-modules-guide.md

# IAM技术设计

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/11-iam-domain-technical-design.md

# IDE配置

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/12-ide-formatting-configuration-guide.md
```

## 🎨 提示词设计原则

### 1. 层次化原则

```
系统级提示词 (System Level)
    ↓
角色级提示词 (Role Level)
    ↓
工作流级提示词 (Workflow Level)
    ↓
任务级提示词 (Task Level)
```

### 2. 上下文感知原则

- **业务上下文**: 理解IAM业务领域和多租户SaaS特性
- **技术上下文**: 理解Clean Architecture、DDD、CQRS、事件溯源
- **项目上下文**: 理解项目结构、代码规范、开发流程

### 3. 渐进式指导原则

- **从抽象到具体**: 从架构设计到代码实现
- **从整体到局部**: 从系统设计到模块开发
- **从规范到实践**: 从理论指导到具体编码

### 4. 质量保证原则

- **架构一致性**: 确保生成的代码符合架构设计
- **代码规范**: 严格遵循TSDoc、ESLint、Prettier规范
- **最佳实践**: 应用行业最佳实践和模式

## 🚀 快速开始

### 示例：创建一个新的领域实体

```markdown
# 1. 加载基础系统提示词

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md

# 2. 加载领域专家角色

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/domain-expert-prompt.md

# 3. 加载实体生成提示词

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/04-code-generation-prompts/entity-generation-prompt.md

# 4. 引用相关开发指南

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/06-domain-layer-development-guide.md
/home/arligle/V1/Aiofix/aiofix-iam/docs/development/01-iam-business-requirements.md

# 5. 提出具体需求

请帮我创建一个租户(Tenant)领域实体，需要支持多租户隔离、订阅管理等特性。
```

### 示例：审查代码质量

```markdown
# 1. 加载基础系统提示词

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/01-base-system-prompt.md

# 2. 加载代码审查者角色

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/02-role-specific-prompts/code-reviewer-prompt.md

# 3. 加载代码质量审查提示词

/home/arligle/V1/Aiofix/aiofix-iam/docs/ai-prompts/05-review-validation-prompts/code-quality-prompt.md

# 4. 引用相关开发指南

/home/arligle/V1/Aiofix/aiofix-iam/docs/development/06-domain-layer-development-guide.md
/home/arligle/V1/Aiofix/aiofix-iam/docs/development/12-ide-formatting-configuration-guide.md

# 5. 提交代码进行审查

请审查以下用户实体代码的质量：[代码内容]
```

## 📊 效果评估

### 量化指标

- **代码质量**: ESLint零错误率
- **架构一致性**: 100%符合架构设计
- **文档完整性**: TSDoc注释覆盖率100%
- **测试覆盖率**: 单元测试覆盖率>90%

### 定性指标

- **可读性**: 代码清晰易懂
- **可维护性**: 易于修改和扩展
- **可测试性**: 易于编写测试
- **业务表达力**: 准确表达业务意图

## 🔄 持续改进

### 反馈机制

1. **开发者反馈**: 收集开发者对AI生成代码的评价
2. **代码审查**: 通过代码审查发现AI的不足
3. **项目度量**: 通过项目指标评估AI的效果
4. **用户体验**: 通过用户体验评估业务逻辑的正确性

### 优化策略

1. **提示词迭代**: 基于反馈不断优化提示词
2. **示例补充**: 增加更多高质量的代码示例
3. **规范更新**: 随着项目发展更新开发规范
4. **培训强化**: 定期培训开发者如何更好地使用AI

---

**下一步**: 开始使用[基础系统提示词](./01-base-system-prompt.md)配置您的AI助手。
