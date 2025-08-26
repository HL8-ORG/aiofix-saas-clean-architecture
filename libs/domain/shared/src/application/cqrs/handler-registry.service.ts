import { Injectable } from '@nestjs/common';
import { CommandBus } from './command-bus';
import { QueryBus } from './query-bus';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { IQueryHandler } from '../interfaces/query-handler.interface';
import { ICommand } from '../interfaces/command.interface';
import { IQuery } from '../interfaces/query.interface';

/**
 * @class HandlerRegistryService
 * @description 处理器注册服务，负责手动注册命令/查询处理器
 *
 * 主要原理与机制：
 * 1. 提供手动注册命令和查询处理器的方法
 * 2. 支持处理器的生命周期管理
 * 3. 提供处理器注册状态的监控
 *
 * 功能与业务规则：
 * 1. 手动注册命令处理器到CommandBus
 * 2. 手动注册查询处理器到QueryBus
 * 3. 支持处理器的依赖注入和生命周期管理
 * 4. 提供处理器注册状态的监控
 */
@Injectable()
export class HandlerRegistryService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * @method registerCommandHandler
   * @description 注册命令处理器
   * @param commandType 命令类型
   * @param handler 命令处理器实例
   */
  registerCommandHandler<TCommand extends ICommand, TResult>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>,
  ): void {
    this.commandBus.registerHandler(commandType, handler);
    console.log(`Registered command handler: ${commandType}`);
  }

  /**
   * @method registerQueryHandler
   * @description 注册查询处理器
   * @param queryType 查询类型
   * @param handler 查询处理器实例
   */
  registerQueryHandler<TQuery extends IQuery<TResult>, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    this.queryBus.registerHandler(queryType, handler);
    console.log(`Registered query handler: ${queryType}`);
  }

  /**
   * @method getRegisteredCommandHandlers
   * @description 获取所有已注册的命令处理器
   * @returns 命令处理器列表
   */
  getRegisteredCommandHandlers(): string[] {
    return this.commandBus.getRegisteredCommands();
  }

  /**
   * @method getRegisteredQueryHandlers
   * @description 获取所有已注册的查询处理器
   * @returns 查询处理器列表
   */
  getRegisteredQueryHandlers(): string[] {
    return this.queryBus.getRegisteredQueries();
  }

  /**
   * @method clearAllHandlers
   * @description 清空所有处理器
   */
  clearAllHandlers(): void {
    this.commandBus.clearHandlers();
    this.queryBus.clearHandlers();
  }
}
