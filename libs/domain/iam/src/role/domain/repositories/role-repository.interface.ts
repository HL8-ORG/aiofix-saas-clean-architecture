/**
 * @file role-repository.interface.ts
 * @description 角色仓储接口
 *
 * 该文件定义了角色实体的数据访问接口，遵循仓储模式。
 * 该接口定义了角色相关的数据操作方法和查询功能。
 */

import { BaseRepository } from '@aiofix/domain-shared';
import { Role } from '../entities/role.entity';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface RoleQueryOptions
 * @description 角色查询选项
 */
export interface RoleQueryOptions {
  code?: string;
  name?: string;
  tenantId?: string;
  organizationId?: string;
  departmentId?: string;
  type?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  includeDeleted?: boolean;
}

/**
 * @interface RoleRepository
 * @description 角色仓储接口
 *
 * 该接口定义了角色实体的数据访问方法，包括：
 * 1. 基本的CRUD操作
 * 2. 角色特定的查询方法
 * 3. 角色权限管理
 * 4. 角色分配管理
 */
export interface RoleRepository extends BaseRepository<Role> {
  /**
   * @method findByCode
   * @description 根据角色代码查找角色
   * @param code 角色代码
   * @param tenantId 租户ID
   * @returns {Promise<Role | null>} 角色实体或null
   */
  findByCode(code: string, tenantId: string): Promise<Role | null>;

  /**
   * @method findByName
   * @description 根据角色名称查找角色
   * @param name 角色名称
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色实体列表
   */
  findByName(name: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findByTenant
   * @description 根据租户查找角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色实体列表
   */
  findByTenant(tenantId: string): Promise<Role[]>;

  /**
   * @method findByOrganization
   * @description 根据组织查找角色
   * @param organizationId 组织ID
   * @returns {Promise<Role[]>} 角色实体列表
   */
  findByOrganization(organizationId: string): Promise<Role[]>;

  /**
   * @method findByDepartment
   * @description 根据部门查找角色
   * @param departmentId 部门ID
   * @returns {Promise<Role[]>} 角色实体列表
   */
  findByDepartment(departmentId: string): Promise<Role[]>;

  /**
   * @method findByType
   * @description 根据类型查找角色
   * @param type 角色类型
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色实体列表
   */
  findByType(type: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findByPermission
   * @description 根据权限查找角色
   * @param permissionId 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色实体列表
   */
  findByPermission(permissionId: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findByUser
   * @description 根据用户查找角色
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色实体列表
   */
  findByUser(userId: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findSystemRoles
   * @description 查找系统角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 系统角色列表
   */
  findSystemRoles(tenantId: string): Promise<Role[]>;

  /**
   * @method findCustomRoles
   * @description 查找自定义角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 自定义角色列表
   */
  findCustomRoles(tenantId: string): Promise<Role[]>;

  /**
   * @method assignPermission
   * @description 分配权限给角色
   * @param roleId 角色ID
   * @param permissionId 权限ID
   * @param assignedBy 分配人
   * @returns {Promise<void>}
   */
  assignPermission(
    roleId: string,
    permissionId: string,
    assignedBy: string,
  ): Promise<void>;

  /**
   * @method removePermission
   * @description 从角色移除权限
   * @param roleId 角色ID
   * @param permissionId 权限ID
   * @param removedBy 移除人
   * @returns {Promise<void>}
   */
  removePermission(
    roleId: string,
    permissionId: string,
    removedBy: string,
  ): Promise<void>;

  /**
   * @method assignToUser
   * @description 将角色分配给用户
   * @param roleId 角色ID
   * @param userId 用户ID
   * @param assignedBy 分配人
   * @returns {Promise<void>}
   */
  assignToUser(
    roleId: string,
    userId: string,
    assignedBy: string,
  ): Promise<void>;

  /**
   * @method removeFromUser
   * @description 从用户移除角色
   * @param roleId 角色ID
   * @param userId 用户ID
   * @param removedBy 移除人
   * @returns {Promise<void>}
   */
  removeFromUser(
    roleId: string,
    userId: string,
    removedBy: string,
  ): Promise<void>;

  /**
   * @method updatePermissions
   * @description 批量更新角色权限
   * @param roleId 角色ID
   * @param permissionIds 权限ID列表
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updatePermissions(
    roleId: string,
    permissionIds: string[],
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method softDelete
   * @description 软删除角色
   * @param roleId 角色ID
   * @param deletedBy 删除人
   * @returns {Promise<void>}
   */
  softDelete(roleId: string, deletedBy: string): Promise<void>;

  /**
   * @method restore
   * @description 恢复已删除的角色
   * @param id 角色ID
   * @param tenantId 租户ID（可选）
   * @returns {Promise<boolean>} 是否恢复成功
   */
  restore(id: Uuid, tenantId?: string): Promise<boolean>;

  /**
   * @method getRoleStatistics
   * @description 获取角色统计信息
   * @param tenantId 租户ID
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  getRoleStatistics(tenantId: string): Promise<Record<string, any>>;

  /**
   * @method checkCodeExists
   * @description 检查角色代码是否存在
   * @param code 角色代码
   * @param tenantId 租户ID
   * @param excludeId 排除的角色ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkCodeExists(
    code: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * @method checkNameExists
   * @description 检查角色名称是否存在
   * @param name 角色名称
   * @param tenantId 租户ID
   * @param excludeId 排除的角色ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkNameExists(
    name: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * @method getRoleHierarchy
   * @description 获取角色层级关系
   * @param roleId 角色ID
   * @returns {Promise<Role[]>} 角色层级
   */
  getRoleHierarchy(roleId: string): Promise<Role[]>;

  /**
   * @method findInheritedRoles
   * @description 查找继承的角色
   * @param roleId 角色ID
   * @returns {Promise<Role[]>} 继承的角色列表
   */
  findInheritedRoles(roleId: string): Promise<Role[]>;

  /**
   * @method findInheritingRoles
   * @description 查找继承此角色的角色
   * @param roleId 角色ID
   * @returns {Promise<Role[]>} 继承此角色的角色列表
   */
  findInheritingRoles(roleId: string): Promise<Role[]>;

  /**
   * @method cloneRole
   * @description 克隆角色
   * @param roleId 源角色ID
   * @param newName 新角色名称
   * @param newCode 新角色代码
   * @param clonedBy 克隆人
   * @returns {Promise<Role>} 克隆的角色
   */
  cloneRole(
    roleId: string,
    newName: string,
    newCode: string,
    clonedBy: string,
  ): Promise<Role>;

  /**
   * @method getRoleUsage
   * @description 获取角色使用情况
   * @param roleId 角色ID
   * @returns {Promise<Record<string, any>>} 使用情况
   */
  getRoleUsage(roleId: string): Promise<Record<string, any>>;
}
