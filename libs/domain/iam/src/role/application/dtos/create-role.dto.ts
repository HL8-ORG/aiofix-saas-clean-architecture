/**
 * @file create-role.dto.ts
 * @description 角色创建DTO，定义创建角色时所需的数据结构
 *
 * 主要原理与机制：
 * 1. 定义了角色创建的统一数据传输对象
 * 2. 包含角色基本信息、权限分配、成员管理等字段
 * 3. 支持角色层级关系和继承机制
 * 4. 提供完整的业务验证规则
 *
 * 功能与业务规则：
 * 1. 角色名称和代码的唯一性验证
 * 2. 角色类型和状态管理
 * 3. 权限分配和成员管理
 * 4. 角色层级关系验证
 * 5. 角色限制和配额管理
 */

import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
} from 'class-validator';

/**
 * @interface RoleContactDto
 * @description 角色联系信息DTO
 */
export interface RoleContactDto {
  /** 联系人姓名 */
  name?: string;
  /** 联系人邮箱 */
  email?: string;
  /** 联系人电话 */
  phone?: string;
  /** 联系人地址 */
  address?: string;
}

/**
 * @interface RoleSettingsDto
 * @description 角色设置DTO
 */
export interface RoleSettingsDto {
  /** 是否允许继承 */
  allowInheritance?: boolean;
  /** 是否允许委派 */
  allowDelegation?: boolean;
  /** 是否允许克隆 */
  allowCloning?: boolean;
  /** 是否启用审计 */
  enableAudit?: boolean;
  /** 是否启用通知 */
  enableNotification?: boolean;
}

/**
 * @interface RoleLimitsDto
 * @description 角色限制DTO
 */
export interface RoleLimitsDto {
  /** 最大成员数量 */
  maxMembers?: number;
  /** 最大子角色数量 */
  maxChildRoles?: number;
  /** 最大权限数量 */
  maxPermissions?: number;
  /** 角色有效期（天） */
  validityPeriod?: number;
}

/**
 * @class CreateRoleDto
 * @description 角色创建DTO
 */
export class CreateRoleDto {
  /** 角色名称 */
  @IsString()
  name!: string;

  /** 角色代码 */
  @IsString()
  code!: string;

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
  @IsString()
  organizationId!: string;

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
