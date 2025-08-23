import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * @class AppController
 * @description
 * 应用的根控制器，提供基础的API接口和健康检查功能。
 * 
 * 主要原理与机制如下：
 * 1. 使用@Controller装饰器定义控制器，指定路由前缀。
 * 2. 通过依赖注入获取AppService实例，实现业务逻辑的分离。
 * 3. 使用@Get装饰器定义GET请求路由，返回相应的数据。
 * 
 * 功能与业务规则：
 * 1. 提供应用健康检查接口
 * 2. 返回应用基本信息
 * 3. 提供API版本信息
 */
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    /**
     * @function getHello
     * @description 获取应用欢迎信息
     * @returns {string} 欢迎信息
     */
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    /**
     * @function getHealth
     * @description 获取应用健康状态
     * @returns {object} 健康状态信息
     */
    @Get('health')
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        };
    }

    /**
     * @function getInfo
     * @description 获取应用基本信息
     * @returns {object} 应用信息
     */
    @Get('info')
    getInfo() {
        return {
            name: 'SAAS Platform API',
            description: '基于DDD和Clean Architecture的多租户SaaS平台',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            architecture: 'DDD + Clean Architecture + CQRS + Event Sourcing',
            framework: 'NestJS + TypeScript + Fastify',
        };
    }
}
