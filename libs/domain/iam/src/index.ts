/**
 * @file index.ts
 * @description IAM领域模块主入口文件
 *
 * 该文件是IAM领域模块的主要入口点，提供：
 * - 所有子领域的导出
 * - 统一的模块接口
 * - 公共API定义
 *
 * 遵循DDD原则，按子领域组织导出。
 */

// 导出用户子领域
export * from './user/application';

// 导出租户子领域
export * from './tenant/domain';

// 导出组织子领域
export * from './organization/domain';

// 导出部门子领域
export * from './department/domain';

// 导出角色子领域
export * from './role/domain';

// 导出权限子领域
export * from './permission/domain';

// 导出认证子领域
export * from './auth/domain';
