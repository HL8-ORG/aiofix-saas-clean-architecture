import { Module } from '@nestjs/common';
import { UserApplicationModule } from './application/user.module';
import { UserPresentationModule } from './presentation/user-presentation.module';

/**
 * @class UserModule
 * @description 用户模块，整合用户的所有层次组件
 *
 * 主要原理与机制：
 * 1. 使用NestJS模块系统组织用户各层组件
 * 2. 导入应用层和展现层模块
 * 3. 提供完整的用户管理功能
 * 4. 支持模块的独立开发和测试
 *
 * 功能与业务规则：
 * 1. 整合用户相关的所有层次组件
 * 2. 提供用户管理的完整功能
 * 3. 支持用户业务操作的完整流程
 * 4. 确保模块的独立性和可维护性
 */
@Module({
  imports: [UserApplicationModule, UserPresentationModule],
  exports: [UserApplicationModule, UserPresentationModule],
})
export class UserModule {}
