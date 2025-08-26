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
import { DepartmentType } from '../../domain/entities/department.entity';

/**
 * @class DepartmentContactDto
 * @description 部门联系信息DTO
 */
export class DepartmentContactDto {
  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '电话', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '地址', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: '办公室', required: false })
  @IsOptional()
  @IsString()
  office?: string;

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
 * @class DepartmentSettingsDto
 * @description 部门设置DTO
 */
export class DepartmentSettingsDto {
  @ApiProperty({ description: '允许用户注册', required: false })
  @IsOptional()
  @IsBoolean()
  allowUserRegistration?: boolean;

  @ApiProperty({ description: '需要审批', required: false })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @ApiProperty({ description: '自动分配角色', required: false })
  @IsOptional()
  @IsBoolean()
  autoAssignRoles?: boolean;

  @ApiProperty({ description: '数据隔离级别', required: false })
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

  @ApiProperty({ description: '工作流设置', required: false })
  @IsOptional()
  @IsObject()
  workflowSettings?: {
    requireApprovalForLeave?: boolean;
    requireApprovalForExpense?: boolean;
    requireApprovalForProject?: boolean;
  };
}

/**
 * @class DepartmentLimitsDto
 * @description 部门限制DTO
 */
export class DepartmentLimitsDto {
  @ApiProperty({ description: '最大成员数', required: false })
  @IsOptional()
  @IsNumber()
  maxMembers?: number;

  @ApiProperty({ description: '最大子部门数', required: false })
  @IsOptional()
  @IsNumber()
  maxSubDepartments?: number;

  @ApiProperty({ description: '最大项目数', required: false })
  @IsOptional()
  @IsNumber()
  maxProjects?: number;

  @ApiProperty({ description: '预算限制', required: false })
  @IsOptional()
  @IsNumber()
  budgetLimit?: number;

  @ApiProperty({ description: '存储限制（GB）', required: false })
  @IsOptional()
  @IsNumber()
  storageLimit?: number;

  @ApiProperty({ description: 'API速率限制', required: false })
  @IsOptional()
  @IsNumber()
  apiRateLimit?: number;
}

/**
 * @class CreateDepartmentDto
 * @description 创建部门DTO
 *
 * 主要功能：
 * 1. 定义创建部门所需的输入数据
 * 2. 提供数据验证规则
 * 3. 支持嵌套DTO结构
 * 4. 生成API文档
 */
export class CreateDepartmentDto {
  @ApiProperty({ description: '部门代码', example: 'DEPT001' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: '部门名称', example: '技术部' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '部门描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '部门类型',
    enum: DepartmentType,
    default: DepartmentType.FUNCTIONAL,
  })
  @IsOptional()
  @IsEnum(DepartmentType)
  type?: DepartmentType;

  @ApiProperty({ description: '组织ID' })
  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;

  @ApiProperty({ description: '父部门ID', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: '部门负责人ID', required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({ description: '联系信息', required: false })
  @IsOptional()
  @IsObject()
  contact?: DepartmentContactDto;

  @ApiProperty({ description: '部门设置', required: false })
  @IsOptional()
  @IsObject()
  settings?: DepartmentSettingsDto;

  @ApiProperty({ description: '部门限制', required: false })
  @IsOptional()
  @IsObject()
  limits?: DepartmentLimitsDto;

  @ApiProperty({ description: '元数据', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
