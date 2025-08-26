/**
 * @file index.ts
 * @description 共享领域层入口文件
 *
 * 该文件是共享领域层的主要入口点，提供：
 * - 基础实体
 * - 共享值对象
 * - 领域事件
 * - 仓储接口
 *
 * 遵循DDD和Clean Architecture原则，提供统一的领域抽象。
 */

// 导出基础实体
export * from './domain/entities/base-entity';

// 导出共享值对象
export * from './domain/value-objects/uuid.vo';
export * from './domain/value-objects/email.vo';

// 导出领域事件
export * from './domain/events/base-event';

// 导出仓储接口
export * from './domain/repositories/base-repository.interface';

// 导出事件处理器
export * from './domain/event-handlers';

// 导出事件总线
export * from './application/events';

// 导出应用层接口
export * from './application/interfaces';

// 导出应用层基础类
export * from './application/base/base-command';
export * from './application/base/base-query';

// 导出CQRS模块
export * from './application/cqrs';
