/**
 * @interface ICommand
 * @description 命令接口，定义CQRS模式中命令的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了命令的统一接口规范，确保所有命令都遵循相同的契约
 * 2. 命令代表系统中的写操作，用于改变系统状态
 * 3. 每个命令都有唯一的标识符和时间戳
 * 4. 支持用户和租户上下文信息，用于审计和权限控制
 *
 * 功能与业务规则：
 * 1. 提供统一的命令执行入口
 * 2. 支持命令的审计追踪
 * 3. 支持多租户数据隔离
 * 4. 支持命令的幂等性处理
 */
export interface ICommand {
  /**
   * @property commandId
   * @description 命令唯一标识符
   */
  readonly commandId: string;

  /**
   * @property timestamp
   * @description 命令创建时间戳
   */
  readonly timestamp: Date;

  /**
   * @property userId
   * @description 执行命令的用户ID
   */
  readonly userId?: string;

  /**
   * @property tenantId
   * @description 命令所属的租户ID
   */
  readonly tenantId?: string;
}
