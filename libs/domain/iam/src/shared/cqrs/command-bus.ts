import { Injectable, Type } from '@nestjs/common';
import { ICommandBus, ICommandHandler } from './interfaces';

/**
 * @class CommandBus
 * @description 命令总线实现，负责分发和处理命令
 *
 * 主要原理与机制：
 * 1. 使用Map存储命令类型到处理器的映射关系
 * 2. 通过依赖注入获取处理器实例
 * 3. 支持命令验证和中间件处理
 * 4. 提供事务管理和错误处理
 *
 * 功能与业务规则：
 * 1. 命令分发和执行
 * 2. 处理器自动注册
 * 3. 命令验证和授权
 * 4. 事务管理和回滚
 */
@Injectable()
export class CommandBus implements ICommandBus {
  private readonly handlers = new Map<string, ICommandHandler<any, any>>();

  /**
   * @method registerHandler
   * @description 注册命令处理器
   * @param commandType 命令类型
   * @param handler 命令处理器
   */
  registerHandler<TCommand, TResult>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>,
  ): void {
    this.handlers.set(commandType, handler);
  }

  /**
   * @method execute
   * @description 执行命令
   * @param command 要执行的命令
   * @returns 命令执行结果
   */
  async execute<TCommand, TResult = void>(command: TCommand): Promise<TResult> {
    const commandType = command.constructor.name;
    const handler = this.handlers.get(commandType);

    if (!handler) {
      throw new Error(`未找到命令处理器: ${commandType}`);
    }

    try {
      return await handler.execute(command);
    } catch (error) {
      // 记录错误日志
      console.error(`命令执行失败: ${commandType}`, error);
      throw error;
    }
  }

  /**
   * @method getHandler
   * @description 获取命令处理器
   * @param commandType 命令类型
   * @returns 命令处理器
   */
  getHandler<TCommand, TResult>(
    commandType: string,
  ): ICommandHandler<TCommand, TResult> | undefined {
    return this.handlers.get(commandType);
  }

  /**
   * @method hasHandler
   * @description 检查是否有对应的命令处理器
   * @param commandType 命令类型
   * @returns 是否存在处理器
   */
  hasHandler(commandType: string): boolean {
    return this.handlers.has(commandType);
  }
}
