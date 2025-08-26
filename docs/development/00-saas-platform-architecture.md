# SaaS平台架构概览

## 📋 文档概述

本文档是Aiofix IAM系统的整体架构设计概览，基于领域驱动设计(DDD)、Clean Architecture和微服务架构模式，构建一个高可用、高性能、高安全性的SaaS平台。

## 🎯 文档定位

本文档作为整个架构设计的**总览和学习路径指引**，帮助开发者：

- 理解整体架构设计理念
- 了解技术选型和设计决策
- 掌握开发流程和最佳实践
- 建立完整的架构认知体系

## 🏗️ 整体架构模式

### SaaS平台架构特征

```
Aiofix SaaS IAM平台
├── 多租户架构 (Multi-Tenant)
│   ├── 租户隔离策略
│   ├── 数据隔离机制
│   ├── 资源配额管理
│   └── 计费与订阅管理
├── 微服务架构 (Microservices)
│   ├── 服务拆分策略
│   ├── 服务间通信
│   ├── 服务发现与治理
│   └── 分布式事务管理
├── 事件驱动架构 (Event-Driven)
│   ├── 事件溯源 (Event Sourcing)
│   ├── 事件总线 (Event Bus)
│   ├── 异步处理机制
│   └── 最终一致性保证
└── 云原生架构 (Cloud-Native)
    ├── 容器化部署
    ├── 弹性伸缩
    ├── 服务网格
    └── 可观测性
```

### Clean Architecture分层设计

```
Clean Architecture 四层架构
┌─────────────────────────────────────┐
│     Presentation Layer (表现层)      │  ← REST API、GraphQL、WebSocket
├─────────────────────────────────────┤
│     Application Layer (应用层)       │  ← Use Cases、Commands、Queries
├─────────────────────────────────────┤
│       Domain Layer (领域层)         │  ← Entities、Value Objects、Domain Services
├─────────────────────────────────────┤
│    Infrastructure Layer (基础设施层)  │  ← 数据库、缓存、消息队列、外部服务
└─────────────────────────────────────┘
```

## 🛠️ 技术架构栈

### 后端技术栈

```typescript
// 核心框架与语言
- 语言: TypeScript 5.x
- 框架: NestJS 10.x
- 数据库: PostgreSQL 15.x + MongoDB 7.x (多数据库支持)
- 缓存: Redis 7.x
- 消息队列: RabbitMQ 3.x
- 事件存储: Apache Kafka 3.x

// 认证与权限
- 认证: Passport.js + JWT
- 权限控制: CASL (基于能力的访问控制)
- 多因子认证: TOTP、短信验证码

// 数据层
- ORM: MikroORM (支持PostgreSQL & MongoDB)
- 连接池: pg-pool, mongodb connection pool
- 数据迁移: MikroORM migrations
- 数据同步: 事件驱动的数据同步机制
```

### 前端技术栈

```typescript
// 前端框架
- 框架: React 18.x + TypeScript
- 状态管理: Redux Toolkit + RTK Query
- 路由: React Router 6.x
- UI组件库: Ant Design 5.x

// 构建与工程化
- 构建工具: Vite 5.x
- 包管理: pnpm
- 代码规范: ESLint + Prettier
- 类型检查: TypeScript strict mode
```

### 基础设施技术

```yaml
# 容器化与部署
容器: Docker + Docker Compose
编排: Kubernetes
服务网格: Istio
网关: APISIX

# 监控与可观测性
监控: Prometheus + Grafana
日志: ELK Stack (Elasticsearch + Logstash + Kibana)
链路追踪: Jaeger
健康检查: Custom Health Checks

# CI/CD
代码仓库: Git
CI/CD: GitHub Actions
制品仓库: Docker Registry
部署策略: 蓝绿部署、滚动更新
```

## 🏛️ 领域模型设计

### 核心业务域

```
IAM核心业务域
├── 租户管理域 (Tenant Management)
│   ├── 租户注册与验证
│   ├── 订阅计划管理
│   ├── 资源配额控制
│   └── 计费与结算
├── 身份管理域 (Identity Management)
│   ├── 用户生命周期管理
│   ├── 身份验证与授权
│   ├── 单点登录 (SSO)
│   └── 多因子认证 (MFA)
├── 组织管理域 (Organization Management)
│   ├── 组织架构管理
│   ├── 部门层级管理
│   ├── 人员关系管理
│   └── 组织权限继承
├── 权限管理域 (Permission Management)
│   ├── 角色权限模型
│   ├── 基于属性的访问控制
│   ├── 动态权限评估
│   └── 权限审计追踪
└── 审计管理域 (Audit Management)
    ├── 操作日志记录
    ├── 事件溯源存储
    ├── 合规性报告
    └── 数据保护审计
```

### 聚合根设计

```typescript
// 主要聚合根
- TenantAggregate: 租户聚合根
- UserAggregate: 用户聚合根
- OrganizationAggregate: 组织聚合根
- RoleAggregate: 角色聚合根
- PermissionAggregate: 权限聚合根
- AuditLogAggregate: 审计日志聚合根
```

## 🔐 安全架构设计

### 多层安全防护

```
安全防护层次
├── 网络安全层
│   ├── DDoS防护
│   ├── WAF (Web应用防火墙)
│   ├── API网关限流
│   └── IP白名单/黑名单
├── 应用安全层
│   ├── 身份认证 (JWT + OAuth2)
│   ├── 访问控制 (RBAC + ABAC)
│   ├── API鉴权
│   └── 会话管理
├── 数据安全层
│   ├── 数据加密 (AES-256)
│   ├── 敏感信息脱敏
│   ├── 数据库权限控制
│   └── 备份加密
└── 合规安全层
    ├── GDPR合规
    ├── SOC2 Type II
    ├── ISO27001
    └── 行业特定合规要求
```

### 租户数据隔离策略

```typescript
// 数据隔离级别
enum IsolationLevel {
  SHARED_DATABASE_SHARED_SCHEMA = 'shared_db_shared_schema',    // 共享数据库共享模式
  SHARED_DATABASE_SEPARATE_SCHEMA = 'shared_db_separate_schema', // 共享数据库独立模式
  SEPARATE_DATABASE = 'separate_database'                       // 独立数据库
}

// 根据租户等级选择隔离策略
- 基础版: SHARED_DATABASE_SHARED_SCHEMA (行级隔离)
- 专业版: SHARED_DATABASE_SEPARATE_SCHEMA (模式级隔离)
- 企业版: SEPARATE_DATABASE (数据库级隔离)
```

## 📈 性能架构设计

### 高性能策略

```
性能优化策略
├── 缓存策略
│   ├── Redis多级缓存
│   ├── 查询结果缓存
│   ├── 权限缓存
│   └── 会话缓存
├── 数据库优化
│   ├── 读写分离
│   ├── 分库分表
│   ├── 索引优化
│   └── 查询优化
├── 异步处理
│   ├── 消息队列
│   ├── 事件驱动
│   ├── 后台任务
│   └── 批量处理
└── CDN与压缩
    ├── 静态资源CDN
    ├── API响应压缩
    ├── 图片压缩
    └── 文件压缩
```

### 可扩展性设计

```
水平扩展能力
├── 应用层扩展
│   ├── 无状态应用设计
│   ├── 负载均衡
│   ├── 自动伸缩
│   └── 容器编排
├── 数据层扩展
│   ├── 数据库分片
│   ├── 读写分离
│   ├── 缓存集群
│   └── 存储分层
├── 服务层扩展
│   ├── 微服务拆分
│   ├── 服务发现
│   ├── 熔断降级
│   └── 限流控制
└── 基础设施扩展
    ├── 云原生架构
    ├── 弹性计算
    ├── 存储扩展
    └── 网络扩展
```

## 🔄 开发流程与架构

### CQRS + Event Sourcing模式

```typescript
// 命令查询职责分离
Command Side (写模型)          Query Side (读模型)
     ↓                           ↑
[Command] → [Handler]        [Query] → [Handler]
     ↓                           ↑
[Domain Model]              [Read Model]
     ↓                           ↑
[Event Store] ←→ [Event Bus] ←→ [Projection]
```

### 事件驱动开发流程

```
事件驱动开发流程
1. 领域事件定义 → 2. 命令处理器 → 3. 事件发布
                        ↓
6. 查询处理器 ← 5. 读模型投影 ← 4. 事件处理器
```

## 📚 开发指南学习路径

本平台提供完整的开发指南体系，建议按以下顺序学习：

### 第一阶段：架构基础理解

1. **[00-saas-platform-architecture.md](./00-saas-platform-architecture.md)** - 本文档，整体架构概览
2. **[04-project-code-organization-architecture.md](./04-project-code-organization-architecture.md)** - 项目代码组织架构
3. **[05-shared-layer-development-guide.md](./05-shared-layer-development-guide.md)** - 共享层开发指南

### 第二阶段：分层架构开发

4. **[06-domain-layer-development-guide.md](./06-domain-layer-development-guide.md)** - 领域层开发指南
5. **[07-application-layer-development-guide.md](./07-application-layer-development-guide.md)** - 应用层开发指南
6. **[08-infrastructure-layer-development-guide.md](./08-infrastructure-layer-development-guide.md)** - 基础设施层开发指南
7. **[09-presentation-layer-development-guide.md](./09-presentation-layer-development-guide.md)** - 表现层开发指南

### 第三阶段：业务领域实现

8. **[11-iam-domain-technical-design.md](./11-iam-domain-technical-design.md)** - IAM领域技术设计
9. **[12-ide-formatting-configuration-guide.md](./12-ide-formatting-configuration-guide.md)** - IDE格式化配置指南

### 学习路径总览表

| 序号 | 文档名称           | 核心内容                         | 目标读者   | 预计学习时间 |
| ---- | ------------------ | -------------------------------- | ---------- | ------------ |
| 00   | SaaS平台架构概览   | 整体架构、技术选型、设计原则     | 全体开发者 | 2-3小时      |
| 04   | 项目代码组织架构   | 目录结构、模块划分、命名约定     | 全体开发者 | 1-2小时      |
| 05   | 共享层开发指南     | 基础组件、工具类、通用接口       | 框架开发者 | 2-3小时      |
| 06   | 领域层开发指南     | 实体、值对象、领域服务、仓储     | 后端开发者 | 3-4小时      |
| 07   | 应用层开发指南     | Use Case、Command/Query、CQRS    | 后端开发者 | 3-4小时      |
| 08   | 基础设施层开发指南 | 数据库、缓存、消息队列、外部服务 | 后端开发者 | 2-3小时      |
| 09   | 表现层开发指南     | API设计、控制器、中间件、验证    | 全栈开发者 | 2-3小时      |
| 11   | IAM领域技术设计    | IAM业务模型、技术实现、API设计   | IAM开发者  | 4-5小时      |
| 12   | IDE配置指南        | 开发环境、代码格式化、调试配置   | 全体开发者 | 1小时        |

## 🚀 核心特性

### 1. 企业级多租户能力

```typescript
// 租户能力矩阵
interface TenantCapabilities {
  // 数据隔离
  dataIsolation: 'row-level' | 'schema-level' | 'database-level';

  // 功能定制
  customization: {
    branding: boolean; // 品牌定制
    workflows: boolean; // 流程定制
    permissions: boolean; // 权限定制
    integrations: boolean; // 集成定制
  };

  // 资源配额
  quotas: {
    users: number; // 用户数量限制
    storage: number; // 存储空间限制
    apiCalls: number; // API调用限制
    concurrent: number; // 并发连接限制
  };

  // SLA保证
  sla: {
    uptime: number; // 可用性保证
    responseTime: number; // 响应时间保证
    support: 'basic' | 'premium' | 'enterprise';
  };
}
```

### 2. 灵活权限控制系统

```typescript
// 混合权限模型
interface PermissionModel {
  // RBAC (基于角色的访问控制)
  roleBasedAccess: {
    roles: Role[];
    permissions: Permission[];
    rolePermissions: RolePermission[];
  };

  // ABAC (基于属性的访问控制)
  attributeBasedAccess: {
    subject: SubjectAttributes; // 主体属性 (用户)
    resource: ResourceAttributes; // 资源属性
    action: ActionAttributes; // 操作属性
    environment: EnvironmentAttributes; // 环境属性
  };

  // 动态权限评估
  dynamicEvaluation: {
    conditions: PolicyCondition[];
    rules: PolicyRule[];
    context: EvaluationContext;
  };
}
```

### 3. 事件溯源与审计

```typescript
// 事件溯源架构
interface EventSourcingSystem {
  // 事件存储
  eventStore: {
    append: (events: DomainEvent[]) => Promise<void>;
    getEvents: (aggregateId: string) => Promise<DomainEvent[]>;
    getSnapshot: (aggregateId: string) => Promise<Snapshot | null>;
  };

  // 事件投影
  projections: {
    userProjection: UserReadModel;
    organizationProjection: OrganizationReadModel;
    auditProjection: AuditReadModel;
  };

  // 审计能力
  auditCapabilities: {
    operationTracking: boolean; // 操作跟踪
    dataChangesTracking: boolean; // 数据变更跟踪
    accessLogging: boolean; // 访问日志
    complianceReporting: boolean; // 合规报告
  };
}
```

## 📊 监控与可观测性

### 监控指标体系

```typescript
// 业务指标
interface BusinessMetrics {
  tenantMetrics: {
    activeUsers: number; // 活跃用户数
    loginSuccess: number; // 登录成功率
    apiUsage: number; // API使用量
    featureAdoption: number; // 功能采用率
  };

  performanceMetrics: {
    responseTime: number; // 响应时间
    throughput: number; // 吞吐量
    errorRate: number; // 错误率
    availability: number; // 可用性
  };

  resourceMetrics: {
    cpuUsage: number; // CPU使用率
    memoryUsage: number; // 内存使用率
    diskUsage: number; // 磁盘使用率
    networkTraffic: number; // 网络流量
  };
}
```

### 告警策略

```yaml
# 告警配置示例
alerts:
  - name: '高错误率告警'
    condition: 'error_rate > 5%'
    severity: 'critical'
    notification: ['email', 'slack', 'sms']

  - name: '响应时间告警'
    condition: 'response_time > 2s'
    severity: 'warning'
    notification: ['slack']

  - name: '数据库连接告警'
    condition: 'db_connections > 80%'
    severity: 'warning'
    notification: ['email', 'slack']
```

## 🔧 开发环境与工具链

### 本地开发环境

```bash
# 开发环境要求
Node.js: >= 18.x
pnpm: >= 8.x
Docker: >= 24.x
PostgreSQL: >= 15.x
Redis: >= 7.x

# 开发工具推荐
IDE: VS Code / WebStorm
数据库工具: DBeaver / Navicat
API测试: Postman / Insomnia
Git工具: Git CLI / SourceTree
```

### 代码质量工具链

```json
{
  "linting": {
    "eslint": "^8.x",
    "prettier": "^3.x",
    "@typescript-eslint/parser": "^6.x"
  },
  "testing": {
    "jest": "^29.x",
    "supertest": "^6.x",
    "testcontainers": "^10.x"
  },
  "analysis": {
    "sonarqube": "代码质量分析",
    "codecov": "代码覆盖率",
    "snyk": "安全漏洞扫描"
  }
}
```

## 🚢 部署与运维

### 部署架构

```yaml
# 生产环境部署架构
production:
  load_balancer:
    - nginx: '负载均衡器'
    - ssl_termination: 'SSL终止'

  application_tier:
    - replicas: 3
    - auto_scaling: true
    - health_checks: enabled

  data_tier:
    - postgresql:
        master: 1
        slaves: 2
        backup: daily
    - redis:
        cluster: 3_nodes
        persistence: enabled

  monitoring:
    - prometheus: '指标收集'
    - grafana: '可视化'
    - jaeger: '链路追踪'
    - elk: '日志分析'
```

### 灾备与恢复

```yaml
# 灾备策略
disaster_recovery:
  backup_strategy:
    - database: '每日全量备份 + 实时增量备份'
    - files: '每日备份到云存储'
    - configuration: '版本控制管理'

  recovery_objectives:
    - rto: '< 4小时' # 恢复时间目标
    - rpo: '< 1小时' # 恢复点目标

  testing:
    - frequency: '季度'
    - scope: '完整恢复演练'
```

## 📋 最佳实践

### 开发最佳实践

1. **代码组织**
   - 遵循DDD目录结构
   - 保持单一职责原则
   - 使用依赖注入

2. **错误处理**
   - 统一异常处理机制
   - 详细的错误日志
   - 用户友好的错误信息

3. **性能优化**
   - 合理使用缓存
   - 数据库查询优化
   - 异步处理长时间任务

4. **安全实践**
   - 输入验证和输出编码
   - 最小权限原则
   - 定期安全审计

### 运维最佳实践

1. **监控告警**
   - 全面的指标监控
   - 及时的告警通知
   - 详细的故障分析

2. **部署发布**
   - 自动化CI/CD流程
   - 蓝绿部署策略
   - 回滚机制

3. **容量规划**
   - 定期容量评估
   - 性能压测
   - 资源预留

## 🔗 相关资源

### 官方文档

- [NestJS官方文档](https://nestjs.com/)
- [TypeScript官方文档](https://www.typescriptlang.org/)
- [MikroORM官方文档](https://mikro-orm.io/)

### 架构设计参考

- [领域驱动设计](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [事件驱动架构](https://martinfowler.com/articles/201701-event-driven.html)
- [CQRS模式](https://martinfowler.com/bliki/CQRS.html)

### 技术社区

- [DDD社区](https://dddcommunity.org/)
- [NestJS中文社区](https://nestjs.com/)
- [TypeScript中文社区](https://www.typescriptlang.org/)

---

**下一步学习建议：**

1. 仔细阅读[项目代码组织架构](./04-project-code-organization-architecture.md)
2. 了解[共享层开发指南](./05-shared-layer-development-guide.md)
3. 开始[领域层开发](./06-domain-layer-development-guide.md)

_本文档持续更新，最后修改时间：2024年1月_
