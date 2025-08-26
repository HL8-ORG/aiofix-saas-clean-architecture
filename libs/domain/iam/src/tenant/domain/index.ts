/**
 * @file index.ts
 * @description 租户子领域入口文件
 *
 * 该文件是租户子领域的主要入口点，提供：
 * - 租户实体
 * - 租户值对象
 * - 租户事件
 * - 租户仓储接口
 * - 租户领域服务
 * - 租户聚合根
 */

// 导出实体
export * from './entities/tenant.entity';

// 导出值对象
export * from './value-objects/tenant-code.vo';

// 导出事件
export * from './events';

// 导出仓储接口
export * from './repositories/tenant-repository.interface';

// 导出领域服务
export * from './domain-services/tenant-domain.service';

// 导出聚合根
export * from './aggregates/tenant-aggregate';
