import { BaseCommand } from '@aiofix/domain-shared';

/**
 * @class DeleteUserCommand
 * @description 删除用户命令，定义删除用户的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseCommand，获得命令的基础功能
 * 2. 包含删除用户所需的参数
 * 3. 作为CQRS模式中的写操作命令
 * 4. 支持用户和租户上下文信息
 *
 * 功能与业务规则：
 * 1. 定义删除用户的业务操作
 * 2. 支持软删除和硬删除
 * 3. 包含删除原因和备注
 * 4. 支持批量删除操作
 */
export class DeleteUserCommand extends BaseCommand {
  /**
   * @property userId
   * @description 要删除的用户ID
   */
  readonly userId: string;

  /**
   * @property hardDelete
   * @description 是否硬删除
   */
  readonly hardDelete: boolean;

  /**
   * @property reason
   * @description 删除原因
   */
  readonly reason?: string;

  /**
   * @property remark
   * @description 删除备注
   */
  readonly remark?: string;

  /**
   * @constructor
   * @description 构造函数
   * @param userId 要删除的用户ID
   * @param hardDelete 是否硬删除
   * @param reason 删除原因
   * @param remark 删除备注
   * @param commandUserId 执行命令的用户ID
   * @param tenantId 命令所属的租户ID
   */
  constructor(
    userId: string,
    hardDelete: boolean = false,
    reason?: string,
    remark?: string,
    commandUserId?: string,
    tenantId?: string,
  ) {
    super(commandUserId, tenantId);
    this.userId = userId;
    this.hardDelete = hardDelete;
    this.reason = reason;
    this.remark = remark;
  }
}
