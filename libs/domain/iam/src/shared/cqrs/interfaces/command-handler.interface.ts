/**
 * @interface ICommandHandler
 * @description 命令处理器接口，定义命令处理器的标准接口
 *
 * 主要原理与机制：
 * 1. 定义命令处理器的标准接口，确保处理器的一致性
 * 2. 支持泛型类型，提供类型安全的命令处理
 * 3. 与命令总线集成，实现命令的自动分发
 * 4. 支持事务管理和错误处理
 *
 * 功能与业务规则：
 * 1. 命令验证和处理
 * 2. 业务逻辑执行
 * 3. 事件发布
 * 4. 结果返回
 */
export interface ICommandHandler<TCommand, TResult = void> {
  /**
   * @method execute
   * @description 执行命令处理
   * @param command 要处理的命令
   * @returns 处理结果
   */
  execute(command: TCommand): Promise<TResult>;
}
