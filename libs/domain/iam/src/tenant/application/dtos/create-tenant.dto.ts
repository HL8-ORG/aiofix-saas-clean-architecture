import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUrl,
} from 'class-validator';

/**
 * @class CreateTenantDto
 * @description 创建租户数据传输对象，定义创建租户所需的输入参数
 *
 * 主要原理与机制：
 * 1. 使用class-validator进行输入验证，确保数据完整性
 * 2. 使用@nestjs/swagger的ApiProperty装饰器生成API文档
 * 3. 作为应用层与表现层之间的数据传输契约
 * 4. 支持多租户SaaS平台的租户注册流程
 *
 * 功能与业务规则：
 * 1. 定义租户的基本信息字段
 * 2. 支持租户配置和限制设置
 * 3. 提供租户管理员信息
 * 4. 支持租户状态和类型管理
 */
export class CreateTenantDto {
  /**
   * @property name
   * @description 租户名称
   */
  @ApiProperty({
    description: '租户名称',
    example: 'Acme Corporation',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  /**
   * @property code
   * @description 租户代码，用于系统标识
   */
  @ApiProperty({
    description: '租户代码，用于系统标识',
    example: 'acme-corp',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  readonly code!: string;

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
  })
  @IsEmail()
  @IsNotEmpty()
  readonly adminEmail!: string;

  /**
   * @property adminName
   * @description 租户管理员姓名
   */
  @ApiProperty({
    description: '租户管理员姓名',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  readonly adminName!: string;

  /**
   * @property plan
   * @description 租户套餐类型
   */
  @ApiProperty({
    description: '租户套餐类型',
    example: 'premium',
    enum: ['basic', 'standard', 'premium', 'enterprise'],
  })
  @IsString()
  @IsNotEmpty()
  readonly plan!: string;

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
}
