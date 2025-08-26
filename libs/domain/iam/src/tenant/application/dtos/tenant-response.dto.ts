import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../domain/entities/tenant.entity';

/**
 * @class TenantResponseDto
 * @description 租户响应数据传输对象，定义租户信息的输出格式
 *
 * 主要原理与机制：
 * 1. 使用@nestjs/swagger的ApiProperty装饰器生成API文档
 * 2. 提供fromEntity静态方法，将领域实体转换为DTO
 * 3. 作为应用层与表现层之间的数据传输契约
 * 4. 支持租户信息的标准化输出格式
 *
 * 功能与业务规则：
 * 1. 定义租户的基本信息输出字段
 * 2. 支持租户状态和配置信息展示
 * 3. 提供租户统计信息
 * 4. 支持租户关联数据展示
 */
export class TenantResponseDto {
  /**
   * @property id
   * @description 租户唯一标识符
   */
  @ApiProperty({
    description: '租户唯一标识符',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  public readonly id!: string;

  /**
   * @property name
   * @description 租户名称
   */
  @ApiProperty({
    description: '租户名称',
    example: 'Acme Corporation',
  })
  public readonly name!: string;

  /**
   * @property code
   * @description 租户代码
   */
  @ApiProperty({
    description: '租户代码',
    example: 'acme-corp',
  })
  public readonly code!: string;

  /**
   * @property description
   * @description 租户描述
   */
  @ApiProperty({
    description: '租户描述',
    example: 'Acme Corporation是一家领先的科技公司',
    required: false,
  })
  public readonly description?: string;

  /**
   * @property domain
   * @description 租户域名
   */
  @ApiProperty({
    description: '租户域名',
    example: 'acme.com',
    required: false,
  })
  public readonly domain?: string;

  /**
   * @property status
   * @description 租户状态
   */
  @ApiProperty({
    description: '租户状态',
    example: 'active',
    enum: ['pending', 'active', 'suspended', 'cancelled'],
  })
  public readonly status!: string;

  /**
   * @property plan
   * @description 租户套餐类型
   */
  @ApiProperty({
    description: '租户套餐类型',
    example: 'premium',
    enum: ['basic', 'standard', 'premium', 'enterprise'],
  })
  public readonly plan!: string;

  /**
   * @property settings
   * @description 租户配置设置
   */
  @ApiProperty({
    description: '租户配置设置',
    example: {
      maxUsers: 100,
      maxStorage: '10GB',
      features: ['sso', 'audit', 'api'],
    },
  })
  public readonly settings!: Record<string, unknown>;

  /**
   * @property adminEmail
   * @description 租户管理员邮箱
   */
  @ApiProperty({
    description: '租户管理员邮箱',
    example: 'admin@acme.com',
  })
  public readonly adminEmail!: string;

  /**
   * @property adminName
   * @description 租户管理员姓名
   */
  @ApiProperty({
    description: '租户管理员姓名',
    example: 'John Doe',
  })
  public readonly adminName!: string;

  /**
   * @property createdAt
   * @description 创建时间
   */
  @ApiProperty({
    description: '创建时间',
    example: '2024-12-01T10:00:00.000Z',
  })
  public readonly createdAt!: Date;

  /**
   * @property updatedAt
   * @description 更新时间
   */
  @ApiProperty({
    description: '更新时间',
    example: '2024-12-01T10:00:00.000Z',
  })
  public readonly updatedAt!: Date;

  /**
   * @property statistics
   * @description 租户统计信息
   */
  @ApiProperty({
    description: '租户统计信息',
    example: {
      totalUsers: 50,
      totalOrganizations: 3,
      totalDepartments: 10,
      activeUsers: 45,
    },
    required: false,
  })
  public statistics?: {
    totalUsers: number;
    totalOrganizations: number;
    totalDepartments: number;
    activeUsers: number;
  };

  /**
   * @method fromEntity
   * @description 从领域实体创建响应DTO
   * @param entity 租户实体
   * @returns 租户响应DTO
   */
  static fromEntity(entity: Tenant): TenantResponseDto {
    return Object.assign(new TenantResponseDto(), {
      id: entity.id.value,
      name: entity.name,
      code: entity.code.value,
      description: entity.description,
      domain: undefined, // 租户实体中没有domain字段
      status: entity.status,
      plan: 'basic', // 租户实体中没有plan字段，使用默认值
      settings: entity.settings,
      adminEmail: entity.contactEmail || '',
      adminName: '', // 租户实体中没有adminName字段
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      statistics: undefined, // 租户实体中没有statistics字段
    });
  }

  /**
   * @method fromEntities
   * @description 从领域实体数组创建响应DTO数组
   * @param entities 租户实体数组
   * @returns 租户响应DTO数组
   */
  static fromEntities(entities: Tenant[]): TenantResponseDto[] {
    return entities.map(entity => TenantResponseDto.fromEntity(entity));
  }
}
