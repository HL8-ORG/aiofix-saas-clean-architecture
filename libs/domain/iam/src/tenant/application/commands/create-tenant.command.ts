import { BaseCommand } from '@aiofix/domain-shared';
import { CreateTenantDto } from '../dtos/create-tenant.dto';

/**
 * @class CreateTenantCommand
 * @description 创建租户命令，定义创建租户的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseCommand，获得命令的基础功能
 * 2. 包含创建租户所需的所有参数
 * 3. 作为CQRS模式中的写操作命令
 * 4. 支持租户注册和初始化流程
 *
 * 功能与业务规则：
 * 1. 定义创建租户的业务操作
 * 2. 包含租户的基本信息
 * 3. 包含租户管理员信息
 * 4. 支持租户配置和套餐设置
 */
export class CreateTenantCommand extends BaseCommand {
  /**
   * @property name
   * @description 租户名称
   */
  readonly name: string;

  /**
   * @property code
   * @description 租户代码
   */
  readonly code: string;

  /**
   * @property description
   * @description 租户描述
   */
  readonly description?: string;

  /**
   * @property domain
   * @description 租户域名
   */
  readonly domain?: string;

  /**
   * @property adminEmail
   * @description 租户管理员邮箱
   */
  readonly adminEmail: string;

  /**
   * @property adminName
   * @description 租户管理员姓名
   */
  readonly adminName: string;

  /**
   * @property plan
   * @description 租户套餐类型
   */
  readonly plan: string;

  /**
   * @property settings
   * @description 租户配置设置
   */
  readonly settings?: Record<string, unknown>;

  /**
   * @constructor
   * @description 构造函数
   * @param dto 创建租户DTO
   * @param userId 执行命令的用户ID
   * @param tenantId 命令所属的租户ID
   */
  constructor(dto: CreateTenantDto, userId?: string, tenantId?: string) {
    super(userId, tenantId);
    this.name = dto.name;
    this.code = dto.code;
    this.description = dto.description;
    this.domain = dto.domain;
    this.adminEmail = dto.adminEmail;
    this.adminName = dto.adminName;
    this.plan = dto.plan;
    this.settings = dto.settings;
  }
}
