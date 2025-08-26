/**
 * @file index.ts
 * @description 租户应用层命令处理器导出文件
 *
 * 主要功能：
 * 1. 统一导出所有租户相关的命令处理器类
 * 2. 提供便捷的导入接口
 * 3. 确保处理器的一致性和可维护性
 */

export { CreateTenantHandler } from './create-tenant.handler';
export { UpdateTenantHandler } from './update-tenant.handler';
export { DeleteTenantHandler } from './delete-tenant.handler';
