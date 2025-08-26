#!/bin/bash

# 测试运行脚本
# 用于运行IAM领域层的单元测试

echo "🚀 开始运行IAM领域层单元测试..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在IAM项目根目录下运行此脚本"
    exit 1
fi

# 清理之前的测试结果
echo "🧹 清理之前的测试结果..."
rm -rf coverage/
rm -rf .jest/

# 运行测试
echo "🧪 运行单元测试..."
pnpm test

# 检查测试结果
if [ $? -eq 0 ]; then
    echo "✅ 所有测试通过！"
    
    # 显示覆盖率报告
    if [ -d "coverage" ]; then
        echo "📊 测试覆盖率报告："
        cat coverage/lcov-report/index.html | grep -o 'All files[^<]*' || echo "覆盖率报告生成中..."
    fi
else
    echo "❌ 测试失败，请检查错误信息"
    exit 1
fi

echo "🎉 测试完成！"
