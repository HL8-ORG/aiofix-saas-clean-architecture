/**
 * @file index.ts
 * @description 认证子领域测试入口文件
 *
 * 主要原理与机制：
 * 1. 统一管理认证子领域的所有测试
 * 2. 提供测试的模块化组织
 * 3. 支持按子领域运行测试
 *
 * 功能与业务规则：
 * 1. 导出认证子领域的所有测试
 * 2. 支持测试的批量运行
 * 3. 便于测试维护和管理
 */

// 导出认证领域层测试
export * from './domain/auth-token.vo.test';

// 导出认证应用层测试（待实现）
// export * from './application/login.use-case.test';
// export * from './application/logout.use-case.test';
// export * from './application/refresh-token.use-case.test';
// export * from './application/validate-token.use-case.test';
