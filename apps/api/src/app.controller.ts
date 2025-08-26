import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PinoLoggerService, LogContext } from '@aiofix/infrastructure-logging';
import { ConfigTestService } from './config-test.service';
import { DatabaseTestService } from './database-test.service';

/**
 * @class AppController
 * @description
 * 应用根控制器，提供基础的健康检查和系统信息API。
 *
 * 主要原理与机制如下：
 * 1. 使用@Controller装饰器定义控制器，处理HTTP请求。
 * 2. 通过依赖注入获取服务实例，实现业务逻辑。
 * 3. 使用@Get装饰器定义GET请求路由。
 *
 * 功能与业务规则：
 * 1. 提供系统健康检查接口
 * 2. 提供系统信息查询接口
 * 3. 提供欢迎信息接口
 * 4. 提供配置测试接口
 */
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: PinoLoggerService,
    private readonly configTestService: ConfigTestService,
    private readonly databaseTestService: DatabaseTestService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.info('访问根路径', LogContext.HTTP_REQUEST);
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    this.logger.info('健康检查请求', LogContext.HTTP_REQUEST);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('info')
  getInfo() {
    this.logger.info('系统信息查询', LogContext.HTTP_REQUEST);
    return {
      name: 'SAAS Platform API',
      description: '基于DDD和Clean Architecture的多租户SaaS平台',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      architecture: 'DDD + Clean Architecture + CQRS + Event Sourcing',
      framework: 'NestJS + TypeScript + Fastify',
    };
  }

  @Get('test-log')
  testLog() {
    this.logger.debug('调试日志测试', LogContext.SYSTEM, { test: 'debug' });
    this.logger.info('信息日志测试', LogContext.SYSTEM, { test: 'info' });
    this.logger.warn('警告日志测试', LogContext.SYSTEM, { test: 'warn' });
    this.logger.error(
      '错误日志测试',
      LogContext.SYSTEM,
      { test: 'error' },
      new Error('测试错误'),
    );

    return {
      message: '日志测试完成',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test-config')
  testConfig() {
    this.logger.info('配置测试请求', LogContext.SYSTEM);
    return this.configTestService.testConfig();
  }

  @Get('test-database')
  async testDatabase() {
    this.logger.info('数据库测试请求', LogContext.SYSTEM);
    return await this.databaseTestService.testConnection();
  }

  @Get('test-database-query')
  async testDatabaseQuery() {
    this.logger.info('数据库查询测试请求', LogContext.SYSTEM);
    return await this.databaseTestService.testQuery();
  }

  @Get('test-database-transaction')
  async testDatabaseTransaction() {
    this.logger.info('数据库事务测试请求', LogContext.SYSTEM);
    return await this.databaseTestService.testTransaction();
  }

  @Get('database-info')
  async getDatabaseInfo() {
    this.logger.info('数据库信息查询请求', LogContext.SYSTEM);
    return await this.databaseTestService.getDatabaseInfo();
  }
}
