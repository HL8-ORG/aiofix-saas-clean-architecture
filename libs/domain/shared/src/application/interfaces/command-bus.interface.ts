import { ICommand } from './command.interface';

/**
 * @interface ICommandBus
 * @description 命令总线接口，定义CQRS模式中命令总线的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了命令总线的统一接口规范，确保所有命令总线都遵循相同的契约
 * 2. 命令总线负责分发命令到对应的命令处理器
 * 3. 采用泛型设计，支持不同类型的命令和结果
 * 4. 支持异步操作，符合现代应用开发的最佳实践
 *
 * 功能与业务规则：
 * 1. 提供统一的命令分发入口
 * 2. 支持命令的路由和分发
 * 3. 支持命令的验证和错误处理
 * 4. 支持命令的审计和日志记录
 */
export interface ICommandBus {
  /**
   * @method execute
   * @description 执行命令
   * @param command 命令对象
   * @returns 执行结果
   */
  execute<TCommand extends ICommand, TResult = void>(
    command: TCommand,
  ): Promise<TResult>;
}
