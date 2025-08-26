/**
 * @file update-role.dto.ts
 * @description 角色更新DTO，定义更新角色时所需的数据结构
 *
 * 主要原理与机制：
 * 1. 继承CreateRoleDto的所有字段，但所有字段都是可选的
 * 2. 支持部分更新，只更新提供的字段
 * 3. 保持与创建DTO相同的验证规则
 * 4. 支持角色状态变更和权限调整
 *
 * 功能与业务规则：
 * 1. 支持角色基本信息更新
 * 2. 支持权限分配调整
 * 3. 支持成员管理更新
 * 4. 支持角色设置和限制调整
 * 5. 支持角色状态变更
 */

import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import {
  RoleContactDto,
  RoleSettingsDto,
  RoleLimitsDto,
} from './create-role.dto';

/**
 * @class UpdateRoleDto
 * @description 角色更新DTO
 */
export class UpdateRoleDto {
  /** 角色名称 */
  @IsOptional()
  @IsString()
  name?: string;

  /** 角色代码 */
  @IsOptional()
  @IsString()
  code?: string;

  /** 角色描述 */
  @IsOptional()
  @IsString()
  description?: string;

  /** 角色类型 */
  @IsOptional()
  @IsString()
  type?: string;

  /** 父角色ID */
  @IsOptional()
  @IsString()
  parentId?: string;

  /** 组织ID */
  @IsOptional()
  @IsString()
  organizationId?: string;

  /** 部门ID */
  @IsOptional()
  @IsString()
  departmentId?: string;

  /** 角色联系信息 */
  @IsOptional()
  @IsObject()
  contact?: RoleContactDto;

  /** 角色设置 */
  @IsOptional()
  @IsObject()
  settings?: RoleSettingsDto;

  /** 角色限制 */
  @IsOptional()
  @IsObject()
  limits?: RoleLimitsDto;

  /** 权限ID列表 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];

  /** 成员ID列表 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];

  /** 是否启用 */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** 排序权重 */
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  /** 元数据 */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
