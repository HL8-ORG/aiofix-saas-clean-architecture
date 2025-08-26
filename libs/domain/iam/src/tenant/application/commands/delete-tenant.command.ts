import { BaseCommand } from '@aiofix/domain-shared';

/**
 * @class DeleteTenantCommand
 * @description 删除租户命令，定义删除租户的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseCommand，获得命令的基础功能
 * 2. 包含删除租户所需的参数
 * 3. 作为CQRS模式中的写操作命令
 * 4. 支持租户的软删除和硬删除
 *
 * 功能与业务规则：
 * 1. 定义删除租户的业务操作
 * 2. 支持租户的软删除（标记为已删除）
 * 3. 支持租户的硬删除（物理删除）
 * 4. 包含删除原因和审计信息
 */
export class DeleteTenantCommand extends BaseCommand {
  /**
   * @property tenantId
   * @description 要删除的租户ID
   */
  readonly tenantId: string;

  /**
   * @property reason
   * @description 删除原因
   */
  readonly reason?: string;

  /**
   * @property force
   * @description 是否强制删除（硬删除）
   */
  readonly force: boolean;

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId 要删除的租户ID
   * @param reason 删除原因
   * @param force 是否强制删除
   * @param userId 执行命令的用户ID
   * @param commandTenantId 命令所属的租户ID
   */
  constructor(
    tenantId: string,
    reason?: string,
    force: boolean = false,
    userId?: string,
    commandTenantId?: string,
  ) {
    super(userId, commandTenantId);
    this.tenantId = tenantId;
    this.reason = reason;
    this.force = force;
  }
}
