import { BaseCommand } from '@aiofix/domain-shared';
import { UpdateTenantDto } from '../dtos/update-tenant.dto';

/**
 * @class UpdateTenantCommand
 * @description 更新租户命令，定义更新租户的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseCommand，获得命令的基础功能
 * 2. 包含更新租户所需的所有参数
 * 3. 作为CQRS模式中的写操作命令
 * 4. 支持租户信息的部分更新
 *
 * 功能与业务规则：
 * 1. 定义更新租户的业务操作
 * 2. 支持租户基本信息的部分更新
 * 3. 支持租户配置和限制的修改
 * 4. 支持租户状态和套餐的变更
 */
export class UpdateTenantCommand extends BaseCommand {
  /**
   * @property tenantId
   * @description 要更新的租户ID
   */
  readonly tenantId: string;

  /**
   * @property name
   * @description 租户名称
   */
  readonly name?: string;

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
  readonly adminEmail?: string;

  /**
   * @property adminName
   * @description 租户管理员姓名
   */
  readonly adminName?: string;

  /**
   * @property plan
   * @description 租户套餐类型
   */
  readonly plan?: string;

  /**
   * @property settings
   * @description 租户配置设置
   */
  readonly settings?: Record<string, unknown>;

  /**
   * @property status
   * @description 租户状态
   */
  readonly status?: string;

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId 要更新的租户ID
   * @param dto 更新租户DTO
   * @param userId 执行命令的用户ID
   * @param commandTenantId 命令所属的租户ID
   */
  constructor(
    tenantId: string,
    dto: UpdateTenantDto,
    userId?: string,
    commandTenantId?: string,
  ) {
    super(userId, commandTenantId);
    this.tenantId = tenantId;
    this.name = dto.name;
    this.description = dto.description;
    this.domain = dto.domain;
    this.adminEmail = dto.adminEmail;
    this.adminName = dto.adminName;
    this.plan = dto.plan;
    this.settings = dto.settings;
    this.status = dto.status;
  }
}
