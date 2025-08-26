/**
 * @file index.ts
 * @description 角色子领域入口文件
 *
 * 该文件是角色子领域的主要入口点，提供：
 * - 角色实体
 * - 角色值对象
 * - 角色事件
 * - 角色仓储接口
 * - 角色领域服务
 * - 角色聚合根
 */

// 导出实体
export * from './entities/role.entity';

// 导出值对象
export * from './value-objects/role-code.vo';

// 导出事件
export * from './events';

// 导出仓储接口
export * from './repositories/role-repository.interface';

// 导出领域服务
export * from './domain-services/role-domain.service';

// 导出聚合根
export * from './aggregates/role-aggregate';
