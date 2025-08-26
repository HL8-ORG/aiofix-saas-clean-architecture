import { ICommand } from './command.interface';

/**
 * @interface ICommandHandler
 * @description 命令处理器接口，定义CQRS模式中命令处理器的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了命令处理器的统一接口规范，确保所有命令处理器都遵循相同的契约
 * 2. 命令处理器负责执行具体的业务逻辑，改变系统状态
 * 3. 采用泛型设计，支持不同类型的命令和结果
 * 4. 支持异步操作，符合现代应用开发的最佳实践
 *
 * 功能与业务规则：
 * 1. 提供统一的命令处理入口
 * 2. 支持命令的业务逻辑执行
 * 3. 支持命令的验证和错误处理
 * 4. 支持命令的审计和日志记录
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  /**
   * @method execute
   * @description 执行命令
   * @param command 命令对象
   * @returns 执行结果
   */
  execute(command: TCommand): Promise<TResult>;
}
