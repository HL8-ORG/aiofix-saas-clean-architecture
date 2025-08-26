/**
 * @file index.ts
 * @description 部门应用层DTO导出文件
 *
 * 主要功能：
 * 1. 统一导出所有部门相关的DTO类
 * 2. 提供便捷的导入接口
 * 3. 确保DTO的一致性和可维护性
 */

export {
  CreateDepartmentDto,
  DepartmentContactDto,
  DepartmentSettingsDto,
  DepartmentLimitsDto,
} from './create-department.dto';
export { UpdateDepartmentDto } from './update-department.dto';
export {
  DepartmentResponseDto,
  DepartmentContactResponseDto,
  DepartmentSettingsResponseDto,
  DepartmentLimitsResponseDto,
  DepartmentStatisticsResponseDto,
} from './department-response.dto';
