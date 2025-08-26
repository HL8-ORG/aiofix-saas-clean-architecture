/**
 * @file index.ts
 * @description CQRS接口统一导出文件
 */

export { ICommandBus } from './command-bus.interface';
export { IQueryBus } from './query-bus.interface';
export { ICommandHandler } from './command-handler.interface';
export { IQueryHandler } from './query-handler.interface';
