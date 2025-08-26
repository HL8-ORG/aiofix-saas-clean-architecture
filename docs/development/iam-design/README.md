# IAM系统技术设计文档

## 📋 文档概述

本目录包含IAM系统的完整技术设计文档，涵盖了从整体架构到具体实现的各个方面。

## 📚 文档列表

### 1. 整体技术设计方案

- **文件**: [iam-technical-design.md](./iam-technical-design.md)
- **内容**: 整体架构设计、技术栈选择、安全架构、数据架构等
- **重点**: 系统整体架构和技术选型

### 2. API设计与服务实现

- **文件**: [iam-technical-design-part2.md](./iam-technical-design-part2.md)
- **内容**: API设计规范、服务层实现、命令查询处理器、事件处理器等
- **重点**: 应用层和接口层的详细设计

### 3. 高级功能设计

- **文件**: [iam-technical-design-part3.md](./iam-technical-design-part3.md)
- **内容**: 缓存架构、通知服务、监控告警、日志管理等
- **重点**: 系统的高级功能和性能优化

### 4. 第三方依赖集成

- **文件**: [iam-dependencies-integration.md](./iam-dependencies-integration.md)
- **内容**: Passport.js、JWT、CASL等第三方依赖的集成方案
- **重点**: 第三方依赖的选择和集成策略

### 5. 共享组件重构记录

- **文件**: [shared-components-refactoring.md](./shared-components-refactoring.md)
- **内容**: 共享组件架构重构的详细记录和经验总结
- **重点**: 架构优化、代码重构、最佳实践

## 🎯 文档阅读建议

### 按角色阅读

- **架构师**: 重点阅读整体技术设计方案
- **开发团队**: 详细阅读所有文档，特别是API设计和依赖集成
- **技术负责人**: 重点关注架构设计和集成方案

### 按阶段阅读

- **设计阶段**: 阅读整体技术设计方案
- **开发阶段**: 阅读API设计和依赖集成文档
- **优化阶段**: 阅读高级功能设计文档

## 🏗️ 架构概览

```
IAM系统技术架构
├── 整体架构设计 (iam-technical-design.md)
│   ├── 架构模式: DDD + EDA + 微服务
│   ├── 技术栈: NestJS + TypeScript + PostgreSQL + Redis
│   ├── 安全架构: Passport.js + JWT + CASL
│   └── 数据架构: 多租户隔离 + 事件溯源
├── API与服务设计 (iam-technical-design-part2.md)
│   ├── RESTful API设计
│   ├── 应用服务实现
│   ├── 命令查询处理器
│   └── 事件处理器
├── 高级功能设计 (iam-technical-design-part3.md)
│   ├── 缓存架构设计
│   ├── 通知服务设计
│   ├── 监控告警设计
│   └── 日志管理设计
└── 依赖集成方案 (iam-dependencies-integration.md)
    ├── Passport.js集成
    ├── JWT服务集成
    ├── CASL权限管理
    └── 性能优化策略
└── 架构重构记录 (shared-components-refactoring.md)
    ├── 共享组件重构
    ├── 架构优化经验
    ├── 最佳实践总结
    └── 技术要点记录
```

## 🔐 核心技术栈

### 后端技术栈

- **框架**: NestJS (Node.js)
- **语言**: TypeScript
- **认证框架**: Passport.js + @nestjs/passport
- **JWT处理**: @nestjs/jwt + passport-jwt
- **本地认证**: passport-local
- **权限管理**: CASL (Conditional Access Control Lists)
- **数据库**: PostgreSQL (主数据库) + Redis (缓存)
- **事件存储**: Apache Kafka + PostgreSQL (事件表)
- **消息队列**: RabbitMQ

### 前端技术栈

- **框架**: React + TypeScript
- **状态管理**: Redux Toolkit
- **UI组件库**: Ant Design
- **路由**: React Router
- **HTTP客户端**: Axios
- **构建工具**: Vite

### 基础设施

- **反向代理**: Nginx
- **负载均衡**: Nginx + HAProxy
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack
- **CI/CD**: GitHub Actions

## 🚀 核心特性

### 1. 多租户架构

- 租户级数据隔离
- 组织级权限控制
- 部门级数据访问

### 2. 事件驱动架构

- 完整的事件溯源
- 事件存储和重放
- 审计追踪能力

### 3. 权限管理

- 基于CASL的声明式权限
- 条件权限控制
- 多层级权限继承

### 4. 认证安全

- JWT令牌认证
- 本地认证策略
- 会话管理

### 5. 性能优化

- 多级缓存架构
- 数据库优化
- API性能优化

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

## 🔍 风险评估

### 技术风险

1. **性能风险**: 高并发下的性能问题
2. **安全风险**: 数据泄露和权限漏洞
3. **可用性风险**: 系统故障和服务中断

### 应对策略

1. **充分的性能测试和优化**
2. **安全审计和渗透测试**
3. **高可用架构和故障恢复**

## 📚 参考资料

1. [IAM业务需求文档](../business-requirements/iam-business-requirements.md)
2. [领域驱动设计指南](https://martinfowler.com/bliki/DomainDrivenDesign.html)
3. [事件驱动架构指南](https://martinfowler.com/articles/201701-event-driven.html)
4. [微服务架构指南](https://martinfowler.com/microservices/)
5. [NestJS官方文档](https://nestjs.com/)
6. [Passport.js官方文档](http://www.passportjs.org/)
7. [CASL官方文档](https://casl.js.org/)
8. [JWT官方文档](https://jwt.io/)

## 📞 联系方式

如有技术问题或建议，请联系：

- **技术负责人**: [联系方式]
- **架构师**: [联系方式]
- **开发团队**: [联系方式]

---

_本文档索引将根据项目进展持续更新和完善。_
