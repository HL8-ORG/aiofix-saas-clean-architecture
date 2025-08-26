import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserUseCase } from './use-cases/get-user.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';
import { GetUsersUseCase } from './use-cases/get-users.use-case';

/**
 * @class UserApplicationModule
 * @description 用户应用层模块，提供用户相关的Use-Case
 *
 * 主要原理与机制：
 * 1. 使用NestJS模块系统组织应用层Use-Case
 * 2. 提供依赖注入容器，管理Use-Case
 * 3. 支持模块间的依赖关系管理
 * 4. 便于测试和维护
 *
 * 功能与业务规则：
 * 1. 提供用户相关的Use-Case
 * 2. 管理Use-Case的依赖注入
 * 3. 支持用户管理的完整功能
 * 4. 确保应用层组件的正确组织
 */
@Module({
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUsersUseCase,
  ],
  exports: [
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUsersUseCase,
  ],
})
export class UserApplicationModule {}
