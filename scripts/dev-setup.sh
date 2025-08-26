#!/bin/bash

# Aiofix IAM 开发环境设置脚本
# 创建时间: 2024年12月
# 描述: 自动化设置开发环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否可用
check_docker() {
    log_info "检查Docker环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装或未在PATH中"
        log_info "请按照 docs/setup/docker-setup-guide.md 中的说明配置Docker Desktop WSL集成"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker服务未运行"
        log_info "请启动Docker Desktop并确保WSL集成已启用"
        exit 1
    fi
    
    log_success "Docker环境检查通过"
}

# 检查Docker Compose是否可用
check_docker_compose() {
    log_info "检查Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装"
        exit 1
    fi
    
    log_success "Docker Compose检查通过"
}

# 启动开发环境
start_dev_environment() {
    log_info "启动开发环境..."
    
    # 停止可能存在的容器
    log_info "停止现有容器..."
    docker-compose down 2>/dev/null || true
    
    # 启动服务
    log_info "启动Docker服务..."
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    log_info "检查服务状态..."
    docker-compose ps
    
    log_success "开发环境启动完成"
}

# 检查服务健康状态
check_services_health() {
    log_info "检查服务健康状态..."
    
    # 检查PostgreSQL
    if docker-compose exec -T postgres pg_isready -U postgres -d aiofix_iam > /dev/null 2>&1; then
        log_success "PostgreSQL 服务正常"
    else
        log_warning "PostgreSQL 服务可能未完全启动"
    fi
    
    # 检查Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis 服务正常"
    else
        log_warning "Redis 服务可能未完全启动"
    fi
    
    # 检查MongoDB
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        log_success "MongoDB 服务正常"
    else
        log_warning "MongoDB 服务可能未完全启动"
    fi
}

# 显示服务信息
show_service_info() {
    log_info "服务访问信息:"
    echo ""
    echo "📊 数据库服务:"
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis: localhost:6379"
    echo "  MongoDB: localhost:27017"
    echo ""
    echo "🖥️  管理界面:"
    echo "  pgAdmin: http://localhost:8080 (admin@aiofix.com / admin123)"
    echo "  Redis Commander: http://localhost:8081"
    echo ""
    echo "🔐 默认凭据:"
    echo "  PostgreSQL: postgres / password"
    echo "  Redis: 无用户名 / redis123"
    echo "  MongoDB: admin / password123"
    echo ""
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 安装根目录依赖
    if [ -f "package.json" ]; then
        log_info "安装根目录依赖..."
        pnpm install
    fi
    
    # 安装API依赖
    if [ -f "apps/api/package.json" ]; then
        log_info "安装API依赖..."
        cd apps/api && pnpm install && cd ../..
    fi
    
    # 安装配置库依赖
    if [ -f "libs/config/package.json" ]; then
        log_info "安装配置库依赖..."
        cd libs/config && pnpm install && cd ../..
    fi
    
    log_success "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 构建配置库
    if [ -f "libs/config/package.json" ]; then
        log_info "构建配置库..."
        cd libs/config && pnpm run build && cd ../..
    fi
    
    # 构建API
    if [ -f "apps/api/package.json" ]; then
        log_info "构建API..."
        cd apps/api && pnpm run build && cd ../..
    fi
    
    log_success "项目构建完成"
}

# 主函数
main() {
    echo "🚀 Aiofix IAM 开发环境设置"
    echo "================================"
    echo ""
    
    # 检查Docker环境
    check_docker
    check_docker_compose
    
    # 启动开发环境
    start_dev_environment
    
    # 等待服务完全启动
    log_info "等待服务完全启动..."
    sleep 15
    
    # 检查服务健康状态
    check_services_health
    
    # 显示服务信息
    show_service_info
    
    # 安装依赖
    install_dependencies
    
    # 构建项目
    build_project
    
    echo ""
    log_success "🎉 开发环境设置完成！"
    echo ""
    log_info "下一步操作:"
    echo "  1. 启动API服务: cd apps/api && pnpm run start:dev"
    echo "  2. 访问API文档: http://localhost:3000/api/v1/docs"
    echo "  3. 测试配置: curl http://localhost:3000/api/v1/test-config"
    echo ""
}

# 执行主函数
main "$@"
