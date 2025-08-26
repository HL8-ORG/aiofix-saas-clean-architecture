import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

/**
 * @class GetTenantsDto
 * @description 获取租户列表数据传输对象，定义查询租户列表的参数
 *
 * 主要原理与机制：
 * 1. 使用class-validator进行输入验证，确保数据完整性
 * 2. 使用@nestjs/swagger的ApiProperty装饰器生成API文档
 * 3. 支持分页、过滤、排序等查询参数
 * 4. 作为应用层与表现层之间的数据传输契约
 *
 * 功能与业务规则：
 * 1. 支持分页查询，限制每页数量
 * 2. 支持按状态、套餐类型等条件过滤
 * 3. 支持按名称、代码等字段搜索
 * 4. 支持按创建时间、更新时间等字段排序
 */
export class GetTenantsDto {
  /**
   * @property page
   * @description 页码，从1开始
   */
  @ApiProperty({
    description: '页码，从1开始',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  /**
   * @property limit
   * @description 每页数量
   */
  @ApiProperty({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly limit?: number = 10;

  /**
   * @property status
   * @description 租户状态过滤
   */
  @ApiProperty({
    description: '租户状态过滤',
    example: 'active',
    enum: ['pending', 'active', 'suspended', 'cancelled'],
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly status?: string;

  /**
   * @property plan
   * @description 租户套餐类型过滤
   */
  @ApiProperty({
    description: '租户套餐类型过滤',
    example: 'premium',
    enum: ['basic', 'standard', 'premium', 'enterprise'],
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly plan?: string;

  /**
   * @property search
   * @description 搜索关键词，支持名称和代码模糊搜索
   */
  @ApiProperty({
    description: '搜索关键词，支持名称和代码模糊搜索',
    example: 'acme',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly search?: string;

  /**
   * @property sortBy
   * @description 排序字段
   */
  @ApiProperty({
    description: '排序字段',
    example: 'createdAt',
    enum: ['name', 'code', 'status', 'plan', 'createdAt', 'updatedAt'],
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly sortBy?: string = 'createdAt';

  /**
   * @property sortOrder
   * @description 排序方向
   */
  @ApiProperty({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly sortOrder?: 'ASC' | 'DESC' = 'DESC';

  /**
   * @property includeStatistics
   * @description 是否包含统计信息
   */
  @ApiProperty({
    description: '是否包含统计信息',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  readonly includeStatistics?: boolean = false;
}
