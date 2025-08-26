/**
 * @file organization-repository.interface.ts
 * @description 组织仓储接口
 *
 * 该文件定义了组织实体的数据访问接口，遵循仓储模式。
 * 该接口定义了组织相关的数据操作方法和查询功能。
 */

import { BaseRepository } from '@aiofix/domain-shared';
import { Organization } from '../entities/organization.entity';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface OrganizationQueryOptions
 * @description 组织查询选项
 */
export interface OrganizationQueryOptions {
  code?: string;
  name?: string;
  tenantId?: string;
  parentOrganizationId?: string;
  status?: string;
  type?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  includeDeleted?: boolean;
}

/**
 * @interface OrganizationRepository
 * @description 组织仓储接口
 *
 * 该接口定义了组织实体的数据访问方法，包括：
 * 1. 基本的CRUD操作
 * 2. 组织特定的查询方法
 * 3. 组织层级管理
 * 4. 组织状态管理
 */
export interface OrganizationRepository extends BaseRepository<Organization> {
  /**
   * @method findByCode
   * @description 根据组织代码查找组织
   * @param code 组织代码
   * @param tenantId 租户ID
   * @returns {Promise<Organization | null>} 组织实体或null
   */
  findByCode(code: string, tenantId: string): Promise<Organization | null>;

  /**
   * @method findByName
   * @description 根据组织名称查找组织
   * @param name 组织名称
   * @param tenantId 租户ID
   * @returns {Promise<Organization[]>} 组织实体列表
   */
  findByName(name: string, tenantId: string): Promise<Organization[]>;

  /**
   * @method findByTenant
   * @description 根据租户查找组织
   * @param tenantId 租户ID
   * @returns {Promise<Organization[]>} 组织实体列表
   */
  findByTenant(tenantId: string): Promise<Organization[]>;

  /**
   * @method findByParent
   * @description 根据父组织查找子组织
   * @param parentOrganizationId 父组织ID
   * @returns {Promise<Organization[]>} 子组织列表
   */
  findByParent(parentOrganizationId: string): Promise<Organization[]>;

  /**
   * @method findRootOrganizations
   * @description 查找根组织（没有父组织的组织）
   * @param tenantId 租户ID
   * @returns {Promise<Organization[]>} 根组织列表
   */
  findRootOrganizations(tenantId: string): Promise<Organization[]>;

  /**
   * @method findByStatus
   * @description 根据状态查找组织
   * @param status 组织状态
   * @param tenantId 租户ID
   * @returns {Promise<Organization[]>} 组织实体列表
   */
  findByStatus(status: string, tenantId: string): Promise<Organization[]>;

  /**
   * @method findByType
   * @description 根据类型查找组织
   * @param type 组织类型
   * @param tenantId 租户ID
   * @returns {Promise<Organization[]>} 组织实体列表
   */
  findByType(type: string, tenantId: string): Promise<Organization[]>;

  /**
   * @method findActiveOrganizations
   * @description 查找所有活跃组织
   * @param tenantId 租户ID
   * @returns {Promise<Organization[]>} 活跃组织列表
   */
  findActiveOrganizations(tenantId: string): Promise<Organization[]>;

  /**
   * @method getOrganizationTree
   * @description 获取组织树结构
   * @param tenantId 租户ID
   * @param rootOrganizationId 根组织ID（可选）
   * @returns {Promise<Organization[]>} 组织树结构
   */
  getOrganizationTree(
    tenantId: string,
    rootOrganizationId?: string,
  ): Promise<Organization[]>;

  /**
   * @method getOrganizationPath
   * @description 获取组织路径（从根组织到当前组织的路径）
   * @param organizationId 组织ID
   * @returns {Promise<Organization[]>} 组织路径
   */
  getOrganizationPath(organizationId: string): Promise<Organization[]>;

  /**
   * @method getOrganizationAncestors
   * @description 获取组织祖先（所有上级组织）
   * @param organizationId 组织ID
   * @returns {Promise<Organization[]>} 祖先组织列表
   */
  getOrganizationAncestors(organizationId: string): Promise<Organization[]>;

  /**
   * @method getOrganizationDescendants
   * @description 获取组织后代（所有下级组织）
   * @param organizationId 组织ID
   * @returns {Promise<Organization[]>} 后代组织列表
   */
  getOrganizationDescendants(organizationId: string): Promise<Organization[]>;

  /**
   * @method updateStatus
   * @description 更新组织状态
   * @param organizationId 组织ID
   * @param status 新状态
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateStatus(
    organizationId: string,
    status: string,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method updateParent
   * @description 更新组织父级关系
   * @param organizationId 组织ID
   * @param parentOrganizationId 新父组织ID
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateParent(
    organizationId: string,
    parentOrganizationId: string,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method updateSettings
   * @description 更新组织设置
   * @param organizationId 组织ID
   * @param settings 新设置
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateSettings(
    organizationId: string,
    settings: Record<string, any>,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method softDelete
   * @description 软删除组织
   * @param organizationId 组织ID
   * @param deletedBy 删除人
   * @returns {Promise<void>}
   */
  softDelete(organizationId: string, deletedBy: string): Promise<void>;

  /**
   * @method restore
   * @description 恢复已删除的组织
   * @param id 组织ID
   * @param tenantId 租户ID（可选）
   * @returns {Promise<boolean>} 是否恢复成功
   */
  restore(id: Uuid, tenantId?: string): Promise<boolean>;

  /**
   * @method getOrganizationStatistics
   * @description 获取组织统计信息
   * @param tenantId 租户ID
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  getOrganizationStatistics(tenantId: string): Promise<Record<string, any>>;

  /**
   * @method checkCodeExists
   * @description 检查组织代码是否存在
   * @param code 组织代码
   * @param tenantId 租户ID
   * @param excludeId 排除的组织ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkCodeExists(
    code: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * @method checkNameExists
   * @description 检查组织名称是否存在
   * @param name 组织名称
   * @param tenantId 租户ID
   * @param excludeId 排除的组织ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkNameExists(
    name: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * @method moveOrganization
   * @description 移动组织（改变父级关系）
   * @param organizationId 组织ID
   * @param newParentId 新父组织ID
   * @param movedBy 移动人
   * @returns {Promise<void>}
   */
  moveOrganization(
    organizationId: string,
    newParentId: string,
    movedBy: string,
  ): Promise<void>;

  /**
   * @method getOrganizationsByLevel
   * @description 根据层级获取组织
   * @param tenantId 租户ID
   * @param level 组织层级
   * @returns {Promise<Organization[]>} 组织列表
   */
  getOrganizationsByLevel(
    tenantId: string,
    level: number,
  ): Promise<Organization[]>;
}
