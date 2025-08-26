import { Module } from '@nestjs/common';
import { CqrsModule } from '@aiofix/domain-shared';
import {
  CreateOrganizationUseCase,
  UpdateOrganizationUseCase,
  DeleteOrganizationUseCase,
  GetOrganizationUseCase,
  GetOrganizationsUseCase,
} from './use-cases';
import {
  CreateOrganizationHandler,
  UpdateOrganizationHandler,
  DeleteOrganizationHandler,
} from './commands/handlers';
import {
  GetOrganizationHandler,
  GetOrganizationsHandler,
} from './queries/handlers';

/**
 * @class OrganizationApplicationModule
 * @description 组织应用层模块
 *
 * 主要原理与机制：
 * 1. 使用NestJS模块系统组织应用层组件
 * 2. 导入CQRS模块提供命令和查询总线
 * 3. 注册所有Use-Case、命令处理器、查询处理器
 * 4. 提供依赖注入和组件管理
 *
 * 功能与业务规则：
 * 1. 组织应用层组件
 * 2. 提供依赖注入容器
 * 3. 导出Use-Case供表现层使用
 * 4. 管理组件生命周期
 */
@Module({
  imports: [CqrsModule],
  providers: [
    // Use-Cases
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    DeleteOrganizationUseCase,
    GetOrganizationUseCase,
    GetOrganizationsUseCase,
    // Command Handlers
    CreateOrganizationHandler,
    UpdateOrganizationHandler,
    DeleteOrganizationHandler,
    // Query Handlers
    GetOrganizationHandler,
    GetOrganizationsHandler,
  ],
  exports: [
    // 导出Use-Case供表现层使用
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    DeleteOrganizationUseCase,
    GetOrganizationUseCase,
    GetOrganizationsUseCase,
  ],
})
export class OrganizationApplicationModule {}
