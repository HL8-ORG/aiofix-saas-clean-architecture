/**
 * @file index.ts
 * @description 用户子领域测试入口文件
 *
 * 主要原理与机制：
 * 1. 统一管理用户子领域的所有测试
 * 2. 提供测试的模块化组织
 * 3. 支持按子领域运行测试
 *
 * 功能与业务规则：
 * 1. 导出用户子领域的所有测试
 * 2. 支持测试的批量运行
 * 3. 便于测试维护和管理
 */

// 导出用户领域层测试
export * from './domain/user.entity.test';
export * from './domain/username.vo.test';

// 导出用户应用层测试（待实现）
// export * from './application/create-user.use-case.test';
// export * from './application/get-user.use-case.test';
// export * from './application/update-user.use-case.test';
// export * from './application/delete-user.use-case.test';
