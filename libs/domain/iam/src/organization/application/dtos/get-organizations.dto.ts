import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import {
  OrganizationStatus,
  OrganizationType,
} from '../../domain/entities/organization.entity';

/**
 * @class GetOrganizationsDto
 * @description 获取组织列表查询DTO
 */
export class GetOrganizationsDto {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: '租户ID', required: false })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ description: '父组织ID', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: '组织状态',
    enum: OrganizationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @ApiProperty({
    description: '组织类型',
    enum: OrganizationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @ApiProperty({ description: '管理员ID', required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({
    description: '是否包含统计信息',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeStatistics?: boolean = false;

  @ApiProperty({
    description: '是否包含子组织',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeChildren?: boolean = false;

  @ApiProperty({ description: '是否包含成员', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  includeMembers?: boolean = false;

  @ApiProperty({
    description: '排序字段',
    default: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: '排序方向', default: 'desc', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
