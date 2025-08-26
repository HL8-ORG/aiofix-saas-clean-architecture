import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsUrl } from 'class-validator';

/**
 * @class UpdateTenantDto
 * @description 更新租户数据传输对象，定义更新租户所需的输入参数
 *
 * 主要原理与机制：
 * 1. 使用class-validator进行输入验证，确保数据完整性
 * 2. 使用@nestjs/swagger的ApiProperty装饰器生成API文档
 * 3. 所有字段都是可选的，支持部分更新
 * 4. 作为应用层与表现层之间的数据传输契约
 *
 * 功能与业务规则：
 * 1. 支持租户基本信息的部分更新
 * 2. 支持租户配置和限制的修改
 * 3. 支持租户管理员信息的更新
 * 4. 支持租户状态和套餐的变更
 */
export class UpdateTenantDto {
  /**
   * @property name
   * @description 租户名称
   */
  @ApiProperty({
    description: '租户名称',
    example: 'Acme Corporation',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name?: string;

  /**
   * @property description
   * @description 租户描述
   */
  @ApiProperty({
    description: '租户描述',
    example: 'Acme Corporation是一家领先的科技公司',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  /**
   * @property domain
   * @description 租户域名
   */
  @ApiProperty({
    description: '租户域名',
    example: 'acme.com',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  readonly domain?: string;

  /**
   * @property adminEmail
   * @description 租户管理员邮箱
   */
  @ApiProperty({
    description: '租户管理员邮箱',
    example: 'admin@acme.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  readonly adminEmail?: string;

  /**
   * @property adminName
   * @description 租户管理员姓名
   */
  @ApiProperty({
    description: '租户管理员姓名',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly adminName?: string;

  /**
   * @property plan
   * @description 租户套餐类型
   */
  @ApiProperty({
    description: '租户套餐类型',
    example: 'premium',
    enum: ['basic', 'standard', 'premium', 'enterprise'],
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly plan?: string;

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
    required: false,
  })
  @IsOptional()
  readonly settings?: Record<string, unknown>;

  /**
   * @property status
   * @description 租户状态
   */
  @ApiProperty({
    description: '租户状态',
    example: 'active',
    enum: ['pending', 'active', 'suspended', 'cancelled'],
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly status?: string;
}
