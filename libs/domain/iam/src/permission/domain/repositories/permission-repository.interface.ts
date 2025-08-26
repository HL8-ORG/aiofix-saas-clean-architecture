/**
 * @file permission-repository.interface.ts
 * @description 权限仓储接口
 *
 * 该文件定义了权限实体的数据访问接口，遵循仓储模式。
 * 该接口定义了权限相关的数据操作方法和查询功能。
 */

import { BaseRepository } from '@aiofix/domain-shared';
import { Permission } from '../entities/permission.entity';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface PermissionQueryOptions
 * @description 权限查询选项
 */
export interface PermissionQueryOptions {
  code?: string;
  name?: string;
  tenantId?: string;
  resource?: string;
  action?: string;
  type?: string;
  category?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  includeDeleted?: boolean;
}

/**
 * @interface PermissionRepository
 * @description 权限仓储接口
 *
 * 该接口定义了权限实体的数据访问方法，包括：
 * 1. 基本的CRUD操作
 * 2. 权限特定的查询方法
 * 3. 权限资源管理
 * 4. 权限分类管理
 */
export interface PermissionRepository extends BaseRepository<Permission> {
  /**
   * @method findByCode
   * @description 根据权限代码查找权限
   * @param code 权限代码
   * @param tenantId 租户ID
   * @returns {Promise<Permission | null>} 权限实体或null
   */
  findByCode(code: string, tenantId: string): Promise<Permission | null>;

  /**
   * @method findByName
   * @description 根据权限名称查找权限
   * @param name 权限名称
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findByName(name: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findByTenant
   * @description 根据租户查找权限
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findByTenant(tenantId: string): Promise<Permission[]>;

  /**
   * @method findByResource
   * @description 根据资源查找权限
   * @param resource 资源名称
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findByResource(resource: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findByAction
   * @description 根据操作查找权限
   * @param action 操作名称
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findByAction(action: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findByResourceAndAction
   * @description 根据资源和操作查找权限
   * @param resource 资源名称
   * @param action 操作名称
   * @param tenantId 租户ID
   * @returns {Promise<Permission | null>} 权限实体或null
   */
  findByResourceAndAction(
    resource: string,
    action: string,
    tenantId: string,
  ): Promise<Permission | null>;

  /**
   * @method findByType
   * @description 根据类型查找权限
   * @param type 权限类型
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findByType(type: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findByCategory
   * @description 根据分类查找权限
   * @param category 权限分类
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findByCategory(category: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findByRole
   * @description 根据角色查找权限
   * @param roleId 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findByRole(roleId: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findByUser
   * @description 根据用户查找权限
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findByUser(userId: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findSystemPermissions
   * @description 查找系统权限
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 系统权限列表
   */
  findSystemPermissions(tenantId: string): Promise<Permission[]>;

  /**
   * @method findCustomPermissions
   * @description 查找自定义权限
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 自定义权限列表
   */
  findCustomPermissions(tenantId: string): Promise<Permission[]>;

  /**
   * @method findPermissionsByPattern
   * @description 根据模式查找权限
   * @param pattern 权限模式
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findPermissionsByPattern(
    pattern: string,
    tenantId: string,
  ): Promise<Permission[]>;

  /**
   * @method assignToRole
   * @description 将权限分配给角色
   * @param permissionId 权限ID
   * @param roleId 角色ID
   * @param assignedBy 分配人
   * @returns {Promise<void>}
   */
  assignToRole(
    permissionId: string,
    roleId: string,
    assignedBy: string,
  ): Promise<void>;

  /**
   * @method removeFromRole
   * @description 从角色移除权限
   * @param permissionId 权限ID
   * @param roleId 角色ID
   * @param removedBy 移除人
   * @returns {Promise<void>}
   */
  removeFromRole(
    permissionId: string,
    roleId: string,
    removedBy: string,
  ): Promise<void>;

  /**
   * @method assignToUser
   * @description 将权限直接分配给用户
   * @param permissionId 权限ID
   * @param userId 用户ID
   * @param assignedBy 分配人
   * @returns {Promise<void>}
   */
  assignToUser(
    permissionId: string,
    userId: string,
    assignedBy: string,
  ): Promise<void>;

  /**
   * @method removeFromUser
   * @description 从用户移除权限
   * @param permissionId 权限ID
   * @param userId 用户ID
   * @param removedBy 移除人
   * @returns {Promise<void>}
   */
  removeFromUser(
    permissionId: string,
    userId: string,
    removedBy: string,
  ): Promise<void>;

  /**
   * @method updateSettings
   * @description 更新权限设置
   * @param permissionId 权限ID
   * @param settings 新设置
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateSettings(
    permissionId: string,
    settings: Record<string, any>,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method softDelete
   * @description 软删除权限
   * @param permissionId 权限ID
   * @param deletedBy 删除人
   * @returns {Promise<void>}
   */
  softDelete(permissionId: string, deletedBy: string): Promise<void>;

  /**
   * @method restore
   * @description 恢复已删除的权限
   * @param id 权限ID
   * @param tenantId 租户ID（可选）
   * @returns {Promise<boolean>} 是否恢复成功
   */
  restore(id: Uuid, tenantId?: string): Promise<boolean>;

  /**
   * @method getPermissionStatistics
   * @description 获取权限统计信息
   * @param tenantId 租户ID
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  getPermissionStatistics(tenantId: string): Promise<Record<string, any>>;

  /**
   * @method checkCodeExists
   * @description 检查权限代码是否存在
   * @param code 权限代码
   * @param tenantId 租户ID
   * @param excludeId 排除的权限ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkCodeExists(
    code: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * @method checkResourceActionExists
   * @description 检查资源操作组合是否存在
   * @param resource 资源名称
   * @param action 操作名称
   * @param tenantId 租户ID
   * @param excludeId 排除的权限ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkResourceActionExists(
    resource: string,
    action: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * @method clonePermission
   * @description 克隆权限
   * @param permissionId 源权限ID
   * @param newName 新权限名称
   * @param newCode 新权限代码
   * @param clonedBy 克隆人
   * @returns {Promise<Permission>} 克隆的权限
   */
  clonePermission(
    permissionId: string,
    newName: string,
    newCode: string,
    clonedBy: string,
  ): Promise<Permission>;

  /**
   * @method getPermissionUsage
   * @description 获取权限使用情况
   * @param permissionId 权限ID
   * @returns {Promise<Record<string, any>>} 使用情况
   */
  getPermissionUsage(permissionId: string): Promise<Record<string, any>>;

  /**
   * @method findPermissionsByResources
   * @description 根据资源列表查找权限
   * @param resources 资源列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findPermissionsByResources(
    resources: string[],
    tenantId: string,
  ): Promise<Permission[]>;

  /**
   * @method findPermissionsByActions
   * @description 根据操作列表查找权限
   * @param actions 操作列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限实体列表
   */
  findPermissionsByActions(
    actions: string[],
    tenantId: string,
  ): Promise<Permission[]>;

  /**
   * @method getPermissionCategories
   * @description 获取权限分类列表
   * @param tenantId 租户ID
   * @returns {Promise<string[]>} 分类列表
   */
  getPermissionCategories(tenantId: string): Promise<string[]>;

  /**
   * @method getPermissionResources
   * @description 获取权限资源列表
   * @param tenantId 租户ID
   * @returns {Promise<string[]>} 资源列表
   */
  getPermissionResources(tenantId: string): Promise<string[]>;

  /**
   * @method getPermissionActions
   * @description 获取权限操作列表
   * @param tenantId 租户ID
   * @returns {Promise<string[]>} 操作列表
   */
  getPermissionActions(tenantId: string): Promise<string[]>;

  /**
   * @method getPermissionHierarchy
   * @description 获取权限层级
   * @param permissionId 权限ID
   * @returns {Promise<Permission[]>} 权限层级
   */
  getPermissionHierarchy(permissionId: string): Promise<Permission[]>;
}
