# Aiofix IAM Platform

基于DDD和Clean Architecture的多租户SaaS平台，采用混合架构模式（RESTful API + 事件溯源 + CQRS），为不同企业提供完整的身份认证与访问管理解决方案。

## 🚀 快速开始

### 前提条件

- Windows 10/11 + Docker Desktop
- WSL 2 已启用
- Node.js 20+
- pnpm

### 一键启动

```bash
# 克隆项目
git clone https://github.com/aiofix/aiofix-iam.git
cd aiofix-iam

# 运行自动化设置
./scripts/dev-setup.sh

# 启动API服务
cd apps/api && pnpm run start:dev
```

### 访问服务

- **API服务**: http://localhost:3000
- **API文档**: http://localhost:3000/api/v1/docs
- **pgAdmin**: http://localhost:8080 (admin@aiofix.com / admin123)
- **Redis Commander**: http://localhost:8081

## 📚 文档

详细文档请查看 [docs/](docs/) 目录：

- 🚀 [开发环境设置指南](docs/setup/development-environment-guide.md)
- 🏗️ [项目架构文档](docs/architecture/)
- 📋 [开发任务清单](docs/development-task-checklist.md)
- 🔧 [技术设计文档](docs/architecture/tech-stack/)

## 🏗️ 项目架构

### 技术栈

- **后端**: NestJS + TypeScript
- **数据库**: PostgreSQL (主数据库) + MongoDB (事件存储)
- **缓存**: Redis
- **ORM**: MikroORM
- **日志**: Pino
- **容器化**: Docker + Docker Compose
- **架构模式**: DDD + Clean Architecture + CQRS + Event Sourcing

### 项目结构

```
aiofix-iam/
├── apps/api/                    # API应用
├── libs/config/                 # 配置库
├── docs/                        # 项目文档
├── docker/                      # Docker配置
├── scripts/                     # 自动化脚本
└── docker-compose.yml          # 开发环境配置
```

## 🎯 核心特性

- **多租户架构**: 支持租户、组织、部门三级数据隔离
- **事件溯源**: 完整的事件存储和状态重建
- **CQRS模式**: 读写分离，性能优化
- **DDD设计**: 领域驱动设计，业务逻辑清晰
- **Clean Architecture**: 分层架构，依赖倒置
- **高性能**: Fastify适配器，Pino日志，Redis缓存

## 📊 项目进度

- **第一阶段**: 基础设施搭建 - 6/15 任务完成 (40%)
- **总体进度**: 6/85 任务完成 (7.1%)

详细进度请查看 [开发任务清单](docs/development-task-checklist.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 AGPL-3.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **项目主页**: https://aiofix.com
- **问题反馈**: https://github.com/aiofix/aiofix-iam/issues
- **团队邮箱**: team@aiofix.com

---

**项目状态**: 🟢 基础设施搭建完成，准备进入核心领域开发阶段
**最后更新**: 2024年12月
**版本**: v1.0.0
