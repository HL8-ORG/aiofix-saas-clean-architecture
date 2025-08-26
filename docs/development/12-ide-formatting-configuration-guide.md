# IDE格式化配置统一指南

## 概述

本文档旨在为团队提供统一的IDE格式化配置方案，确保所有开发人员在不同IDE环境下都能保持一致的代码风格。

## 问题背景

在团队开发中，由于不同开发人员使用不同的IDE和编辑器，以及各自的格式化工具配置差异，经常导致：

- 代码风格不一致
- 不必要的格式变更提交
- 代码审查时格式干扰
- 团队协作效率降低

## 解决方案

### 1. 项目级配置文件

#### 1.1 Prettier配置 (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "proseWrap": "preserve"
}
```

**配置说明：**

- `semi`: 语句末尾添加分号
- `trailingComma`: 对象和数组末尾添加逗号
- `singleQuote`: 使用单引号
- `printWidth`: 每行最大字符数
- `tabWidth`: 缩进空格数
- `endOfLine`: 统一使用LF换行符

#### 1.2 EditorConfig配置 (`.editorconfig`)

```ini
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

# TypeScript/JavaScript files
[*.{ts,tsx,js,jsx}]
indent_size = 2

# JSON files
[*.json]
indent_size = 2

# Markdown files
[*.md]
trim_trailing_whitespace = false

# YAML files
[*.{yml,yaml}]
indent_size = 2

# Package.json files
[package.json]
indent_size = 2
```

#### 1.3 VS Code工作区配置 (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnType": false,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.format.enable": true,
  "eslint.codeActionsOnSave.mode": "all",
  "files.associations": {
    "*.ts": "typescript",
    "*.tsx": "typescriptreact"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "files.eol": "\n",
  "files.autoSave": "onFocusChange",
  "editor.foldingStrategy": "indentation",
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "editor.renderWhitespace": "boundary",
  "editor.renderControlCharacters": false,
  "editor.lineNumbers": "on",
  "editor.rulers": [80],
  "editor.wordWrap": "bounded",
  "editor.wordWrapColumn": 80
}
```

### 2. 推荐扩展插件

#### 2.1 VS Code扩展推荐 (`.vscode/extensions.json`)

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

#### 2.2 必需扩展说明

- **Prettier**: 代码格式化工具
- **ESLint**: 代码质量检查
- **TypeScript**: TypeScript语言支持
- **Path Intellisense**: 路径自动补全

### 3. 团队协作配置

#### 3.1 Git Hooks配置

在`package.json`中添加pre-commit钩子：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

#### 3.2 脚本命令

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\"",
    "lint": "eslint \"**/*.{ts,tsx,js,jsx}\" --fix",
    "lint:check": "eslint \"**/*.{ts,tsx,js,jsx}\"",
    "type-check": "tsc --noEmit"
  }
}
```

### 4. 不同IDE配置指南

#### 4.1 VS Code

1. **安装扩展**：
   - 安装推荐的扩展插件
   - 重启VS Code

2. **验证配置**：
   - 打开任意TypeScript文件
   - 按`Ctrl+Shift+P`，输入"Format Document"
   - 确认使用Prettier格式化

3. **自动格式化**：
   - 确保启用了"保存时格式化"
   - 测试保存文件时是否自动格式化

#### 4.2 WebStorm/IntelliJ IDEA

1. **导入配置**：
   - 导入`.editorconfig`文件
   - 设置Prettier为默认格式化工具

2. **插件安装**：
   - 安装Prettier插件
   - 安装ESLint插件

3. **设置**：
   - 启用"保存时格式化"
   - 配置Prettier路径

#### 4.3 Vim/Neovim

1. **插件安装**：

   ```vim
   " 使用vim-plug
   Plug 'prettier/vim-prettier'
   Plug 'dense-analysis/ale'
   ```

2. **配置**：
   ```vim
   " 自动格式化
   let g:prettier#autoformat = 1
   let g:prettier#autoformat_require_pragma = 0
   ```

#### 4.4 Sublime Text

1. **安装Package Control**
2. **安装插件**：
   - Prettier
   - ESLint
   - EditorConfig

3. **配置**：
   - 设置Prettier为默认格式化工具
   - 启用保存时格式化

### 5. 验证和测试

#### 5.1 配置验证

运行以下命令验证配置：

```bash
# 格式化所有文件
pnpm format

# 检查格式化是否正确
pnpm format:check

# 检查lint错误
pnpm lint:check

# 检查类型错误
pnpm type-check
```

#### 5.2 测试用例

创建测试文件验证格式化：

```typescript
// test-formatting.ts
const testObject = {
  name: 'test',
  value: 123,
  items: [1, 2, 3],
};

function testFunction(param1: any, param2: any) {
  return param1 + param2;
}
```

格式化后应该变成：

```typescript
// test-formatting.ts
const testObject = {
  name: 'test',
  value: 123,
  items: [1, 2, 3],
};

function testFunction(param1: any, param2: any) {
  return param1 + param2;
}
```

### 6. 常见问题解决

#### 6.1 格式化不生效

**问题**：保存文件时没有自动格式化

**解决方案**：

1. 检查VS Code是否安装了Prettier扩展
2. 确认`.prettierrc`文件在项目根目录
3. 重启VS Code
4. 检查文件类型是否正确识别

#### 6.2 配置冲突

**问题**：不同IDE使用不同的格式化规则

**解决方案**：

1. 确保所有配置文件都提交到版本控制
2. 使用`.vscode/extensions.json`推荐扩展
3. 定期同步配置更新
4. 在团队中统一IDE版本

#### 6.3 性能问题

**问题**：格式化速度慢

**解决方案**：

1. 使用`.prettierignore`忽略不需要格式化的文件
2. 配置ESLint规则优化
3. 使用增量格式化

### 7. 最佳实践

#### 7.1 团队协作

1. **统一配置**：所有配置文件必须提交到版本控制
2. **定期更新**：定期检查和更新格式化规则
3. **文档维护**：及时更新配置文档
4. **培训**：新成员加入时进行配置培训

#### 7.2 代码审查

1. **格式检查**：在PR中检查代码格式
2. **自动化**：使用CI/CD自动检查格式
3. **工具使用**：使用工具而非人工检查格式

#### 7.3 持续改进

1. **反馈收集**：收集团队对格式化规则的反馈
2. **规则优化**：根据项目需求调整规则
3. **工具更新**：及时更新格式化工具版本

### 8. 维护和更新

#### 8.1 定期检查

- 每月检查一次格式化规则是否合理
- 每季度更新一次工具版本
- 每年审查一次配置文档

#### 8.2 版本控制

- 所有配置文件都要提交到Git
- 配置变更需要团队讨论
- 记录配置变更历史

#### 8.3 文档更新

- 及时更新配置文档
- 记录常见问题和解决方案
- 维护团队培训材料

## 总结

通过以上配置，团队可以实现：

1. **统一的代码风格**：所有开发人员使用相同的格式化规则
2. **自动化格式化**：保存时自动格式化，减少手动操作
3. **质量保证**：通过lint和类型检查确保代码质量
4. **团队协作**：减少格式冲突，提高协作效率

建议团队定期回顾和优化这些配置，确保它们始终满足项目需求。
