import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
} from 'class-validator';
import { DepartmentType } from '../../domain/entities/department.entity';
import {
  DepartmentContactDto,
  DepartmentSettingsDto,
  DepartmentLimitsDto,
} from './create-department.dto';

/**
 * @class UpdateDepartmentDto
 * @description 更新部门DTO
 *
 * 主要功能：
 * 1. 定义更新部门所需的输入数据
 * 2. 提供数据验证规则
 * 3. 支持部分更新
 * 4. 生成API文档
 */
export class UpdateDepartmentDto {
  @ApiProperty({ description: '部门名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '部门描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '部门类型',
    enum: DepartmentType,
    required: false,
  })
  @IsOptional()
  @IsEnum(DepartmentType)
  type?: DepartmentType;

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
