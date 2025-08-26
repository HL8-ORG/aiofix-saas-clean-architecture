import { Module } from '@nestjs/common';
import { CqrsModule } from '@aiofix/domain-shared';

// 导入Use-Cases
import {
  CreateTenantUseCase,
  UpdateTenantUseCase,
  DeleteTenantUseCase,
  GetTenantUseCase,
  GetTenantsUseCase,
} from './use-cases';

// 导入命令处理器
import {
  CreateTenantHandler,
  UpdateTenantHandler,
  DeleteTenantHandler,
} from './commands/handlers';

// 导入查询处理器
import { GetTenantHandler, GetTenantsHandler } from './queries/handlers';

// 导入事件处理器
import { TenantCreatedEventHandler } from './events/handlers/tenant-created.handler';

/**
 * @class TenantApplicationModule
 * @description 租户应用层模块，配置租户相关的所有服务和处理器
 *
 * 主要原理与机制：
 * 1. 使用NestJS模块系统组织租户应用层组件
 * 2. 集成CQRS模块，提供命令和查询总线
 * 3. 注册所有Use-Case、命令处理器、查询处理器和事件处理器
 * 4. 提供依赖注入和生命周期管理
 *
 * 功能与业务规则：
 * 1. 提供租户管理的完整应用层功能
 * 2. 支持CQRS模式的命令查询分离
 * 3. 支持事件驱动的业务逻辑
 * 4. 提供统一的模块导出接口
 */
@Module({
  imports: [
    CqrsModule, // 导入CQRS模块
  ],
  providers: [
    // Use-Cases
    CreateTenantUseCase,
    UpdateTenantUseCase,
    DeleteTenantUseCase,
    GetTenantUseCase,
    GetTenantsUseCase,

    // Command Handlers
    CreateTenantHandler,
    UpdateTenantHandler,
    DeleteTenantHandler,

    // Query Handlers
    GetTenantHandler,
    GetTenantsHandler,

    // Event Handlers
    TenantCreatedEventHandler,
  ],
  exports: [
    // 导出Use-Cases供其他模块使用
    CreateTenantUseCase,
    UpdateTenantUseCase,
    DeleteTenantUseCase,
    GetTenantUseCase,
    GetTenantsUseCase,
  ],
})
export class TenantApplicationModule {}
