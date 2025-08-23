import { Module } from '@nestjs/common';

/**
 * @class SharedModule
 * @description
 * 共享模块，提供跨模块使用的共享服务和工具。
 * 
 * 主要原理与机制如下：
 * 1. 使用@Module装饰器定义共享模块，通过providers注册共享服务。
 * 2. 通过exports导出需要被其他模块使用的服务。
 * 3. 提供基础的工具函数、验证器、装饰器等共享功能。
 * 
 * 功能与业务规则：
 * 1. 提供共享的基础实体和值对象
 * 2. 提供共享的应用服务接口
 * 3. 提供共享的基础设施服务
 * 4. 提供共享的工具函数
 */
@Module({
    providers: [
        // TODO: 添加共享服务
        // BaseEntityService,
        // ValidationService,
        // LoggerService,
        // CacheService,
    ],
    exports: [
        // TODO: 导出共享服务
        // BaseEntityService,
        // ValidationService,
        // LoggerService,
        // CacheService,
    ],
})
export class SharedModule { }
