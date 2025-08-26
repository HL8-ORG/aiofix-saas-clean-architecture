/**
 * @file security-test.controller.ts
 * @description 安全测试控制器
 *
 * 该控制器提供安全模块的测试端点，包括：
 * - 密码服务测试
 * - JWT服务测试
 * - 安全配置测试
 *
 * 遵循DDD和Clean Architecture原则，提供RESTful API接口。
 */

import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SecurityTestService } from './security-test.service';

/**
 * @class SecurityTestController
 * @description 安全测试控制器
 *
 * 提供安全功能的测试API接口，包括：
 * - 密码加密测试
 * - JWT令牌测试
 * - 安全配置测试
 * - 综合测试
 */
@ApiTags('Security Tests')
@Controller('test-security')
export class SecurityTestController {
  constructor(private readonly securityTestService: SecurityTestService) {}

  /**
   * @method testPassword
   * @description 测试密码服务
   * @returns {Promise<any>} 密码测试结果
   */
  @Get('password')
  @ApiOperation({
    summary: '测试密码服务',
    description: '测试密码哈希、验证、复杂度检查和生成功能',
  })
  @ApiResponse({
    status: 200,
    description: '密码测试成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              testName: { type: 'string' },
              success: { type: 'boolean' },
              result: { type: 'object' },
              duration: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async testPassword(): Promise<any> {
    const results = await this.securityTestService.testPasswordService();
    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount === totalCount,
      message: `密码服务测试完成，${successCount}/${totalCount} 项测试通过`,
      timestamp: new Date().toISOString(),
      results,
    };
  }

  /**
   * @method testJwt
   * @description 测试JWT服务
   * @returns {Promise<any>} JWT测试结果
   */
  @Get('jwt')
  @ApiOperation({
    summary: '测试JWT服务',
    description: '测试JWT令牌生成、验证、刷新和撤销功能',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT测试成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              testName: { type: 'string' },
              success: { type: 'boolean' },
              result: { type: 'object' },
              duration: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async testJwt(): Promise<any> {
    const results = await this.securityTestService.testJwtService();
    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount === totalCount,
      message: `JWT服务测试完成，${successCount}/${totalCount} 项测试通过`,
      timestamp: new Date().toISOString(),
      results,
    };
  }

  /**
   * @method testConfig
   * @description 测试安全配置
   * @returns {any} 配置测试结果
   */
  @Get('config')
  @ApiOperation({
    summary: '测试安全配置',
    description: '测试密码和JWT配置的加载和验证',
  })
  @ApiResponse({
    status: 200,
    description: '配置测试成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              testName: { type: 'string' },
              success: { type: 'boolean' },
              result: { type: 'object' },
              duration: { type: 'number' },
            },
          },
        },
      },
    },
  })
  testConfig(): any {
    const results = this.securityTestService.testSecurityConfig();
    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount === totalCount,
      message: `安全配置测试完成，${successCount}/${totalCount} 项测试通过`,
      timestamp: new Date().toISOString(),
      results,
    };
  }

  /**
   * @method testAll
   * @description 运行所有安全测试
   * @returns {Promise<any>} 所有测试结果
   */
  @Get()
  @ApiOperation({
    summary: '运行所有安全测试',
    description: '运行密码服务、JWT服务和配置的完整测试套件',
  })
  @ApiResponse({
    status: 200,
    description: '所有测试成功',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalTests: { type: 'number' },
            successCount: { type: 'number' },
            failureCount: { type: 'number' },
            successRate: { type: 'string' },
            totalDuration: { type: 'number' },
          },
        },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              testName: { type: 'string' },
              success: { type: 'boolean' },
              result: { type: 'object' },
              duration: { type: 'number' },
            },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  async testAll(): Promise<any> {
    return await this.securityTestService.runAllTests();
  }

  /**
   * @method testPasswordValidation
   * @description 测试密码验证
   * @param body 请求体
   * @returns {any} 验证结果
   */
  @Post('validate-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试密码验证',
    description: '验证密码是否符合复杂度要求',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          description: '要验证的密码',
          example: 'TestPassword123!',
        },
      },
      required: ['password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '密码验证成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        result: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean' },
            errors: { type: 'array', items: { type: 'string' } },
            warnings: { type: 'array', items: { type: 'string' } },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  testPasswordValidation(@Body() body: { password: string }): any {
    const validation = this.securityTestService['passwordService'].validate(
      body.password,
    );

    return {
      success: validation.isValid,
      message: validation.isValid ? '密码验证通过' : '密码验证失败',
      result: validation,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * @method generatePassword
   * @description 生成随机密码
   * @param body 请求体
   * @returns {any} 生成的密码
   */
  @Post('generate-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '生成随机密码',
    description: '根据指定参数生成安全的随机密码',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        length: {
          type: 'number',
          description: '密码长度',
          example: 16,
          default: 16,
        },
        includeUppercase: {
          type: 'boolean',
          description: '是否包含大写字母',
          example: true,
          default: true,
        },
        includeLowercase: {
          type: 'boolean',
          description: '是否包含小写字母',
          example: true,
          default: true,
        },
        includeNumbers: {
          type: 'boolean',
          description: '是否包含数字',
          example: true,
          default: true,
        },
        includeSymbols: {
          type: 'boolean',
          description: '是否包含特殊字符',
          example: true,
          default: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '密码生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        result: {
          type: 'object',
          properties: {
            password: { type: 'string' },
            length: { type: 'number' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  generatePassword(
    @Body()
    body: {
      length?: number;
      includeUppercase?: boolean;
      includeLowercase?: boolean;
      includeNumbers?: boolean;
      includeSymbols?: boolean;
    },
  ): any {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
    } = body;

    const password = this.securityTestService['passwordService'].generate(
      length,
      {
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
      },
    );

    return {
      success: true,
      message: '密码生成成功',
      result: {
        password,
        length: password.length,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
