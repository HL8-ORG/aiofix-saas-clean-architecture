/**
 * @file index.ts
 * @description 角色子领域测试入口文件
 *
 * 主要原理与机制：
 * 1. 统一管理角色子领域的所有测试
 * 2. 提供测试的模块化组织
 * 3. 支持按子领域运行测试
 *
 * 功能与业务规则：
 * 1. 导出角色子领域的所有测试
 * 2. 支持测试的批量运行
 * 3. 便于测试维护和管理
 */

// 导出角色领域层测试
export * from './domain/role.entity.test';
export * from './domain/role-code.vo.test';

// 导出角色应用层测试（待实现）
// export * from './application/create-role.use-case.test';
// export * from './application/get-role.use-case.test';
// export * from './application/update-role.use-case.test';
// export * from './application/delete-role.use-case.test';
