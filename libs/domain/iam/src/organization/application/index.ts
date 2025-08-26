/**
 * @file index.ts
 * @description 组织应用层主导出文件
 *
 * 主要功能：
 * 1. 统一导出组织应用层的所有组件
 * 2. 提供便捷的导入接口
 * 3. 确保应用层的一致性和可维护性
 * 4. 为表现层提供完整的应用层接口
 */

// 导出模块
export { OrganizationApplicationModule } from './organization.module';

// 导出Use-Cases
export * from './use-cases';

// 导出DTOs
export * from './dtos';

// 导出Commands
export * from './commands';

// 导出Queries
export * from './queries';
