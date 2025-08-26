/**
 * @file index.ts
 * @description 组织子领域入口文件
 *
 * 该文件是组织子领域的主要入口点，提供：
 * - 组织实体
 * - 组织值对象
 * - 组织事件
 * - 组织仓储接口
 * - 组织领域服务
 * - 组织聚合根
 */

// 导出实体
export * from './entities/organization.entity';

// 导出值对象
export * from './value-objects/organization-code.vo';

// 导出事件
export * from './events';

// 导出仓储接口
export * from './repositories/organization-repository.interface';

// 导出领域服务
export * from './domain-services/organization-domain.service';

// 导出聚合根
export * from './aggregates/organization-aggregate';
