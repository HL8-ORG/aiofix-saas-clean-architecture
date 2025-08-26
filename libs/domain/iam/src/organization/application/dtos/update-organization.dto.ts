import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
} from 'class-validator';
import { OrganizationType } from '../../domain/entities/organization.entity';
import {
  OrganizationContactDto,
  OrganizationSettingsDto,
  OrganizationLimitsDto,
} from './create-organization.dto';

/**
 * @class UpdateOrganizationDto
 * @description 更新组织DTO
 */
export class UpdateOrganizationDto {
  @ApiProperty({ description: '组织名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '组织描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '组织类型',
    enum: OrganizationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

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
