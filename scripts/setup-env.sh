#!/bin/bash

# ========================================
# Aiofix SaaS Platform - 环境变量设置脚本
# ========================================

set -e

echo "🚀 开始设置环境变量..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_message() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    # 如果在scripts目录下，尝试回到上级目录
    if [ -f "../package.json" ]; then
        cd ..
    else
        print_error "❌ 请在项目根目录运行此脚本"
        exit 1
    fi
fi

# 创建前端环境变量文件
print_message "📝 创建前端环境变量文件..."
mkdir -p apps/web
cat > apps/web/.env.local << EOF
# ========================================
# 前端环境变量配置
# ========================================

# 应用基础配置
NEXT_PUBLIC_APP_NAME=Aiofix SaaS Platform
NEXT_PUBLIC_APP_VERSION=1.0.0

# API配置（对齐后端端口与版本前缀）
NEXT_PUBLIC_API_URL=http://localhost:3000/v1

# 开发环境配置
NODE_ENV=development
NEXT_PUBLIC_ENV=development

# 调试配置
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug
EOF

print_message "✅ 前端环境变量文件已创建: apps/web/.env.local"

# 创建后端环境变量文件（对齐当前项目实际变量命名与默认值）
print_message "📝 创建后端环境变量文件..."
mkdir -p apps/api
cat > apps/api/.env << EOF
# ========================================
# 后端环境变量配置（NestJS + ConfigModule）
# ========================================

# 服务器配置
NODE_ENV=development
PORT=3000
API_PREFIX=v1

# 数据库配置（PostgreSQL + MikroORM）
DATABASE_HOST=localhost
DATABASE_PORT=25432
DATABASE_NAME=iam_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Cache/Redis（可选，默认 memory）
CACHE_DRIVER=memory
CACHE_TTL_SECONDS=60
REDIS_URL=redis://localhost:6379

# 认证配置（生产务必更换强密钥）
AUTH_JWT_SECRET=dev-secret
AUTH_ACCESS_EXPIRES_IN=900
AUTH_REFRESH_EXPIRES_IN=604800
AUTH_JWT_ISSUER=aiofix-auth
AUTH_JWT_AUDIENCE=aiofix-clients

# 日志配置（pino）
LOG_LEVEL=info
LOG_PRETTY=false

# CORS配置
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true
EOF

print_message "✅ 后端环境变量文件已创建: apps/api/.env"

# 设置文件权限
chmod 600 apps/web/.env.local
chmod 600 apps/api/.env

print_warning "⚠️  重要提醒:"
echo "1. 请检查并修改数据库连接信息"
echo "2. 生产环境请使用强JWT密钥"
echo "3. 确保.env文件不会被提交到版本控制"

print_message "🎉 环境变量设置完成!"
print_message "📖 详细配置说明请查看:"
echo "   - apps/web/ENV_SETUP.md"
echo "   - apps/api/ENV_SETUP.md"

print_message "🚀 现在可以启动项目了:"
echo "   前端: cd apps/web && pnpm run dev"
echo "   后端: cd apps/api && pnpm run start:dev" 