// CQRS模块导出
export { CqrsModule } from './cqrs.module';
export { CommandBus } from './command-bus';
export { QueryBus } from './query-bus';
export { HandlerRegistryService } from './handler-registry.service';

// 接口导出
export type { ICommandBus } from '../interfaces/command-bus.interface';
export type { IQueryBus } from '../interfaces/query-bus.interface';
export type { ICommand } from '../interfaces/command.interface';
export type { IQuery } from '../interfaces/query.interface';
export type { ICommandHandler } from '../interfaces/command-handler.interface';
export type { IQueryHandler } from '../interfaces/query-handler.interface';
