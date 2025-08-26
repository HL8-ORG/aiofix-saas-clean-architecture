# Docker 环境配置指南

## 📋 概述

本指南将帮助你在WSL 2环境中配置Docker Desktop，以便运行Aiofix IAM项目的开发环境。

## 🔧 前提条件

- Windows 10/11 已安装Docker Desktop
- WSL 2 已启用
- 当前WSL发行版已更新到WSL 2

## 🚀 配置步骤

### 1. 启用Docker Desktop的WSL集成

1. 打开Docker Desktop
2. 进入 **Settings** → **Resources** → **WSL Integration**
3. 启用 **Enable integration with my default WSL distro**
4. 启用当前WSL发行版的集成（如Ubuntu）
5. 点击 **Apply & Restart**

### 2. 验证Docker集成

在WSL终端中运行以下命令验证Docker是否可用：

```bash
# 检查Docker版本
docker --version

# 检查Docker Compose版本
docker-compose --version

# 测试Docker运行
docker run hello-world
```

### 3. 启动开发环境

在项目根目录运行：

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

## 🛠️ 服务端口

启动后，以下服务将在以下端口可用：

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **MongoDB**: `localhost:27017`
- **pgAdmin**: `http://localhost:8080`
- **Redis Commander**: `http://localhost:8081`

## 🔐 默认凭据

### PostgreSQL

- **主机**: localhost:5432
- **数据库**: aiofix_iam
- **用户名**: postgres
- **密码**: password

### Redis

- **主机**: localhost:6379
- **密码**: redis123

### MongoDB

- **主机**: localhost:27017
- **数据库**: aiofix_iam_events
- **用户名**: admin
- **密码**: password123

### pgAdmin

- **URL**: http://localhost:8080
- **邮箱**: admin@aiofix.com
- **密码**: admin123

## 📝 常用命令

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

## 🔍 故障排除

### 问题1: Docker命令未找到

**解决方案**: 确保Docker Desktop已启动且WSL集成已启用

### 问题2: 端口被占用

**解决方案**: 检查端口是否被其他服务占用，或修改docker-compose.yml中的端口映射

### 问题3: 权限问题

**解决方案**: 确保当前用户在docker组中，或使用sudo运行docker命令

## 📚 相关链接

- [Docker Desktop WSL 2 集成文档](https://docs.docker.com/desktop/windows/wsl/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [PostgreSQL 官方镜像](https://hub.docker.com/_/postgres)
- [Redis 官方镜像](https://hub.docker.com/_/redis)
- [MongoDB 官方镜像](https://hub.docker.com/_/mongo)
