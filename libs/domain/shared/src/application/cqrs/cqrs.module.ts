import { Module } from '@nestjs/common';
import { CommandBus } from './command-bus';
import { QueryBus } from './query-bus';
import { HandlerRegistryService } from './handler-registry.service';
import { ICommandBus } from '../interfaces/command-bus.interface';
import { IQueryBus } from '../interfaces/query-bus.interface';

/**
 * @module CqrsModule
 * @description CQRS模块，提供命令查询责任分离模式的完整实现
 *
 * 主要原理与机制：
 * 1. 提供CommandBus和QueryBus的依赖注入配置
 * 2. 使用接口绑定，支持依赖注入的灵活性
 * 3. 支持模块的导入和导出，便于其他模块使用
 * 4. 提供统一的CQRS架构入口
 * 5. 自动发现和注册命令/查询处理器
 *
 * 功能与业务规则：
 * 1. 命令总线的注册和配置
 * 2. 查询总线的注册和配置
 * 3. 支持多模块的CQRS架构
 * 4. 提供统一的接口绑定
 * 5. 自动处理器发现和注册
 */
@Module({
  providers: [CommandBus, QueryBus, HandlerRegistryService],
  exports: [CommandBus, QueryBus, HandlerRegistryService],
})
export class CqrsModule {}
