# Aiofix IAM 开发环境设置指南

## 🚀 快速开始

### 前提条件

1. **Windows 10/11** 已安装 Docker Desktop
2. **WSL 2** 已启用并配置
3. **Node.js 20+** 已安装
4. **pnpm** 已安装

### 自动设置（推荐）

运行自动化设置脚本：

```bash
# 给脚本执行权限（如果还没有）
chmod +x scripts/dev-setup.sh

# 运行设置脚本
./scripts/dev-setup.sh
```

### 手动设置

#### 1. 配置 Docker Desktop WSL 集成

1. 打开 Docker Desktop
2. 进入 **Settings** → **Resources** → **WSL Integration**
3. 启用 **Enable integration with my default WSL distro**
4. 启用当前WSL发行版的集成
5. 点击 **Apply & Restart**

#### 2. 启动开发环境

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

#### 3. 安装项目依赖

```bash
# 安装根目录依赖
pnpm install

# 安装API依赖
cd apps/api && pnpm install && cd ../..

# 安装配置库依赖
cd libs/config && pnpm install && cd ../..
```

#### 4. 构建项目

```bash
# 构建配置库
cd libs/config && pnpm run build && cd ../..

# 构建API
cd apps/api && pnpm run build && cd ../..
```

#### 5. 启动API服务

```bash
cd apps/api
pnpm run start:dev
```

## 🛠️ 服务访问信息

### 数据库服务

- **PostgreSQL**: `localhost:5432`
  - 数据库: `aiofix_iam`
  - 用户名: `postgres`
  - 密码: `password`

- **Redis**: `localhost:6379`
  - 密码: `redis123`

- **MongoDB**: `localhost:27017`
  - 数据库: `aiofix_iam_events`
  - 用户名: `admin`
  - 密码: `password123`

### 管理界面

- **pgAdmin**: http://localhost:8080
  - 邮箱: `admin@aiofix.com`
  - 密码: `admin123`

- **Redis Commander**: http://localhost:8081

### API服务

- **API服务**: http://localhost:3000
- **API文档**: http://localhost:3000/api/v1/docs
- **健康检查**: http://localhost:3000/api/v1/health
- **配置测试**: http://localhost:3000/api/v1/test-config

## 📝 常用命令

### Docker 命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service_name]

# 进入容器
docker-compose exec [service_name] bash

# 清理数据
docker-compose down -v
```

### 开发命令

```bash
# 启动API开发服务器
cd apps/api && pnpm run start:dev

# 构建项目
pnpm run build

# 运行测试
pnpm run test

# 代码检查
pnpm run lint
```

## 🔧 故障排除

### Docker 相关问题

**问题**: Docker命令未找到

```bash
# 解决方案: 确保Docker Desktop已启动且WSL集成已启用
# 在Windows中打开Docker Desktop，检查WSL集成设置
```

**问题**: 端口被占用

```bash
# 解决方案: 检查端口占用情况
netstat -tulpn | grep :5432
netstat -tulpn | grep :6379
netstat -tulpn | grep :27017

# 或者修改docker-compose.yml中的端口映射
```

### 数据库连接问题

**问题**: PostgreSQL连接失败

```bash
# 检查PostgreSQL服务状态
docker-compose exec postgres pg_isready -U postgres

# 查看PostgreSQL日志
docker-compose logs postgres
```

**问题**: Redis连接失败

```bash
# 检查Redis服务状态
docker-compose exec redis redis-cli ping

# 查看Redis日志
docker-compose logs redis
```

### API服务问题

**问题**: API服务启动失败

```bash
# 检查依赖是否正确安装
cd apps/api && pnpm install

# 检查配置库是否正确构建
cd libs/config && pnpm run build

# 查看API服务日志
cd apps/api && pnpm run start:dev
```

## 📚 相关文档

- [Docker设置指南](docker-setup-guide.md)
- [项目设置总结](project-setup-summary.md)
- [项目架构文档](../architecture/)
- [开发任务清单](../development-task-checklist.md)
- [API文档](http://localhost:3000/api/v1/docs)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 AGPL-3.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
