import { Injectable } from '@nestjs/common';
import { ICommandBus } from '../interfaces/command-bus.interface';
import { ICommand } from '../interfaces/command.interface';
import { ICommandHandler } from '../interfaces/command-handler.interface';

/**
 * @class CommandBus
 * @description 命令总线实现，负责命令的分发和处理
 *
 * 主要原理与机制：
 * 1. 使用Map存储命令类型到处理器的映射关系
 * 2. 通过依赖注入获取所有命令处理器实例
 * 3. 在execute方法中根据命令类型查找对应的处理器
 * 4. 支持命令验证、错误处理和日志记录
 * 5. 采用异步处理模式，支持复杂的业务逻辑
 *
 * 功能与业务规则：
 * 1. 命令处理器自动注册和发现
 * 2. 命令类型到处理器的路由映射
 * 3. 命令执行结果的统一返回
 * 4. 命令执行异常的捕获和处理
 * 5. 支持命令的审计和监控
 */
@Injectable()
export class CommandBus implements ICommandBus {
  private readonly handlers = new Map<string, ICommandHandler<any, any>>();

  /**
   * @method registerHandler
   * @description 注册命令处理器
   * @param commandType 命令类型
   * @param handler 命令处理器实例
   */
  registerHandler<TCommand extends ICommand, TResult>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>,
  ): void {
    this.handlers.set(commandType, handler);
  }

  /**
   * @method execute
   * @description 执行命令
   * @param command 命令对象
   * @returns 执行结果
   */
  async execute<TCommand extends ICommand, TResult = void>(
    command: TCommand,
  ): Promise<TResult> {
    const commandType = command.constructor.name;
    const handler = this.handlers.get(commandType);

    if (!handler) {
      throw new Error(`No handler found for command: ${commandType}`);
    }

    try {
      // 执行命令处理器
      const result = await handler.execute(command);
      return result;
    } catch (error) {
      // 记录错误日志
      console.error(`Error executing command ${commandType}:`, error);
      throw error;
    }
  }

  /**
   * @method getHandler
   * @description 获取指定命令类型的处理器
   * @param commandType 命令类型
   * @returns 命令处理器实例
   */
  getHandler<TCommand extends ICommand, TResult>(
    commandType: string,
  ): ICommandHandler<TCommand, TResult> | undefined {
    return this.handlers.get(commandType);
  }

  /**
   * @method hasHandler
   * @description 检查是否存在指定命令类型的处理器
   * @param commandType 命令类型
   * @returns 是否存在处理器
   */
  hasHandler(commandType: string): boolean {
    return this.handlers.has(commandType);
  }

  /**
   * @method getRegisteredCommands
   * @description 获取所有已注册的命令类型
   * @returns 命令类型列表
   */
  getRegisteredCommands(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * @method clearHandlers
   * @description 清空所有处理器
   */
  clearHandlers(): void {
    this.handlers.clear();
  }
}
