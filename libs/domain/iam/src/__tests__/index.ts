/**
 * @file index.ts
 * @description IAM领域模块测试入口文件
 *
 * 主要原理与机制：
 * 1. 统一管理IAM领域模块的所有测试
 * 2. 提供测试的模块化组织
 * 3. 支持按子领域运行测试
 * 4. 便于测试的维护和管理
 *
 * 功能与业务规则：
 * 1. 导出所有子领域的测试
 * 2. 支持测试的批量运行
 * 3. 便于测试维护和管理
 * 4. 支持测试覆盖率统计
 */

// 导出各子领域测试
export * from './user';
export * from './tenant';
export * from './organization';
// export * from './department'; // 暂时注释，因为还没有部门测试
export * from './role';
export * from './permission';
export * from './auth';

// 导出测试设置
// export * from './setup'; // 暂时注释，因为setup.ts不是模块
