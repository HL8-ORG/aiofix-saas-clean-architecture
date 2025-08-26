/**
 * @file index.ts
 * @description 角色应用层DTO导出文件
 *
 * 主要功能：
 * 1. 统一导出所有角色相关的DTO类
 * 2. 提供便捷的导入接口
 * 3. 确保DTO的一致性和可维护性
 */

export {
  CreateRoleDto,
  RoleContactDto,
  RoleSettingsDto,
  RoleLimitsDto,
} from './create-role.dto';
export { UpdateRoleDto } from './update-role.dto';
export {
  RoleResponseDto,
  RoleContactResponseDto,
  RoleSettingsResponseDto,
  RoleLimitsResponseDto,
  RoleStatisticsResponseDto,
} from './role-response.dto';
