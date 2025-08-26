/**
 * @file index.ts
 * @description 租户应用层DTO导出文件
 *
 * 主要功能：
 * 1. 统一导出所有租户相关的DTO类
 * 2. 提供便捷的导入接口
 * 3. 确保DTO的一致性和可维护性
 */

export { CreateTenantDto } from './create-tenant.dto';
export { UpdateTenantDto } from './update-tenant.dto';
export { GetTenantsDto } from './get-tenants.dto';
export { TenantResponseDto } from './tenant-response.dto';
export { PaginatedResponseDto, PaginationInfo } from './paginated-response.dto';
