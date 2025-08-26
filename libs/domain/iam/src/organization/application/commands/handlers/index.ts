/**
 * @file index.ts
 * @description 组织应用层命令处理器导出文件
 *
 * 主要功能：
 * 1. 统一导出所有组织相关的命令处理器类
 * 2. 提供便捷的导入接口
 * 3. 确保命令处理器的一致性和可维护性
 */

export { CreateOrganizationHandler } from './create-organization.handler';
export { UpdateOrganizationHandler } from './update-organization.handler';
export { DeleteOrganizationHandler } from './delete-organization.handler';
