# IAM系统 API

## 📋 项目概述

基于领域驱动设计(DDD)和整洁架构(Clean Architecture)原则构建的多租户SaaS平台IAM系统。

## 🏗️ 项目架构

### 分层架构
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  (Controllers, Middleware, API Routes, Web UI)             │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│  (Use Cases, Application Services, DTOs)                   │
├─────────────────────────────────────────────────────────────┤
│                    Domain Layer                             │
│  (Entities, Value Objects, Domain Services, Aggregates)    │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                       │
│  (Repositories, External Services, Database, Cache)        │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构
```
src/
├── app/                    # 应用入口层
│   ├── config/            # 应用配置
│   ├── modules/           # 模块配置
│   └── bootstrap/         # 应用启动
├── iam/                   # IAM领域
│   ├── domain/            # 领域层
│   ├── application/       # 应用层
│   ├── infrastructure/    # 基础设施层
│   └── presentation/      # 表现层
└── shared/                # 共享模块
    ├── domain/            # 共享领域层
    ├── application/       # 共享应用层
    ├── infrastructure/    # 共享基础设施层
    └── presentation/      # 共享表现层
```

## 🚀 快速开始

### 环境要求
- Node.js 18.x/20.x LTS
- PostgreSQL 15.x/16.x
- MongoDB 6.x/7.x
- Redis 7.x

### 安装依赖
```bash
npm install
```

### 环境配置
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 启动开发服务器
```bash
npm run start:dev
```

## 📊 开发进度

### ✅ 已完成任务

#### 第一部分：核心基础设施
- [x] **任务1.1：项目结构创建** ✅ **已完成**
  - 创建了完整的DDD分层目录结构
  - 配置了IAM领域和共享模块
  - 创建了应用入口层配置
  - 项目能够正常编译和启动

- [x] **任务1.2：技术栈依赖安装** ✅ **已完成**
  - 安装了NestJS、MikroORM、Passport.js等核心依赖
  - 配置了TypeScript严格模式
  - 安装了开发工具
  - 使用pnpm作为包管理器

- [x] **任务1.3：环境配置文件** ✅ **已完成**
  - 创建了环境变量验证配置（使用zod）
  - 配置了数据库连接参数（PostgreSQL + MongoDB）
  - 配置了缓存和JWT参数
  - 创建了.env.example示例文件

### 🔄 进行中任务

#### 第一部分：核心基础设施
- [ ] **任务2：数据库设计和迁移**
  - [ ] PostgreSQL数据库设计
  - [ ] MongoDB事件存储设计
  - [ ] 数据库迁移脚本

- [ ] **任务3：基础架构组件**
  - [ ] MikroORM配置
  - [ ] Redis缓存配置
  - [ ] 日志系统配置

- [ ] **任务4：共享模块开发**
  - [ ] 共享值对象
  - [ ] 共享领域服务
  - [ ] 共享工具类

### 📋 待开始任务

#### 第二部分：领域层开发
- [ ] 共享域实现
- [ ] 租户域实现
- [ ] 用户域实现
- [ ] 组织域实现
- [ ] 角色域实现
- [ ] 权限域实现
- [ ] 认证域实现

## 🛠️ 技术栈

### 核心框架
- **NestJS 11.x** - 企业级Node.js框架
- **TypeScript 5.x** - 类型安全的JavaScript超集
- **Fastify** - 高性能HTTP服务器

### 数据库
- **PostgreSQL** - 主数据库
- **MongoDB** - 事件存储
- **Redis** - 缓存和会话存储
- **MikroORM** - TypeScript ORM

### 认证授权
- **Passport.js** - 身份验证中间件
- **JWT** - JSON Web Token
- **CASL** - 权限管理

### 架构模式
- **DDD** - 领域驱动设计
- **Clean Architecture** - 整洁架构
- **CQRS** - 命令查询职责分离
- **Event Sourcing** - 事件溯源

## 📚 文档

- [业务需求文档](../docs/business-requirements/iam-business-requirements.md)
- [架构设计文档](../docs/architecture/iam-domain-design.md)
- [开发任务清单](../docs/development-todo/01-overview-and-infrastructure-tasks.md)

## 🤝 贡献

请遵循项目的编码规范和架构原则。

## 📄 许可证

UNLICENSED
