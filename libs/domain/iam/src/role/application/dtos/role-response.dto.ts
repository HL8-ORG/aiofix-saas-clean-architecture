import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';

/**
 * @interface RoleContactResponseDto
 * @description 角色联系信息响应DTO
 */
export interface RoleContactResponseDto {
  /** 联系人姓名 */
  name: string;
  /** 联系人邮箱 */
  email: string;
  /** 联系人电话 */
  phone?: string;
  /** 联系人地址 */
  address?: string;
}

/**
 * @interface RoleSettingsResponseDto
 * @description 角色设置响应DTO
 */
export interface RoleSettingsResponseDto {
  /** 是否允许继承 */
  allowInheritance: boolean;
  /** 是否允许委托 */
  allowDelegation: boolean;
  /** 是否允许克隆 */
  allowCloning: boolean;
  /** 是否启用审计 */
  enableAudit: boolean;
  /** 是否启用通知 */
  enableNotification: boolean;
}

/**
 * @interface RoleLimitsResponseDto
 * @description 角色限制响应DTO
 */
export interface RoleLimitsResponseDto {
  /** 最大成员数量 */
  maxMembers: number;
  /** 最大子角色数量 */
  maxChildRoles: number;
  /** 最大权限数量 */
  maxPermissions: number;
  /** 角色有效期（天） */
  validityPeriod: number;
}

/**
 * @interface RoleStatisticsResponseDto
 * @description 角色统计信息响应DTO
 */
export interface RoleStatisticsResponseDto {
  /** 当前权限数量 */
  currentPermissions: number;
  /** 总成员数量 */
  totalMembers: number;
  /** 最后活动时间 */
  lastActivity: Date;
}

/**
 * @class RoleResponseDto
 * @description 角色响应DTO
 */
export class RoleResponseDto {
  /** 角色ID */
  @IsString()
  id!: string;

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

  /** 角色状态 */
  @IsString()
  status!: string;

  /** 角色联系信息 */
  @IsOptional()
  @IsObject()
  contact?: RoleContactResponseDto;

  /** 角色设置 */
  @IsOptional()
  @IsObject()
  settings?: RoleSettingsResponseDto;

  /** 角色限制 */
  @IsOptional()
  @IsObject()
  limits?: RoleLimitsResponseDto;

  /** 角色统计信息 */
  @IsObject()
  statistics!: RoleStatisticsResponseDto;

  /** 权限ID列表 */
  @IsArray()
  @IsString({ each: true })
  permissionIds!: string[];

  /** 成员ID列表 */
  @IsArray()
  @IsString({ each: true })
  memberIds!: string[];

  /** 是否启用 */
  @IsBoolean()
  isActive!: boolean;

  /** 创建时间 */
  createdAt!: Date;

  /** 更新时间 */
  updatedAt!: Date;

  /**
   * @method fromEntity
   * @description 从角色实体创建响应DTO
   * @param role 角色实体
   * @returns 角色响应DTO
   */
  static fromEntity(_role: unknown): RoleResponseDto {
    const dto = new RoleResponseDto();

    // 初始化基本属性
    dto.id = '';
    dto.name = '';
    dto.code = '';
    dto.organizationId = '';
    dto.status = 'ACTIVE';
    dto.isActive = true;
    dto.createdAt = new Date();
    dto.updatedAt = new Date();

    // 初始化数组和对象
    dto.permissionIds = [];
    dto.memberIds = [];
    dto.statistics = {
      currentPermissions: 0,
      totalMembers: 0,
      lastActivity: new Date(),
    };

    return dto;
  }

  /**
   * @method fromEntities
   * @description 从角色实体数组创建响应DTO数组
   * @param roles 角色实体数组
   * @returns 角色响应DTO数组
   */
  static fromEntities(roles: any[]): RoleResponseDto[] {
    return roles.map(role => RoleResponseDto.fromEntity(role));
  }
}
