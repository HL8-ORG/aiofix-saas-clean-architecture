/**
 * @file index.ts
 * @description 权限子领域入口文件
 *
 * 该文件是权限子领域的主要入口点，提供：
 * - 权限实体
 * - 权限值对象
 * - 权限事件
 * - 权限仓储接口
 * - 权限领域服务
 * - 权限聚合根
 */

// 导出实体
export * from './entities/permission.entity';

// 导出值对象
export * from './value-objects/permission-code.vo';

// 导出事件
export * from './events';

// 导出仓储接口
export * from './repositories/permission-repository.interface';

// 导出领域服务
export * from './domain-services/permission-domain.service';

// 导出聚合根
export * from './aggregates/permission-aggregate';
