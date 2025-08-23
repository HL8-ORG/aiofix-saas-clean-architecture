import { Injectable } from '@nestjs/common';

/**
 * @class AppService
 * @description
 * 应用的根服务，提供基础的业务逻辑和工具方法。
 * 
 * 主要原理与机制如下：
 * 1. 使用@Injectable装饰器标记为可注入的服务类。
 * 2. 通过依赖注入容器管理服务的生命周期。
 * 3. 提供基础的业务逻辑方法，供控制器调用。
 * 
 * 功能与业务规则：
 * 1. 提供应用欢迎信息
 * 2. 提供应用状态检查
 * 3. 提供基础工具方法
 */
@Injectable()
export class AppService {
    /**
     * @function getHello
     * @description 获取应用欢迎信息
     * @returns {string} 欢迎信息
     */
    getHello(): string {
        return 'Welcome to SAAS Platform API! 🚀';
    }

    /**
     * @function getStatus
     * @description 获取应用状态信息
     * @returns {object} 状态信息
     */
    getStatus() {
        return {
            status: 'running',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            pid: process.pid,
        };
    }

    /**
     * @function getVersion
     * @description 获取应用版本信息
     * @returns {object} 版本信息
     */
    getVersion() {
        return {
            version: process.env.npm_package_version || '1.0.0',
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
        };
    }
}
