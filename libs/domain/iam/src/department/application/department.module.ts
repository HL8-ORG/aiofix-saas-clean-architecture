/**
 * @file department.module.ts
 * @description 部门应用层模块
 *
 * 该文件定义了部门应用层的NestJS模块，负责配置依赖注入和模块导出。
 * 该模块整合了部门管理的所有应用层组件，包括命令处理器、查询处理器和用例。
 *
 * 主要功能：
 * 1. 配置部门应用层组件的依赖注入
 * 2. 注册命令和查询处理器
 * 3. 注册用例服务
 * 4. 导出部门应用层接口
 * 5. 提供模块间的依赖关系管理
 *
 * 业务规则：
 * 1. 所有组件必须正确注册到依赖注入容器
 * 2. 模块必须导出必要的服务供其他模块使用
 * 3. 遵循NestJS模块设计规范
 * 4. 确保组件间的依赖关系正确
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@aiofix/domain-shared';

// 导入命令处理器
import {
  CreateDepartmentHandler,
  UpdateDepartmentHandler,
  DeleteDepartmentHandler,
} from './commands/handlers';

// 导入查询处理器
import {
  GetDepartmentHandler,
  GetDepartmentsHandler,
} from './queries/handlers';

// 导入用例
import {
  CreateDepartmentUseCase,
  UpdateDepartmentUseCase,
  DeleteDepartmentUseCase,
  GetDepartmentUseCase,
  GetDepartmentsUseCase,
} from './use-cases';

/**
 * @class DepartmentModule
 * @description 部门应用层模块
 */
@Module({
  imports: [
    // 导入CQRS模块，提供命令和查询总线
    CqrsModule,
  ],
  providers: [
    // 注册命令处理器
    CreateDepartmentHandler,
    UpdateDepartmentHandler,
    DeleteDepartmentHandler,

    // 注册查询处理器
    GetDepartmentHandler,
    GetDepartmentsHandler,

    // 注册用例
    CreateDepartmentUseCase,
    UpdateDepartmentUseCase,
    DeleteDepartmentUseCase,
    GetDepartmentUseCase,
    GetDepartmentsUseCase,
  ],
  exports: [
    // 导出用例，供其他模块使用
    CreateDepartmentUseCase,
    UpdateDepartmentUseCase,
    DeleteDepartmentUseCase,
    GetDepartmentUseCase,
    GetDepartmentsUseCase,
  ],
})
export class DepartmentModule {}
