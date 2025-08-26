import { ApiProperty } from '@nestjs/swagger';
import {
  Organization,
  OrganizationStatus,
  OrganizationType,
} from '../../domain/entities/organization.entity';

/**
 * @interface OrganizationContactResponseDto
 * @description 组织联系信息响应DTO
 */
export class OrganizationContactResponseDto {
  @ApiProperty({ description: '邮箱地址' })
  email?: string;

  @ApiProperty({ description: '电话号码' })
  phone?: string;

  @ApiProperty({ description: '地址' })
  address?: string;

  @ApiProperty({ description: '网站' })
  website?: string;

  @ApiProperty({ description: '联系人' })
  contactPerson?: string;

  @ApiProperty({ description: '联系电话' })
  contactPhone?: string;
}

/**
 * @interface OrganizationSettingsResponseDto
 * @description 组织设置响应DTO
 */
export class OrganizationSettingsResponseDto {
  @ApiProperty({ description: '允许用户注册' })
  allowUserRegistration!: boolean;

  @ApiProperty({ description: '需要审批' })
  requireApproval!: boolean;

  @ApiProperty({ description: '自动分配角色' })
  autoAssignRoles!: boolean;

  @ApiProperty({ description: '数据隔离级别' })
  dataIsolationLevel!: string;

  @ApiProperty({ description: '通知设置' })
  notificationSettings!: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };

  @ApiProperty({ description: '安全设置' })
  securitySettings!: {
    requireTwoFactor: boolean;
    passwordPolicy: string;
    sessionTimeout: number;
  };
}

/**
 * @interface OrganizationLimitsResponseDto
 * @description 组织限制响应DTO
 */
export class OrganizationLimitsResponseDto {
  @ApiProperty({ description: '最大用户数' })
  maxUsers!: number;

  @ApiProperty({ description: '最大部门数' })
  maxDepartments!: number;

  @ApiProperty({ description: '最大角色数' })
  maxRoles!: number;

  @ApiProperty({ description: '最大项目数' })
  maxProjects!: number;

  @ApiProperty({ description: '存储限制（GB）' })
  storageLimit!: number;

  @ApiProperty({ description: 'API速率限制' })
  apiRateLimit!: number;
}

/**
 * @interface OrganizationStatisticsResponseDto
 * @description 组织统计信息响应DTO
 */
export class OrganizationStatisticsResponseDto {
  @ApiProperty({ description: '用户数量' })
  userCount!: number;

  @ApiProperty({ description: '部门数量' })
  departmentCount!: number;

  @ApiProperty({ description: '角色数量' })
  roleCount!: number;

  @ApiProperty({ description: '项目数量' })
  projectCount!: number;

  @ApiProperty({ description: '存储使用量（GB）' })
  storageUsed!: number;

  @ApiProperty({ description: 'API调用次数' })
  apiCallCount!: number;
}

/**
 * @class OrganizationResponseDto
 * @description 组织响应DTO
 */
export class OrganizationResponseDto {
  @ApiProperty({ description: '组织ID' })
  id!: string;

  @ApiProperty({ description: '组织代码' })
  code!: string;

  @ApiProperty({ description: '组织名称' })
  name!: string;

  @ApiProperty({ description: '组织描述' })
  description?: string;

  @ApiProperty({ description: '组织状态', enum: OrganizationStatus })
  status!: OrganizationStatus;

  @ApiProperty({ description: '组织类型', enum: OrganizationType })
  type!: OrganizationType;

  @ApiProperty({ description: '租户ID' })
  tenantId!: string;

  @ApiProperty({ description: '父组织ID' })
  parentId?: string;

  @ApiProperty({ description: '子组织ID列表' })
  children!: string[];

  @ApiProperty({ description: '管理员ID' })
  managerId?: string;

  @ApiProperty({ description: '成员ID列表' })
  members!: string[];

  @ApiProperty({ description: '联系信息' })
  contact!: OrganizationContactResponseDto;

  @ApiProperty({ description: '组织设置' })
  settings!: OrganizationSettingsResponseDto;

  @ApiProperty({ description: '组织限制' })
  limits!: OrganizationLimitsResponseDto;

  @ApiProperty({ description: '统计信息' })
  statistics?: OrganizationStatisticsResponseDto;

  @ApiProperty({ description: '元数据' })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: '创建时间' })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt!: Date;

  /**
   * @static
   * @method fromEntity
   * @description 从组织实体创建响应DTO
   * @param entity 组织实体
   * @returns {OrganizationResponseDto} 组织响应DTO
   */
  static fromEntity(entity: Organization): OrganizationResponseDto {
    const dto = new OrganizationResponseDto();
    dto.id = entity.id.value;
    dto.code = entity.code.value;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.status = entity.status;
    dto.type = entity.type;
    dto.tenantId = entity.tenantId.value;
    dto.parentId = entity.parentId?.value;
    dto.children = entity.children.map(id => id.value);
    dto.managerId = entity.managerId?.value;
    dto.members = entity.members.map(id => id.value);
    dto.contact = {
      email: entity.contact.email,
      phone: entity.contact.phone,
      address: entity.contact.address,
      website: entity.contact.website,
      contactPerson: entity.contact.contactPerson,
      contactPhone: entity.contact.contactPhone,
    };
    dto.settings = {
      allowUserRegistration: entity.settings.allowUserRegistration,
      requireApproval: entity.settings.requireApproval,
      autoAssignRoles: entity.settings.autoAssignRoles,
      dataIsolationLevel: entity.settings.dataIsolationLevel,
      notificationSettings: {
        emailNotifications:
          entity.settings.notificationSettings.emailNotifications,
        smsNotifications: entity.settings.notificationSettings.smsNotifications,
        pushNotifications:
          entity.settings.notificationSettings.pushNotifications,
      },
      securitySettings: {
        requireTwoFactor: entity.settings.securitySettings.requireTwoFactor,
        passwordPolicy: entity.settings.securitySettings.passwordPolicy,
        sessionTimeout: entity.settings.securitySettings.sessionTimeout,
      },
    };
    dto.limits = {
      maxUsers: entity.limits.maxUsers,
      maxDepartments: entity.limits.maxDepartments,
      maxRoles: entity.limits.maxRoles,
      maxProjects: entity.limits.maxProjects,
      storageLimit: entity.limits.storageLimit,
      apiRateLimit: entity.limits.apiRateLimit,
    };
    dto.metadata = {};
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  /**
   * @static
   * @method fromEntities
   * @description 从组织实体列表创建响应DTO列表
   * @param entities 组织实体列表
   * @returns {OrganizationResponseDto[]} 组织响应DTO列表
   */
  static fromEntities(entities: Organization[]): OrganizationResponseDto[] {
    return entities.map(entity => OrganizationResponseDto.fromEntity(entity));
  }
}
