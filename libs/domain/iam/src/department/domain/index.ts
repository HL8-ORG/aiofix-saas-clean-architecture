/**
 * @file index.ts
 * @description 部门子领域入口文件
 *
 * 该文件是部门子领域的主要入口点，提供：
 * - 部门实体
 * - 部门值对象
 * - 部门事件
 * - 部门仓储接口
 * - 部门领域服务
 * - 部门聚合根
 */

// 导出实体
export * from './entities/department.entity';

// 导出值对象
export * from './value-objects/department-code.vo';

// 导出事件
export * from './events';

// 导出仓储接口
export * from './repositories/department-repository.interface';

// 导出领域服务
export * from './domain-services/department-domain.service';

// 导出聚合根
export * from './aggregates/department-aggregate';
