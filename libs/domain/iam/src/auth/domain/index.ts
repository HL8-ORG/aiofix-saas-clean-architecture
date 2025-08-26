/**
 * @file index.ts
 * @description 认证子领域入口文件
 *
 * 该文件是认证子领域的主要入口点，提供：
 * - 认证实体
 * - 认证值对象
 * - 认证事件
 * - 认证仓储接口
 * - 认证领域服务
 * - 认证聚合根
 */

// 导出实体
export * from './entities/auth.entity';

// 导出值对象
export * from './value-objects/auth-token.vo';

// 导出事件
// export * from './events'; // TODO: 待实现

// 导出仓储接口
// export * from './repositories/auth-repository.interface'; // TODO: 待实现

// 导出领域服务
export * from './domain-services/auth-domain.service';

// 导出聚合根
export * from './aggregates/auth-aggregate';
