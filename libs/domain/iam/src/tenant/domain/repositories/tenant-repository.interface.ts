/**
 * @file tenant-repository.interface.ts
 * @description 租户仓储接口
 *
 * 该文件定义了租户实体的数据访问接口，遵循仓储模式。
 * 该接口定义了租户相关的数据操作方法和查询功能。
 */

import { BaseRepository, Uuid } from '@aiofix/domain-shared';
import { Tenant } from '../entities/tenant.entity';

/**
 * @interface TenantQueryOptions
 * @description 租户查询选项
 */
export interface TenantQueryOptions {
  code?: string;
  name?: string;
  status?: string;
  type?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  includeDeleted?: boolean;
}

/**
 * @interface TenantRepository
 * @description 租户仓储接口
 *
 * 该接口定义了租户实体的数据访问方法，包括：
 * 1. 基本的CRUD操作
 * 2. 租户特定的查询方法
 * 3. 租户状态管理
 * 4. 租户设置管理
 */
export interface TenantRepository extends BaseRepository<Tenant> {
  /**
   * @method findByCode
   * @description 根据租户代码查找租户
   * @param code 租户代码
   * @returns {Promise<Tenant | null>} 租户实体或null
   */
  findByCode(code: string): Promise<Tenant | null>;

  /**
   * @method findByName
   * @description 根据租户名称查找租户
   * @param name 租户名称
   * @returns {Promise<Tenant[]>} 租户实体列表
   */
  findByName(name: string): Promise<Tenant[]>;

  /**
   * @method findByStatus
   * @description 根据状态查找租户
   * @param status 租户状态
   * @returns {Promise<Tenant[]>} 租户实体列表
   */
  findByStatus(status: string): Promise<Tenant[]>;

  /**
   * @method findByType
   * @description 根据类型查找租户
   * @param type 租户类型
   * @returns {Promise<Tenant[]>} 租户实体列表
   */
  findByType(type: string): Promise<Tenant[]>;

  /**
   * @method findActiveTenants
   * @description 查找所有活跃租户
   * @returns {Promise<Tenant[]>} 活跃租户列表
   */
  findActiveTenants(): Promise<Tenant[]>;

  /**
   * @method updateStatus
   * @description 更新租户状态
   * @param tenantId 租户ID
   * @param status 新状态
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateStatus(
    tenantId: string,
    status: string,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method updateSettings
   * @description 更新租户设置
   * @param tenantId 租户ID
   * @param settings 新设置
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateSettings(
    tenantId: string,
    settings: Record<string, any>,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method softDelete
   * @description 软删除租户
   * @param tenantId 租户ID
   * @param deletedBy 删除人
   * @returns {Promise<void>}
   */
  softDelete(tenantId: string, deletedBy: string): Promise<void>;

  /**
   * @method restore
   * @description 恢复已删除的租户
   * @param id 租户ID
   * @param tenantId 租户ID（可选）
   * @returns {Promise<boolean>} 是否恢复成功
   */
  restore(id: Uuid, tenantId?: string): Promise<boolean>;

  /**
   * @method getTenantStatistics
   * @description 获取租户统计信息
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  getTenantStatistics(): Promise<Record<string, any>>;

  /**
   * @method checkCodeExists
   * @description 检查租户代码是否存在
   * @param code 租户代码
   * @param excludeId 排除的租户ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkCodeExists(code: string, excludeId?: string): Promise<boolean>;
}
