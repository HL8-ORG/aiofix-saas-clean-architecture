/**
 * @file security-test.service.ts
 * @description 安全测试服务
 *
 * 该服务用于测试安全模块的功能，包括：
 * - JWT令牌生成和验证
 * - 密码加密和验证
 * - 安全配置测试
 *
 * 遵循DDD和Clean Architecture原则，提供安全功能的测试接口。
 */

import { Injectable } from '@nestjs/common';
import { PasswordService } from '@aiofix/infrastructure-security';
import { JwtService } from '@aiofix/infrastructure-security';
import { PinoLoggerService, LogContext } from '@aiofix/infrastructure-logging';

/**
 * @interface SecurityTestResult
 * @description 安全测试结果接口
 */
export interface SecurityTestResult {
  /** 测试名称 */
  testName: string;
  /** 是否成功 */
  success: boolean;
  /** 测试结果 */
  result: any;
  /** 错误信息 */
  error?: string;
  /** 执行时间 */
  duration: number;
}

/**
 * @class SecurityTestService
 * @description 安全测试服务
 *
 * 提供安全功能的测试接口，包括：
 * - 密码加密测试
 * - JWT令牌测试
 * - 安全配置测试
 * - 性能测试
 */
@Injectable()
export class SecurityTestService {
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger;
  }

  /**
   * @method testPasswordService
   * @description 测试密码服务
   * @returns {Promise<SecurityTestResult[]>} 测试结果
   */
  async testPasswordService(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // 测试密码哈希
    const hashStart = Date.now();
    try {
      const password = 'TestPassword123!';
      const hash = await this.passwordService.hash(password);

      results.push({
        testName: 'Password Hashing',
        success: true,
        result: { hash: hash.substring(0, 20) + '...' },
        duration: Date.now() - hashStart,
      });

      // 测试密码验证
      const compareStart = Date.now();
      const isMatch = await this.passwordService.compare(password, hash);

      results.push({
        testName: 'Password Comparison',
        success: isMatch,
        result: { isMatch },
        duration: Date.now() - compareStart,
      });

      // 测试密码复杂度验证
      const validateStart = Date.now();
      const validation = this.passwordService.validate(password);

      results.push({
        testName: 'Password Validation',
        success: validation.isValid,
        result: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        duration: Date.now() - validateStart,
      });

      // 测试密码生成
      const generateStart = Date.now();
      const generatedPassword = this.passwordService.generate(16);

      results.push({
        testName: 'Password Generation',
        success: generatedPassword.length === 16,
        result: {
          length: generatedPassword.length,
          password: generatedPassword.substring(0, 8) + '...',
        },
        duration: Date.now() - generateStart,
      });
    } catch (error) {
      results.push({
        testName: 'Password Service',
        success: false,
        result: {},
        error: (error as Error).message,
        duration: Date.now() - hashStart,
      });
    }

    return results;
  }

  /**
   * @method testJwtService
   * @description 测试JWT服务
   * @returns {Promise<SecurityTestResult[]>} 测试结果
   */
  async testJwtService(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // 测试JWT令牌生成
    const generateStart = Date.now();
    try {
      const payload = {
        sub: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read'],
        tenantId: 'test-tenant',
      };

      const tokenResult = this.jwtService.generateToken(payload);

      results.push({
        testName: 'JWT Token Generation',
        success: true,
        result: {
          accessToken: tokenResult.accessToken.substring(0, 20) + '...',
          refreshToken: tokenResult.refreshToken.substring(0, 20) + '...',
          expiresIn: tokenResult.expiresIn,
        },
        duration: Date.now() - generateStart,
      });

      // 测试JWT令牌验证
      const verifyStart = Date.now();
      const verifyResult = this.jwtService.verifyToken(tokenResult.accessToken);

      results.push({
        testName: 'JWT Token Verification',
        success: verifyResult.isValid,
        result: {
          isValid: verifyResult.isValid,
          payload: verifyResult.payload
            ? {
                sub: verifyResult.payload.sub,
                username: verifyResult.payload.username,
              }
            : null,
        },
        duration: Date.now() - verifyStart,
      });

      // 测试JWT令牌刷新
      const refreshStart = Date.now();
      const refreshResult = this.jwtService.refreshToken(
        tokenResult.refreshToken,
      );

      results.push({
        testName: 'JWT Token Refresh',
        success: true,
        result: {
          accessToken: refreshResult.accessToken.substring(0, 20) + '...',
          refreshToken: refreshResult.refreshToken.substring(0, 20) + '...',
        },
        duration: Date.now() - refreshStart,
      });

      // 测试JWT令牌撤销
      const revokeStart = Date.now();
      const revokeResult = this.jwtService.revokeToken(tokenResult.accessToken);

      results.push({
        testName: 'JWT Token Revocation',
        success: revokeResult,
        result: { revoked: revokeResult },
        duration: Date.now() - revokeStart,
      });
    } catch (error) {
      results.push({
        testName: 'JWT Service',
        success: false,
        result: {},
        error: (error as Error).message,
        duration: Date.now() - generateStart,
      });
    }

    return results;
  }

  /**
   * @method testSecurityConfig
   * @description 测试安全配置
   * @returns {SecurityTestResult[]>} 测试结果
   */
  testSecurityConfig(): SecurityTestResult[] {
    const results: SecurityTestResult[] = [];

    // 测试密码配置
    const passwordConfigStart = Date.now();
    try {
      const passwordConfig = this.passwordService.getConfig();

      results.push({
        testName: 'Password Configuration',
        success: true,
        result: {
          saltRounds: passwordConfig.saltRounds,
          minLength: passwordConfig.minLength,
          maxLength: passwordConfig.maxLength,
          complexity: passwordConfig.complexity,
        },
        duration: Date.now() - passwordConfigStart,
      });

      // 测试JWT配置
      const jwtConfigStart = Date.now();
      const jwtConfig = this.jwtService.getConfig();

      results.push({
        testName: 'JWT Configuration',
        success: true,
        result: {
          expiresIn: jwtConfig.expiresIn,
          refreshExpiresIn: jwtConfig.refreshExpiresIn,
          enabled: jwtConfig.enabled,
        },
        duration: Date.now() - jwtConfigStart,
      });
    } catch (error) {
      results.push({
        testName: 'Security Configuration',
        success: false,
        result: {},
        error: (error as Error).message,
        duration: Date.now() - passwordConfigStart,
      });
    }

    return results;
  }

  /**
   * @method runAllTests
   * @description 运行所有安全测试
   * @returns {Promise<any>} 所有测试结果
   */
  async runAllTests(): Promise<any> {
    this.logger.info('Starting security tests', LogContext.BUSINESS);

    const startTime = Date.now();

    const passwordResults = await this.testPasswordService();
    const jwtResults = await this.testJwtService();
    const configResults = this.testSecurityConfig();

    const allResults = [...passwordResults, ...jwtResults, ...configResults];
    const totalDuration = Date.now() - startTime;
    const successCount = allResults.filter((r) => r.success).length;
    const totalCount = allResults.length;

    this.logger.info('Security tests completed', LogContext.BUSINESS, {
      totalTests: totalCount,
      successCount,
      failureCount: totalCount - successCount,
      totalDuration,
    });

    return {
      summary: {
        totalTests: totalCount,
        successCount,
        failureCount: totalCount - successCount,
        successRate: ((successCount / totalCount) * 100).toFixed(2) + '%',
        totalDuration,
      },
      results: allResults,
      timestamp: new Date().toISOString(),
    };
  }
}
