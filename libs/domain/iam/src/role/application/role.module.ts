import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
} from './commands/handlers';
import { GetRoleHandler, GetRolesHandler } from './queries/handlers';
import {
  CreateRoleUseCase,
  UpdateRoleUseCase,
  DeleteRoleUseCase,
  GetRoleUseCase,
  GetRolesUseCase,
} from './use-cases';

/**
 * @class RoleModule
 * @description
 * 角色应用层模块，负责配置角色相关的所有应用层组件。
 *
 * 主要原理与机制如下：
 * 1. 使用NestJS模块系统组织角色应用层组件
 * 2. 导入CqrsModule以支持CQRS模式
 * 3. 注册所有命令处理器和查询处理器
 * 4. 注册所有用例服务
 * 5. 提供角色应用层的完整功能
 *
 * 功能与业务规则：
 * 1. 角色创建、更新、删除的完整业务流程
 * 2. 角色查询和列表查询功能
 * 3. 命令和查询的处理器注册
 * 4. 用例服务的依赖注入配置
 * 5. 模块的导出和导入管理
 */
@Module({
  imports: [CqrsModule],
  providers: [
    // 命令处理器
    CreateRoleHandler,
    UpdateRoleHandler,
    DeleteRoleHandler,

    // 查询处理器
    GetRoleHandler,
    GetRolesHandler,

    // 用例服务
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    GetRoleUseCase,
    GetRolesUseCase,
  ],
  exports: [
    // 导出用例服务供其他模块使用
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    GetRoleUseCase,
    GetRolesUseCase,
  ],
})
export class RoleModule {}
