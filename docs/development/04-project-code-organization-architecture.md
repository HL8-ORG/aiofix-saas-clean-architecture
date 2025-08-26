# 04 - 项目代码组织架构指南

## 📋 文档信息

- **文档类型**: 项目代码组织架构指南
- **文档版本**: v1.0
- **创建日期**: 2024年12月
- **最后更新**: 2024年12月
- **文档状态**: 实施版
- **目标读者**: 全栈工程师、架构师、开发团队领导

---

## 🎯 设计理念与目标

### 核心设计原则

我们的项目代码组织遵循以下核心原则：

```
🏛️  Clean Architecture (分层架构)
    +
🎯  Domain-Driven Design (领域驱动)
    +
📦  Monolith First (单体优先)
    +
🚀  Microservice Ready (微服务就绪)
```

### 架构目标

1. **🎯 满足单体应用开发**: 在一个代码库中高效开发和维护
2. **🚀 为微服务架构扩展做好准备**: 清晰的模块边界，便于未来拆分
3. **🏛️ 满足Clean Architecture要求**: 严格的分层和依赖关系
4. **🧠 体现DDD的领域边界**: 以业务领域为核心组织代码

### 设计价值

| 价值维度     | 单体应用阶段              | 微服务阶段                |
| ------------ | ------------------------- | ------------------------- |
| **开发效率** | ✅ 统一开发环境，快速迭代 | ✅ 独立部署，并行开发     |
| **团队协作** | ✅ 集中式代码管理         | ✅ 按领域分工协作         |
| **技术债务** | ✅ 统一技术栈，易维护     | ✅ 技术栈多样化，按需选择 |
| **扩展性**   | ⚠️ 垂直扩展为主           | ✅ 水平扩展，按需伸缩     |

---

## 📁 整体项目结构

### 顶层目录架构

```
aiofix-iam/
├── apps/                          # 🎯 应用程序目录
│   └── api/                       # 后端API应用（单体应用入口）
├── libs/                          # 📚 共享库目录
│   ├── domain/                    # 🧠 领域模块
│   │   ├── shared/                # 共享领域模块
│   │   └── iam/                   # IAM领域模块
│   └── infrastructure/            # 🛠️ 基础设施模块
│       ├── cache/                 # 缓存基础设施
│       ├── config/                # 配置基础设施
│       ├── database/              # 数据库基础设施
│       ├── logging/               # 日志基础设施
│       └── security/              # 安全基础设施
├── docs/                          # 📖 文档目录
├── docker/                        # 🐳 Docker配置
├── scripts/                       # 🔧 脚本工具
└── tools/                         # 🛠️ 开发工具
```

### 设计架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        单体应用 (apps/api)                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    表现层 (Controllers)                     │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
│                           │                                      │
├───────────────────────────▼──────────────────────────────────────┤
│                       应用层 (Use Cases)                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────────┐  │
│  │ IAM Module  │ Notification│ Workflow    │ Analytics & Others  │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────────┘  │
├─────────────────────────────────┬─────────────────────────────────┤
│                 领域层 (libs/domain)                              │
│  ┌──────────────────────────────▼──────────────────────────────┐   │
│  │          DDD 子领域模块 (按业务边界组织)                      │   │
│  │  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │   │
│  │  │    tenant   │    user     │ organization│ department  │   │   │
│  │  ├─────────────┼─────────────┼─────────────┼─────────────┤   │   │
│  │  │    role     │ permission  │    auth     │   shared    │   │   │
│  │  └─────────────┴─────────────┴─────────────┴─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────┬─────────────────────────────────┤
│            基础设施层 (libs/infrastructure)                       │
│  ┌──────────────────────────────▼──────────────────────────────┐   │
│  │ ┌─────────┬─────────┬─────────┬─────────┬─────────────────┐ │   │
│  │ │  Cache  │ Database│ Logging │ Config  │ Security & More │ │   │
│  │ └─────────┴─────────┴─────────┴─────────┴─────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Apps 目录：单体应用入口

### apps/api 结构

```
apps/api/
├── src/                           # 源代码目录
│   ├── main.ts                    # 🚀 应用启动入口
│   ├── app.module.ts              # 🏗️ 根模块
│   ├── app.controller.ts          # 🌐 根控制器
│   ├── app.service.ts             # ⚙️ 根服务
│   ├── config-test.service.ts     # 🔧 配置测试服务
│   │
│   ├── shared/                    # 🔄 应用级共享模块
│   │   ├── guards/                # 🛡️ 守卫
│   │   ├── interceptors/          # 🔍 拦截器
│   │   ├── pipes/                 # 🔧 管道
│   │   ├── filters/               # 🚫 异常过滤器
│   │   └── decorators/            # 🎨 装饰器
│   │
│   ├── iam/                       # 🔐 IAM领域入口模块
│   ├── notification/              # 📧 通知领域入口模块
│   ├── workflow/                  # ⚡ 工作流领域入口模块
│   ├── analytics/                 # 📊 数据分析领域入口模块
│   ├── image-management/          # 🖼️ 图片管理领域入口模块
│   ├── document-management/       # 📄 文档管理领域入口模块
│   ├── security-compliance/       # 🔒 安全合规模块
│   ├── monitoring-operations/     # 📈 监控运维模块
│   ├── api-integration/           # 🔗 API集成模块
│   └── llm-management/            # 🤖 LLM管理模块
│
├── test/                          # 🧪 测试目录
├── dist/                          # 📦 构建输出目录
├── nest-cli.json                  # ⚙️ NestJS CLI配置
├── tsconfig.json                  # 📝 TypeScript配置
├── .swcrc                         # ⚡ SWC构建配置
└── package.json                   # 📋 依赖配置
```

### 单体应用的优势

1. **🚀 快速启动**: 单一入口点，简化部署和运维
2. **🔧 统一配置**: 集中的配置管理和环境变量
3. **🐛 调试方便**: 完整的调用链路，便于问题定位
4. **🔄 事务完整**: 支持跨模块的数据库事务
5. **📈 性能优化**: 减少网络调用开销

---

## 📚 Libs 目录：模块化设计

### 设计理念

```
🧠 domain/     ← 业务核心，不依赖技术实现
🛠️ infrastructure/ ← 技术实现，支撑业务运行
```

### libs/domain 领域模块

#### 目录结构设计

```
libs/domain/
├── shared/                        # 🔄 共享领域模块
│   ├── src/
│   │   ├── base/                  # 基础抽象类
│   │   ├── types/                 # 通用类型定义
│   │   ├── interfaces/            # 通用接口
│   │   ├── exceptions/            # 异常体系
│   │   └── utils/                 # 工具函数
│   ├── package.json
│   ├── tsconfig.json
│   └── .swcrc
│
└── iam/                           # 🔐 IAM领域模块
    ├── src/
    │   ├── tenant/                # 🏢 租户子领域
    │   │   ├── domain/            # 领域层
    │   │   │   ├── entities/      # 实体
    │   │   │   ├── value-objects/ # 值对象
    │   │   │   ├── events/        # 领域事件
    │   │   │   ├── services/      # 领域服务
    │   │   │   └── repositories/  # 仓储接口
    │   │   ├── application/       # 应用层
    │   │   │   ├── use-cases/     # 用例
    │   │   │   ├── commands/      # 命令
    │   │   │   ├── queries/       # 查询
    │   │   │   ├── handlers/      # 处理器
    │   │   │   └── dtos/          # 数据传输对象
    │   │   └── presentation/      # 表现层
    │   │       └── controllers/   # 控制器
    │   │
    │   ├── user/                  # 👤 用户子领域
    │   ├── organization/          # 🏛️ 组织子领域
    │   ├── department/            # 🏢 部门子领域
    │   ├── role/                  # 👔 角色子领域
    │   ├── permission/            # 🔑 权限子领域
    │   └── auth/                  # 🔐 认证子领域
    │
    ├── package.json
    ├── tsconfig.json
    └── .swcrc
```

#### DDD子领域优先原则

**✅ 正确的组织方式（业务优先）**:

```
iam/src/
├── user/                      # 子领域边界清晰
│   ├── domain/                # 用户的业务逻辑
│   ├── application/           # 用户的应用服务
│   └── presentation/          # 用户的API接口
└── tenant/                    # 另一个子领域
    ├── domain/
    ├── application/
    └── presentation/
```

**❌ 错误的组织方式（技术优先）**:

```
iam/src/
├── domain/                    # 技术分层，领域边界模糊
│   ├── user/
│   └── tenant/
├── application/
│   ├── user/
│   └── tenant/
└── presentation/
    ├── user/
    └── tenant/
```

### libs/infrastructure 基础设施模块

#### 目录结构

```
libs/infrastructure/
├── cache/                         # 🗄️ 缓存基础设施
│   ├── src/
│   │   ├── cache.module.ts        # 缓存模块
│   │   ├── services/              # 缓存服务
│   │   │   ├── redis-cache.service.ts
│   │   │   └── memory-cache.service.ts
│   │   ├── factories/             # 工厂类
│   │   ├── decorators/            # 装饰器
│   │   ├── interceptors/          # 拦截器
│   │   └── interfaces/            # 接口定义
│   ├── package.json
│   ├── tsconfig.json
│   └── .swcrc
│
├── config/                        # ⚙️ 配置基础设施
│   ├── src/
│   │   ├── config.module.ts       # 配置模块
│   │   ├── lib/                   # 配置库
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── app.config.ts
│   │   └── services/              # 配置服务
│   ├── package.json
│   ├── tsconfig.json
│   └── .swcrc
│
├── database/                      # 🗃️ 数据库基础设施
│   ├── src/
│   │   ├── database.module.ts     # 数据库模块
│   │   ├── mikro-orm/             # MikroORM配置
│   │   ├── migrations/            # 数据库迁移
│   │   └── seeders/               # 数据填充
│   ├── package.json
│   ├── tsconfig.json
│   └── .swcrc
│
├── logging/                       # 📋 日志基础设施
│   ├── src/
│   │   ├── logging.module.ts      # 日志模块
│   │   ├── services/              # 日志服务
│   │   │   └── pino-logger.service.ts
│   │   └── middleware/            # 中间件
│   │       └── pino-logging.middleware.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .swcrc
│
└── security/                      # 🔒 安全基础设施
    ├── src/
    │   ├── security.module.ts     # 安全模块
    │   ├── auth/                  # 认证服务
    │   ├── encryption/            # 加密服务
    │   └── guards/                # 安全守卫
    ├── package.json
    ├── tsconfig.json
    └── .swcrc
```

---

## 🏗️ Clean Architecture 实施

### 分层依赖关系

```
📱 Presentation Layer (apps/api/src/{domain}/controllers)
    ↓ 依赖
💼 Application Layer (libs/domain/{domain}/application)
    ↓ 依赖
🧠 Domain Layer (libs/domain/{domain}/domain)
    ↑ 接口实现
🛠️ Infrastructure Layer (libs/infrastructure)
```

### 依赖倒置原则

#### ✅ 正确的依赖关系

```typescript
// libs/domain/iam/src/user/domain/repositories/user-repository.interface.ts
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: Uuid): Promise<User | null>;
}

// libs/domain/iam/src/user/application/use-cases/create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository, // 依赖抽象
  ) {}
}

// libs/infrastructure/database/src/repositories/user.repository.impl.ts
@Injectable()
export class UserRepositoryImpl implements UserRepository {
  // 实现抽象
  // 具体实现...
}
```

#### ❌ 错误的依赖关系

```typescript
// ❌ 应用层直接依赖基础设施实现
import { UserRepositoryImpl } from '@libs/infrastructure/database';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryImpl, // 直接依赖实现
  ) {}
}
```

### 分层职责说明

| 层次           | 职责                               | 不允许的依赖       | 允许的依赖 |
| -------------- | ---------------------------------- | ------------------ | ---------- |
| **表现层**     | HTTP请求处理、参数验证、响应格式化 | 领域层、基础设施层 | 应用层     |
| **应用层**     | 业务流程编排、事务协调、权限检查   | 表现层、基础设施层 | 领域层     |
| **领域层**     | 核心业务逻辑、业务规则、领域模型   | 任何外部层         | 无         |
| **基础设施层** | 数据存储、外部服务、技术实现       | 无限制             | 领域层接口 |

---

## 🚀 单体到微服务演进策略

### 第一阶段：单体应用（当前）

```
┌─────────────────────────────────────────────────────────────────┐
│                        apps/api                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │     IAM      │ Notification │ Workflow │ Analytics │ Others │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌─────────────────────────▼─────────────────────────────────────┐  │
│  │                   libs/domain                                │  │
│  │     ├─ iam/   ├─ notification/   ├─ workflow/   ├─ analytics/ │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌─────────────────────────▼─────────────────────────────────────┐  │
│  │                 libs/infrastructure                          │  │
│  │   ├─ database/  ├─ cache/  ├─ logging/  ├─ security/         │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**特点**:

- ✅ 单一部署单元
- ✅ 统一数据库事务
- ✅ 简化的开发和调试
- ✅ 降低运维复杂度

### 第二阶段：微服务化准备

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                                │
└─────────────────────────┬───────────────────────────────────────┘
┌─────────────────────────▼─────────────────────────────────────────┐
│                    apps/api                                      │
│ ┌─────────────┬─────────────┬─────────────┬─────────────────────┐ │
│ │  IAM Module │ Notification│  Workflow   │ Analytics & Others  │ │
│ │      │      │     │       │      │      │          │         │ │
│ │      ▼      │     ▼       │      ▼      │          ▼         │ │
│ │ libs/domain │ libs/domain │ libs/domain │    libs/domain     │ │
│ │    /iam     │/notification│  /workflow  │    /analytics      │ │
│ └─────────────┴─────────────┴─────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**准备工作**:

- 🎯 完善模块边界定义
- 📊 建立模块间通信协议
- 🔄 实现事件驱动架构
- 📋 标准化API接口

### 第三阶段：渐进式拆分

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                                │
└───┬─────────────┬─────────────┬─────────────┬─────────────────────┘
┌───▼──────────┐ ┌▼──────────┐ ┌▼──────────┐ ┌▼─────────────────────┐
│ IAM Service  │ │Notification│ │ Workflow  │ │   Analytics &        │
│              │ │  Service   │ │ Service   │ │   Other Services     │
│ libs/domain/ │ │libs/domain/│ │libs/domain/│ │                      │
│    iam       │ │notification│ │  workflow │ │   (待拆分)              │
│              │ │            │ │           │ │                      │
└──────────────┘ └────────────┘ └───────────┘ └──────────────────────┘
```

**拆分策略**:

- 🎯 按领域边界拆分
- 📊 基于业务价值优先级
- 🔄 保持数据一致性
- 📋 渐进式迁移

### 第四阶段：完全微服务化

```
                  ┌─────────────────────────────────┐
                  │          API Gateway            │
                  └───┬─────┬─────┬─────┬─────┬─────┘
        ┌─────────────▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐ ┌▼─────────┐
        │  IAM Service   │ │ N │ │ W │ │ A │ │  Others  │
        │                │ │ o │ │ o │ │ n │ │          │
        │ User │ Tenant  │ │ t │ │ r │ │ a │ │  Image   │
        │ Role │ Org     │ │ i │ │ k │ │ l │ │  Doc     │
        │ Auth │ Perm    │ │ f │ │ f │ │ y │ │  LLM     │
        │      │ Dept    │ │ i │ │ l │ │ t │ │  Cache   │
        └──────┴─────────┘ │ c │ │ o │ │ i │ │  ...     │
                           │ a │ │ w │ │ c │ │          │
                           │ t │ │   │ │ s │ │          │
                           │ i │ │   │ │   │ │          │
                           │ o │ │   │ │   │ │          │
                           │ n │ │   │ │   │ │          │
                           └───┘ └───┘ └───┘ └──────────┘
```

**最终架构**:

- ✅ 独立部署和扩展
- ✅ 技术栈多样化
- ✅ 团队自治开发
- ✅ 高可用和容错

---

## 📊 模块依赖管理

### 当前依赖关系

```typescript
// pnpm-workspace.yaml
packages:
  - "apps/*"
  - "libs/*"
  - "libs/domain/*"
  - "libs/infrastructure/*"

// apps/api/package.json
{
  "dependencies": {
    "@aiofix/domain-iam": "workspace:*",
    "@aiofix/domain-shared": "workspace:*",
    "@aiofix/infrastructure-cache": "workspace:*",
    "@aiofix/infrastructure-config": "workspace:*",
    "@aiofix/infrastructure-database": "workspace:*",
    "@aiofix/infrastructure-logging": "workspace:*",
    "@aiofix/infrastructure-security": "workspace:*"
  }
}

// libs/domain/iam/package.json
{
  "dependencies": {
    "@aiofix/domain-shared": "workspace:*"
  }
}
```

### 依赖原则

1. **📦 Apps 层**: 可以依赖所有 libs 模块
2. **🧠 Domain 层**: 只能依赖 domain/shared，不能依赖 infrastructure
3. **🛠️ Infrastructure 层**: 可以依赖 domain 层接口，实现具体技术
4. **🔄 同级模块**: domain 模块间可以相互依赖，但需要避免循环依赖

### 循环依赖预防

```typescript
// ✅ 正确：通过共享接口避免循环依赖
// libs/domain/shared/src/interfaces/event-bus.interface.ts
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
}

// libs/domain/iam/src/user/domain/entities/user.entity.ts
export class User {
  // 通过共享接口发布事件，不直接依赖其他领域
}

// ❌ 错误：直接相互依赖
// libs/domain/iam/src/user → libs/domain/notification/src/email
// libs/domain/notification/src/email → libs/domain/iam/src/user
```

---

## 🔧 开发工作流

### 新增子领域的步骤

#### 1. 创建领域模块

```bash
# 创建新领域目录
mkdir -p libs/domain/new-domain/src/{subdomain1,subdomain2}

# 复制模板配置
cp libs/domain/iam/package.json libs/domain/new-domain/
cp libs/domain/iam/tsconfig.json libs/domain/new-domain/
cp libs/domain/iam/.swcrc libs/domain/new-domain/

# 更新包名和依赖
```

#### 2. 创建子领域结构

```bash
# 为每个子领域创建四层架构
for subdomain in subdomain1 subdomain2; do
  mkdir -p libs/domain/new-domain/src/$subdomain/{domain,application,presentation}
  mkdir -p libs/domain/new-domain/src/$subdomain/domain/{entities,value-objects,events,services,repositories}
  mkdir -p libs/domain/new-domain/src/$subdomain/application/{use-cases,commands,queries,handlers,dtos}
  mkdir -p libs/domain/new-domain/src/$subdomain/presentation/controllers
done
```

#### 3. 创建基础设施支持

```bash
# 如果需要新的基础设施模块
mkdir -p libs/infrastructure/new-infra/src
cp libs/infrastructure/cache/package.json libs/infrastructure/new-infra/
cp libs/infrastructure/cache/tsconfig.json libs/infrastructure/new-infra/
cp libs/infrastructure/cache/.swcrc libs/infrastructure/new-infra/
```

#### 4. 集成到主应用

```typescript
// apps/api/src/new-domain/new-domain.module.ts
import { Module } from '@nestjs/common';
import { NewDomainModule } from '@aiofix/domain-new-domain';

@Module({
  imports: [NewDomainModule],
})
export class AppNewDomainModule {}

// apps/api/src/app.module.ts
@Module({
  imports: [
    // ... existing modules
    AppNewDomainModule,
  ],
})
export class AppModule {}
```

### 开发最佳实践

#### 1. 代码组织

```typescript
// ✅ 好的实践：清晰的模块边界
// libs/domain/iam/src/user/domain/entities/user.entity.ts
import { BaseEntity } from '@aiofix/domain-shared';
import { Username } from '../value-objects/username.vo';

export class User extends BaseEntity {
  constructor(private readonly _username: Username) {
    super();
  }

  // 充血模型：包含业务逻辑
  changeUsername(newUsername: Username): void {
    if (this._username.equals(newUsername)) {
      throw new DomainException('Username is the same');
    }
    this._username = newUsername;
    this.addDomainEvent(new UsernameChangedEvent(this.id, newUsername));
  }
}
```

#### 2. 测试组织

```typescript
// tests/unit/domain/iam/user/entities/user.entity.spec.ts
describe('User Entity', () => {
  describe('changeUsername', () => {
    it('should change username and emit event', () => {
      // Given
      const user = new User(Username.create('oldname'));
      const newUsername = Username.create('newname');

      // When
      user.changeUsername(newUsername);

      // Then
      expect(user.username.value).toBe('newname');
      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toBeInstanceOf(UsernameChangedEvent);
    });
  });
});
```

#### 3. 模块导出

```typescript
// libs/domain/iam/src/index.ts
// 公共API - 只导出必要的接口
export * from './user/domain/entities/user.entity';
export * from './user/domain/value-objects/username.vo';
export * from './user/domain/repositories/user-repository.interface';
export * from './user/application/use-cases/create-user.use-case';

// libs/domain/iam/src/user/index.ts
// 子领域内部导出
export * from './domain';
export * from './application';
export * from './presentation';
```

---

## 🧪 测试策略

### 测试层次

```
📊 E2E Tests (apps/api/test/e2e/)
    ↑ 测试
💼 Integration Tests (apps/api/test/integration/)
    ↑ 测试
🧠 Unit Tests (libs/domain/*/src/**/*.spec.ts)
```

### 测试组织

```
test/
├── unit/                          # 单元测试
│   ├── domain/                    # 领域层测试
│   │   └── iam/
│   │       ├── user/
│   │       ├── tenant/
│   │       └── ...
│   └── infrastructure/            # 基础设施测试
│       ├── cache/
│       ├── database/
│       └── ...
├── integration/                   # 集成测试
│   ├── user-workflow.spec.ts
│   ├── auth-flow.spec.ts
│   └── ...
└── e2e/                          # 端到端测试
    ├── auth.e2e-spec.ts
    ├── user-management.e2e-spec.ts
    └── ...
```

### 测试隔离

```typescript
// 领域层测试 - 纯业务逻辑，无外部依赖
describe('User Domain', () => {
  it('should create user with valid data', () => {
    const user = User.create({
      username: Username.create('john'),
      email: Email.create('john@example.com'),
    });

    expect(user.username.value).toBe('john');
  });
});

// 应用层测试 - 模拟基础设施依赖
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create user successfully', async () => {
    await useCase.execute({ username: 'john', email: 'john@example.com' });

    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📈 性能与扩展

### 构建优化

```json
{
  "scripts": {
    "build": "turbo run build",
    "build:api": "turbo run build --filter=@aiofix/api",
    "build:domain": "turbo run build --filter=@aiofix/domain-*",
    "build:infra": "turbo run build --filter=@aiofix/infrastructure-*"
  }
}
```

### 开发效率

```typescript
// turbo.json - 并行构建优化
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

### 运行时优化

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

/**
 * @function bootstrap
 * @description
 * 启动NestJS应用的主函数。该函数负责创建基于Fastify平台的应用实例，
 * 并监听指定端口启动高性能HTTP服务。
 *
 * 主要原理与机制如下：
 * 1. 通过NestFactory.create创建应用实例，使用FastifyAdapter作为HTTP适配器，
 *    Fastify是一个高性能的Node.js web框架，相比Express具有更好的性能表现。
 * 2. FastifyAdapter提供了Fastify与NestJS的集成，使得NestJS可以充分利用
 *    Fastify的高性能特性，如更快的路由匹配、更低的延迟等。
 * 3. 最后通过listen方法监听环境变量PORT指定的端口（默认3000），启动HTTP服务。
 *
 * 功能与业务规则：
 * 1. 启动单体应用服务器
 * 2. 集成所有领域模块
 * 3. 提供统一的API入口
 * @returns {Promise<void>} 返回一个Promise，表示应用启动过程
 */
async function bootstrap(): Promise<void> {
  // 创建基于Fastify的Nest应用实例，利用Fastify的高性能特性
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 启动HTTP服务，监听指定端口
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

// 启动应用
bootstrap();
```

---

## 🎯 总结

### 架构优势

1. **🎯 业务驱动**: 以子领域为核心的代码组织，业务边界清晰
2. **🏛️ 分层清晰**: 严格的Clean Architecture分层，依赖关系明确
3. **📦 模块化**: 高内聚低耦合的模块设计，易于维护和扩展
4. **🚀 演进能力**: 从单体到微服务的平滑演进路径

### 开发效率

1. **⚡ 快速启动**: 单体应用的简单部署和调试
2. **🔧 统一工具**: 统一的构建工具和开发环境
3. **📊 并行开发**: 按领域分工，团队并行开发
4. **🧪 测试完备**: 完整的测试策略和工具链

### 未来扩展

1. **🌐 微服务化**: 基于领域边界的自然拆分
2. **☁️ 云原生**: 容器化部署和Kubernetes编排
3. **📈 性能优化**: 基于监控数据的持续优化
4. **🔄 技术演进**: 支持新技术栈的渐进式引入

---

## 📚 相关文档

本文档与以下架构文档构成完整体系：

1. **[01-iam-business-requirements.md](./01-iam-business-requirements.md)** - 业务需求驱动
2. **[02-saas-platform-domain-division.md](./02-saas-platform-domain-division.md)** - 领域边界划分
3. **[03-hybrid-architecture-overview.md](./03-hybrid-architecture-overview.md)** - 架构设计总览
4. **[05-shared-layer-development-guide.md](./05-shared-layer-development-guide.md)** - 共享层实现
5. **[06-domain-layer-development-guide.md](./06-domain-layer-development-guide.md)** - 领域层实现
6. **[07-application-layer-development-guide.md](./07-application-layer-development-guide.md)** - 应用层实现
7. **[08-infrastructure-layer-development-guide.md](./08-infrastructure-layer-development-guide.md)** - 基础设施层实现
8. **[09-presentation-layer-development-guide.md](./09-presentation-layer-development-guide.md)** - 表现层实现

---

_本文档详细阐述了项目代码组织架构的设计理念、实施策略和演进路径，为团队提供了从单体应用到微服务架构的完整指导方案。_
