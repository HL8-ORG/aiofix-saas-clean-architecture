import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { OrganizationType } from '../../domain/entities/organization.entity';

/**
 * @interface OrganizationContactDto
 * @description 组织联系信息DTO
 */
export class OrganizationContactDto {
  @ApiProperty({ description: '邮箱地址', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '电话号码', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '地址', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: '网站', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: '联系人', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}

/**
 * @interface OrganizationSettingsDto
 * @description 组织设置DTO
 */
export class OrganizationSettingsDto {
  @ApiProperty({ description: '允许用户注册', default: true })
  @IsOptional()
  @IsBoolean()
  allowUserRegistration?: boolean;

  @ApiProperty({ description: '需要审批', default: false })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @ApiProperty({ description: '自动分配角色', default: false })
  @IsOptional()
  @IsBoolean()
  autoAssignRoles?: boolean;

  @ApiProperty({ description: '数据隔离级别', default: 'organization' })
  @IsOptional()
  @IsString()
  dataIsolationLevel?: string;

  @ApiProperty({ description: '通知设置', required: false })
  @IsOptional()
  @IsObject()
  notificationSettings?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
  };

  @ApiProperty({ description: '安全设置', required: false })
  @IsOptional()
  @IsObject()
  securitySettings?: {
    requireTwoFactor?: boolean;
    passwordPolicy?: string;
    sessionTimeout?: number;
  };
}

/**
 * @interface OrganizationLimitsDto
 * @description 组织限制DTO
 */
export class OrganizationLimitsDto {
  @ApiProperty({ description: '最大用户数', default: 1000 })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @ApiProperty({ description: '最大部门数', default: 100 })
  @IsOptional()
  @IsNumber()
  maxDepartments?: number;

  @ApiProperty({ description: '最大角色数', default: 50 })
  @IsOptional()
  @IsNumber()
  maxRoles?: number;

  @ApiProperty({ description: '最大项目数', default: 100 })
  @IsOptional()
  @IsNumber()
  maxProjects?: number;

  @ApiProperty({ description: '存储限制（GB）', default: 100 })
  @IsOptional()
  @IsNumber()
  storageLimit?: number;

  @ApiProperty({ description: 'API速率限制', default: 1000 })
  @IsOptional()
  @IsNumber()
  apiRateLimit?: number;
}

/**
 * @class CreateOrganizationDto
 * @description 创建组织DTO
 */
export class CreateOrganizationDto {
  @ApiProperty({ description: '组织代码', example: 'ORG001' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: '组织名称', example: '技术部' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '组织描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '组织类型',
    enum: OrganizationType,
    default: OrganizationType.DEPARTMENT,
  })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @ApiProperty({ description: '租户ID' })
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ description: '父组织ID', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: '管理员ID', required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({ description: '联系信息', required: false })
  @IsOptional()
  @IsObject()
  contact?: OrganizationContactDto;

  @ApiProperty({ description: '组织设置', required: false })
  @IsOptional()
  @IsObject()
  settings?: OrganizationSettingsDto;

  @ApiProperty({ description: '组织限制', required: false })
  @IsOptional()
  @IsObject()
  limits?: OrganizationLimitsDto;

  @ApiProperty({ description: '元数据', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
