import { ApiProperty } from '@nestjs/swagger';
import {
  Department,
  DepartmentStatus,
  DepartmentType,
} from '../../domain/entities/department.entity';

/**
 * @class DepartmentContactResponseDto
 * @description 部门联系信息响应DTO
 */
export class DepartmentContactResponseDto {
  @ApiProperty({ description: '邮箱' })
  email!: string;

  @ApiProperty({ description: '电话' })
  phone!: string;

  @ApiProperty({ description: '地址' })
  address!: string;

  @ApiProperty({ description: '办公室' })
  office!: string;

  @ApiProperty({ description: '联系人' })
  contactPerson!: string;

  @ApiProperty({ description: '联系电话' })
  contactPhone!: string;
}

/**
 * @class DepartmentSettingsResponseDto
 * @description 部门设置响应DTO
 */
export class DepartmentSettingsResponseDto {
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

  @ApiProperty({ description: '工作流设置' })
  workflowSettings!: {
    requireApprovalForLeave: boolean;
    requireApprovalForExpense: boolean;
    requireApprovalForProject: boolean;
  };
}

/**
 * @class DepartmentLimitsResponseDto
 * @description 部门限制响应DTO
 */
export class DepartmentLimitsResponseDto {
  @ApiProperty({ description: '最大成员数' })
  maxMembers!: number;

  @ApiProperty({ description: '最大子部门数' })
  maxSubDepartments!: number;

  @ApiProperty({ description: '最大项目数' })
  maxProjects!: number;

  @ApiProperty({ description: '预算限制' })
  budgetLimit!: number;

  @ApiProperty({ description: '存储限制（GB）' })
  storageLimit!: number;

  @ApiProperty({ description: 'API速率限制' })
  apiRateLimit!: number;
}

/**
 * @class DepartmentStatisticsResponseDto
 * @description 部门统计信息响应DTO
 */
export class DepartmentStatisticsResponseDto {
  @ApiProperty({ description: '成员数量' })
  memberCount!: number;

  @ApiProperty({ description: '子部门数量' })
  subDepartmentCount!: number;

  @ApiProperty({ description: '项目数量' })
  projectCount!: number;

  @ApiProperty({ description: '存储使用量（GB）' })
  storageUsed!: number;

  @ApiProperty({ description: 'API调用次数' })
  apiCallCount!: number;

  @ApiProperty({ description: '预算使用率' })
  budgetUsage!: number;
}

/**
 * @class DepartmentResponseDto
 * @description 部门响应DTO
 */
export class DepartmentResponseDto {
  @ApiProperty({ description: '部门ID' })
  id!: string;

  @ApiProperty({ description: '部门代码' })
  code!: string;

  @ApiProperty({ description: '部门名称' })
  name!: string;

  @ApiProperty({ description: '部门描述' })
  description?: string;

  @ApiProperty({ description: '部门状态' })
  status!: DepartmentStatus;

  @ApiProperty({ description: '部门类型' })
  type!: DepartmentType;

  @ApiProperty({ description: '组织ID' })
  organizationId!: string;

  @ApiProperty({ description: '父部门ID' })
  parentId?: string;

  @ApiProperty({ description: '子部门ID列表' })
  children!: string[];

  @ApiProperty({ description: '部门负责人ID' })
  managerId?: string;

  @ApiProperty({ description: '成员ID列表' })
  members!: string[];

  @ApiProperty({ description: '联系信息' })
  contact!: DepartmentContactResponseDto;

  @ApiProperty({ description: '部门设置' })
  settings!: DepartmentSettingsResponseDto;

  @ApiProperty({ description: '部门限制' })
  limits!: DepartmentLimitsResponseDto;

  @ApiProperty({ description: '统计信息' })
  statistics?: DepartmentStatisticsResponseDto;

  @ApiProperty({ description: '元数据' })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: '创建时间' })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt!: Date;

  static fromEntity(entity: Department): DepartmentResponseDto {
    const dto = new DepartmentResponseDto();
    dto.id = entity.id.value;
    dto.code = entity.code.value;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.status = entity.status;
    dto.type = entity.type;
    dto.organizationId = entity.organizationId.value;
    dto.parentId = entity.parentId?.value;
    dto.children = entity.children.map(id => id.value);
    dto.managerId = entity.managerId?.value;
    dto.members = entity.members.map(id => id.value);
    dto.contact = {
      email: entity.contact.email || '',
      phone: entity.contact.phone || '',
      address: entity.contact.address || '',
      office: entity.contact.office || '',
      contactPerson: entity.contact.contactPerson || '',
      contactPhone: entity.contact.contactPhone || '',
    };
    dto.settings = {
      allowUserRegistration: entity.settings.allowUserRegistration,
      requireApproval: entity.settings.requireApproval,
      autoAssignRoles: entity.settings.autoAssignRoles,
      dataIsolationLevel: entity.settings.dataIsolationLevel,
      notificationSettings: entity.settings.notificationSettings,
      workflowSettings: entity.settings.workflowSettings,
    };
    dto.limits = {
      maxMembers: entity.limits.maxMembers,
      maxSubDepartments: entity.limits.maxSubDepartments,
      maxProjects: entity.limits.maxProjects,
      budgetLimit: entity.limits.budgetLimit,
      storageLimit: entity.limits.storageLimit,
      apiRateLimit: entity.limits.apiRateLimit,
    };
    dto.metadata = {};
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntities(entities: Department[]): DepartmentResponseDto[] {
    return entities.map(entity => DepartmentResponseDto.fromEntity(entity));
  }
}
