import { ConfigModule as AiofixConfigModule } from '@aiofix/infrastructure-config';
import { DatabaseModule } from '@aiofix/infrastructure-database';
import { SecurityModule } from '@aiofix/infrastructure-security';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigTestService } from './config-test.service';
import { DatabaseTestService } from './database-test.service';
import { SecurityTestService } from './security-test.service';
import { SecurityTestController } from './security-test.controller';

/**
 * @class AppModule
 * @description
 * 应用的根模块，负责组织和配置整个应用的所有模块。
 *
 * 主要原理与机制如下：
 * 1. 使用@Module装饰器定义模块，通过imports导入其他模块，
 *    通过controllers和providers注册控制器和服务。
 * 2. 集成AiofixConfigModule提供自定义配置管理
 * 3. 保留ConfigModule用于环境变量加载
 * 4. 模块化的设计使得应用具有良好的可维护性和可扩展性。
 *
 * 功能与业务规则：
 * 1. 配置全局模块
 * 2. 注册根控制器和服务
 * 3. 导入共享模块
 * 4. 配置环境变量
 * 5. 集成自定义配置管理
 */
@Module({
  imports: [
    // Aiofix配置模块 - 加载环境变量和自定义配置
    AiofixConfigModule,
    // 基础配置模块 - 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // 数据库模块
    (DatabaseModule as { forRoot(): any }).forRoot(),
    // 安全模块
    (SecurityModule as { forRoot(): any }).forRoot(),
    // 共享模块
    // SharedModule,
    // IAM模块
    // IamModule,
    // TODO: 导入其他模块
    // NotificationModule,
    // WorkflowModule,
    // AnalyticsModule,
    // ImageManagementModule,
    // DocumentManagementModule,
    // CacheManagementModule,
    // SecurityComplianceModule,
    // MonitoringOperationsModule,
    // ApiIntegrationModule,
    // LlmManagementModule,
  ],
  controllers: [AppController, SecurityTestController],
  providers: [
    AppService,
    ConfigTestService,
    DatabaseTestService,
    SecurityTestService,
  ],
})
export class AppModule {}
