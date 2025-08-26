import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { UserStatus } from '../../domain/entities/user.entity';

/**
 * @enum SortOrder
 * @description 排序顺序枚举
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * @class GetUsersDto
 * @description 获取用户列表DTO，定义查询用户列表的参数
 *
 * 主要原理与机制：
 * 1. 定义了查询用户列表的输入参数结构
 * 2. 使用class-validator进行参数验证
 * 3. 使用Swagger装饰器生成API文档
 * 4. 支持分页、排序、过滤等功能
 *
 * 功能与业务规则：
 * 1. 验证查询参数的有效性
 * 2. 支持分页查询
 * 3. 支持排序和过滤
 * 4. 支持按组织、部门、状态等条件查询
 */
export class GetUsersDto {
  /**
   * @property page
   * @description 页码
   */
  @ApiProperty({ description: '页码', example: 1, required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  readonly page?: number = 1;

  /**
   * @property limit
   * @description 每页数量
   */
  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  readonly limit?: number = 10;

  /**
   * @property search
   * @description 搜索关键词
   */
  @ApiProperty({ description: '搜索关键词', example: 'john', required: false })
  @IsString()
  @IsOptional()
  readonly search?: string;

  /**
   * @property status
   * @description 用户状态过滤
   */
  @ApiProperty({ description: '用户状态', enum: UserStatus, required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  readonly status?: UserStatus;

  /**
   * @property organizationId
   * @description 组织ID过滤
   */
  @ApiProperty({
    description: '组织ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly organizationId?: string;

  /**
   * @property departmentId
   * @description 部门ID过滤
   */
  @ApiProperty({
    description: '部门ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly departmentId?: string;

  /**
   * @property roleId
   * @description 角色ID过滤
   */
  @ApiProperty({
    description: '角色ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly roleId?: string;

  /**
   * @property sortBy
   * @description 排序字段
   */
  @ApiProperty({
    description: '排序字段',
    example: 'createdAt',
    required: false,
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  readonly sortBy?: string = 'createdAt';

  /**
   * @property sortOrder
   * @description 排序顺序
   */
  @ApiProperty({
    description: '排序顺序',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  readonly sortOrder?: SortOrder = SortOrder.DESC;
}
