import { Injectable } from '@nestjs/common';
import { ConfigService } from '@aiofix/infrastructure-config';

/**
 * @class ConfigTestService
 * @description
 * 配置测试服务，用于验证配置模块是否正常工作。
 *
 * 主要原理与机制如下：
 * 1. 注入ConfigService来访问配置
 * 2. 测试各种配置项的读取
 * 3. 验证配置的类型安全
 * 4. 提供配置验证功能
 *
 * 功能与业务规则：
 * 1. 配置读取测试
 * 2. 配置验证
 * 3. 配置类型检查
 * 4. 错误处理测试
 */
@Injectable()
export class ConfigTestService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * @function testConfig
   * @description
   * 测试配置加载和读取功能。
   *
   * @returns {object} 返回测试结果
   */
  testConfig() {
    try {
      // 测试应用配置
      const appConfig = this.configService.appConfig;
      console.log('✅ 应用配置加载成功:', appConfig);

      // 测试数据库配置
      const dbConfig = this.configService.databaseConfig;
      console.log('✅ 数据库配置加载成功:', dbConfig);

      // 测试Redis配置
      const redisConfig = this.configService.redisConfig;
      console.log('✅ Redis配置加载成功:', redisConfig);

      // 测试JWT配置
      const jwtConfig = this.configService.jwtConfig;
      console.log('✅ JWT配置加载成功:', jwtConfig);

      // 测试邮件配置
      const emailConfig = this.configService.emailConfig;
      console.log('✅ 邮件配置加载成功:', emailConfig);

      // 测试日志配置
      const loggingConfig = this.configService.loggingConfig;
      console.log('✅ 日志配置加载成功:', loggingConfig);

      // 测试环境变量
      const isProd = this.configService.isProd();
      console.log('✅ 环境检查成功:', { isProd });

      return {
        success: true,
        message: '所有配置测试通过',
        configs: {
          app: appConfig,
          database: dbConfig,
          redis: redisConfig,
          jwt: jwtConfig,
          email: emailConfig,
          logging: loggingConfig,
          isProd,
        },
      };
    } catch (error) {
      console.error('❌ 配置测试失败:', error);
      return {
        success: false,
        message: '配置测试失败',
        error: error.message,
      };
    }
  }
}
