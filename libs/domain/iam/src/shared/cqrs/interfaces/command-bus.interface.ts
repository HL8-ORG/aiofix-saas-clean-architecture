/**
 * @interface ICommandBus
 * @description 命令总线接口，负责分发和处理命令
 *
 * 主要原理与机制：
 * 1. 作为CQRS模式的核心组件，负责命令的分发和执行
 * 2. 提供统一的命令处理入口，支持命令验证和中间件
 * 3. 支持事务管理和错误处理
 * 4. 与事件总线集成，支持事件发布
 *
 * 功能与业务规则：
 * 1. 命令分发和执行
 * 2. 命令验证和授权
 * 3. 事务管理
 * 4. 错误处理和回滚
 */
export interface ICommandBus {
  /**
   * @method execute
   * @description 执行命令
   * @param command 要执行的命令
   * @returns 命令执行结果
   */
  execute<TCommand, TResult = void>(command: TCommand): Promise<TResult>;
}
