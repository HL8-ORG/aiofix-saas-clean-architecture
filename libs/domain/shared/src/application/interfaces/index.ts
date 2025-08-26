/**
 * @file index.ts
 * @description 应用层接口统一导出文件
 *
 * 主要原理与机制：
 * 1. 统一导出所有应用层接口，提供便捷的导入方式
 * 2. 遵循模块化设计原则，避免循环依赖
 * 3. 支持按需导入和批量导入两种方式
 *
 * 功能与业务规则：
 * 1. 提供统一的接口访问入口
 * 2. 支持接口的版本管理
 * 3. 支持接口的文档生成
 */

// 导出命令相关接口
export type { ICommand } from './command.interface';
export type { ICommandHandler } from './command-handler.interface';
export type { ICommandBus } from './command-bus.interface';

// 导出查询相关接口
export type { IQuery } from './query.interface';
export type { IQueryHandler } from './query-handler.interface';
export type { IQueryBus } from './query-bus.interface';

// 导出用例接口
export type { IUseCase } from './use-case.interface';

// 导出事件处理器接口
export type { IEventHandler } from './event-handler.interface';
