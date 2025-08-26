/**
 * @file index.ts
 * @description 组织应用层DTO导出文件
 *
 * 主要功能：
 * 1. 统一导出所有组织相关的DTO类
 * 2. 提供便捷的导入接口
 * 3. 确保DTO的一致性和可维护性
 */

export { CreateOrganizationDto } from './create-organization.dto';
export { UpdateOrganizationDto } from './update-organization.dto';
export { GetOrganizationsDto } from './get-organizations.dto';
export { OrganizationResponseDto } from './organization-response.dto';
export { PaginatedResponseDto } from './paginated-response.dto';
