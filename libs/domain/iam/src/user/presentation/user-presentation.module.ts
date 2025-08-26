import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserApplicationModule } from '../application/user.module';

/**
 * @class UserPresentationModule
 * @description 用户展现层模块，提供用户相关的HTTP接口
 *
 * 主要原理与机制：
 * 1. 使用NestJS模块系统组织展现层组件
 * 2. 导入应用层模块，获取Use-Case依赖
 * 3. 提供控制器和HTTP接口
 * 4. 支持依赖注入和模块组织
 *
 * 功能与业务规则：
 * 1. 提供用户相关的HTTP接口
 * 2. 管理控制器的依赖注入
 * 3. 支持RESTful API接口
 * 4. 确保展现层组件的正确组织
 */
@Module({
  imports: [UserApplicationModule],
  controllers: [UserController],
  exports: [UserController],
})
export class UserPresentationModule {}
