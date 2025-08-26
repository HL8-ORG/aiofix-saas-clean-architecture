/**
 * @interface ICommand
 * @description 命令接口，定义CQRS模式中命令的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了命令的统一接口规范，确保所有命令都遵循相同的契约
 * 2. 命令代表一个意图，用于改变系统状态
 * 3. 命令是不可变的，一旦创建就不能修改
 * 4. 命令包含执行所需的所有数据
 *
 * 功能与业务规则：
 * 1. 提供统一的命令标识
 * 2. 支持命令的元数据管理
 * 3. 支持命令的版本控制
 * 4. 支持命令的审计和追踪
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
   * @property correlationId
   * @description 关联ID，用于追踪业务流程
   */
  readonly correlationId?: string;

  /**
   * @property causationId
   * @description 因果ID，用于追踪事件链
   */
  readonly causationId?: string;
}
