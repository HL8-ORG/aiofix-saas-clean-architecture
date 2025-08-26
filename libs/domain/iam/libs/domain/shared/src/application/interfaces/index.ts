/**
 * @file index.ts
 * @description 应用层接口统一导出文件
 */

// 导出命令相关接口
export type { ICommand } from './command.interface';
export type { ICommandHandler } from './command-handler.interface';

// 导出查询相关接口
export type { IQuery } from './query.interface';
export type { IQueryHandler } from './query-handler.interface';

// 导出用例接口
export type { IUseCase } from './use-case.interface';
