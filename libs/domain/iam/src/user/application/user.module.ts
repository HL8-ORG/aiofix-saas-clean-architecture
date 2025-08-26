import { Module } from '@nestjs/common';
import { CqrsModule } from '@aiofix/domain-shared';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserUseCase } from './use-cases/get-user.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';
import { GetUsersUseCase } from './use-cases/get-users.use-case';

// 导入命令处理器
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { UpdateUserHandler } from './commands/handlers/update-user.handler';
import { DeleteUserHandler } from './commands/handlers/delete-user.handler';

// 导入查询处理器
import { GetUserHandler } from './queries/handlers/get-user.handler';
import { GetUsersHandler } from './queries/handlers/get-users.handler';

/**
 * @class UserApplicationModule
 * @description 用户应用层模块，提供用户相关的Use-Case和CQRS处理器
 *
 * 主要原理与机制：
 * 1. 使用NestJS模块系统组织应用层Use-Case
 * 2. 集成CQRS模块，提供命令和查询总线
 * 3. 自动注册命令和查询处理器
 * 4. 提供依赖注入容器，管理所有组件
 *
 * 功能与业务规则：
 * 1. 提供用户相关的Use-Case
 * 2. 提供用户相关的命令和查询处理器
 * 3. 支持用户管理的完整CQRS功能
 * 4. 确保应用层组件的正确组织和注册
 */
@Module({
  imports: [CqrsModule],
  providers: [
    // Use-Case
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUsersUseCase,
    
    // 命令处理器
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    
    // 查询处理器
    GetUserHandler,
    GetUsersHandler,
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
