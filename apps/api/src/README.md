# SAAS Platform API 项目结构说明

## 📁 目录结构

```
src/
├── main.ts                           # 应用入口文件
├── app.module.ts                     # 根模块
├── app.controller.ts                 # 根控制器
├── app.service.ts                    # 根服务
├── shared/                           # 共享模块
│   ├── shared.module.ts              # 共享模块定义
│   ├── domain/                       # 共享领域层
│   │   ├── entities/                 # 基础实体
│   │   ├── value-objects/            # 基础值对象
│   │   ├── events/                   # 基础事件
│   │   └── repositories/             # 基础仓储接口
│   ├── application/                  # 共享应用层
│   │   ├── interfaces/               # 共享接口
│   │   ├── dto/                      # 共享DTO
│   │   └── services/                 # 共享服务
│   ├── infrastructure/               # 共享基础设施层
│   │   ├── database/                 # 数据库相关
│   │   ├── cache/                    # 缓存相关
│   │   ├── messaging/                # 消息队列
│   │   └── external/                 # 外部服务
│   └── utils/                        # 工具函数
│       ├── validators/               # 验证器
│       ├── decorators/               # 装饰器
│       ├── filters/                  # 过滤器
│       └── helpers/                  # 辅助函数
├── iam/                              # IAM领域模块
│   ├── iam.module.ts                 # IAM模块定义
│   ├── tenant/                       # 租户管理子领域
│   │   ├── domain/                   # 领域层
│   │   │   ├── entities/             # 实体
│   │   │   ├── value-objects/        # 值对象
│   │   │   ├── events/               # 领域事件
│   │   │   ├── services/             # 领域服务
│   │   │   └── repositories/         # 仓储接口
│   │   ├── application/              # 应用层
│   │   │   ├── use-cases/            # 用例
│   │   │   ├── commands/             # 命令
│   │   │   ├── queries/              # 查询
│   │   │   ├── handlers/             # 处理器
│   │   │   ├── dto/                  # 数据传输对象
│   │   │   └── services/             # 应用服务
│   │   ├── infrastructure/           # 基础设施层
│   │   │   ├── repositories/         # 仓储实现
│   │   │   ├── database/             # 数据库相关
│   │   │   └── external/             # 外部服务
│   │   └── presentation/             # 表现层
│   │       ├── controllers/          # 控制器
│   │       ├── middlewares/          # 中间件
│   │       └── guards/               # 守卫
│   ├── user/                         # 用户管理子领域
│   ├── organization/                 # 组织管理子领域
│   ├── department/                   # 部门管理子领域
│   ├── role/                         # 角色管理子领域
│   ├── permission/                   # 权限管理子领域
│   ├── auth/                         # 认证服务子领域
│   └── shared/                       # IAM共享模块
├── notification/                     # 通知管理模块
│   ├── email/                        # 邮件通知子领域
│   ├── sms/                          # 短信通知子领域
│   ├── push/                         # 推送通知子领域
│   ├── webhook/                      # Webhook通知子领域
│   └── shared/                       # 通知共享模块
├── workflow/                         # 工作流管理模块
├── analytics/                        # 数据分析模块
├── image-management/                 # 图片管理模块
├── document-management/              # 文档管理模块
├── cache-management/                 # 缓存管理模块
├── security-compliance/              # 安全合规模块
├── monitoring-operations/            # 监控运维模块
├── api-integration/                  # API集成模块
└── llm-management/                   # LLM管理模块
```

## 🏗️ 架构设计

### 分层架构
- **表现层 (Presentation)**: 控制器、中间件、守卫
- **应用层 (Application)**: 用例、命令、查询、处理器
- **领域层 (Domain)**: 实体、值对象、领域服务、事件
- **基础设施层 (Infrastructure)**: 仓储实现、数据库、外部服务

### 模块组织
- **共享模块**: 跨模块使用的通用功能
- **领域模块**: 按业务领域组织的功能模块
- **子领域**: 每个领域内的细分功能模块

### 设计原则
- **DDD (领域驱动设计)**: 以业务领域为核心组织代码
- **Clean Architecture**: 清晰的依赖关系和分层架构
- **CQRS**: 命令查询职责分离
- **Event Sourcing**: 事件溯源架构

## 🚀 开发指南

### 添加新功能
1. 在相应的领域模块中创建子领域
2. 按照分层架构创建相应的文件
3. 在模块定义文件中注册新的组件
4. 在根模块中导入新模块

### 命名规范
- **文件命名**: 使用kebab-case，如 `user-profile.entity.ts`
- **类命名**: 使用PascalCase，如 `UserProfile`
- **方法命名**: 使用camelCase，如 `getUserProfile`
- **常量命名**: 使用UPPER_SNAKE_CASE，如 `MAX_RETRY_COUNT`

### 代码组织
- 每个文件只负责一个功能
- 遵循单一职责原则
- 保持文件大小合理
- 使用清晰的导入路径

## 📋 待办事项

- [ ] 实现共享模块的基础服务
- [ ] 完善IAM模块的各个子领域
- [ ] 实现其他业务模块
- [ ] 添加单元测试和集成测试
- [ ] 配置数据库连接和迁移
- [ ] 实现缓存和消息队列
- [ ] 添加监控和日志
- [ ] 配置CI/CD流程
