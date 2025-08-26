/**
 * @file department-repository.interface.ts
 * @description 部门仓储接口
 *
 * 该文件定义了部门实体的数据访问接口，遵循仓储模式。
 * 该接口定义了部门相关的数据操作方法和查询功能。
 */

import { BaseRepository } from '@aiofix/domain-shared';
import { Department } from '../entities/department.entity';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface DepartmentQueryOptions
 * @description 部门查询选项
 */
export interface DepartmentQueryOptions {
  code?: string;
  name?: string;
  tenantId?: string;
  organizationId?: string;
  parentDepartmentId?: string;
  status?: string;
  type?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  includeDeleted?: boolean;
}

/**
 * @interface DepartmentRepository
 * @description 部门仓储接口
 *
 * 该接口定义了部门实体的数据访问方法，包括：
 * 1. 基本的CRUD操作
 * 2. 部门特定的查询方法
 * 3. 部门层级管理
 * 4. 部门状态管理
 */
export interface DepartmentRepository extends BaseRepository<Department> {
  /**
   * @method findByCode
   * @description 根据部门代码查找部门
   * @param code 部门代码
   * @param tenantId 租户ID
   * @returns {Promise<Department | null>} 部门实体或null
   */
  findByCode(code: string, tenantId: string): Promise<Department | null>;

  /**
   * @method findByName
   * @description 根据部门名称查找部门
   * @param name 部门名称
   * @param tenantId 租户ID
   * @returns {Promise<Department[]>} 部门实体列表
   */
  findByName(name: string, tenantId: string): Promise<Department[]>;

  /**
   * @method findByTenant
   * @description 根据租户查找部门
   * @param tenantId 租户ID
   * @returns {Promise<Department[]>} 部门实体列表
   */
  findByTenant(tenantId: string): Promise<Department[]>;

  /**
   * @method findByOrganization
   * @description 根据组织查找部门
   * @param organizationId 组织ID
   * @returns {Promise<Department[]>} 部门实体列表
   */
  findByOrganization(organizationId: string): Promise<Department[]>;

  /**
   * @method findByParent
   * @description 根据父部门查找子部门
   * @param parentDepartmentId 父部门ID
   * @returns {Promise<Department[]>} 子部门列表
   */
  findByParent(parentDepartmentId: string): Promise<Department[]>;

  /**
   * @method findRootDepartments
   * @description 查找根部门（没有父部门的部门）
   * @param organizationId 组织ID
   * @returns {Promise<Department[]>} 根部门列表
   */
  findRootDepartments(organizationId: string): Promise<Department[]>;

  /**
   * @method findByStatus
   * @description 根据状态查找部门
   * @param status 部门状态
   * @param tenantId 租户ID
   * @returns {Promise<Department[]>} 部门实体列表
   */
  findByStatus(status: string, tenantId: string): Promise<Department[]>;

  /**
   * @method findByType
   * @description 根据类型查找部门
   * @param type 部门类型
   * @param tenantId 租户ID
   * @returns {Promise<Department[]>} 部门实体列表
   */
  findByType(type: string, tenantId: string): Promise<Department[]>;

  /**
   * @method findActiveDepartments
   * @description 查找所有活跃部门
   * @param tenantId 租户ID
   * @returns {Promise<Department[]>} 活跃部门列表
   */
  findActiveDepartments(tenantId: string): Promise<Department[]>;

  /**
   * @method getDepartmentTree
   * @description 获取部门树结构
   * @param organizationId 组织ID
   * @param rootDepartmentId 根部门ID（可选）
   * @returns {Promise<Department[]>} 部门树结构
   */
  getDepartmentTree(
    organizationId: string,
    rootDepartmentId?: string,
  ): Promise<Department[]>;

  /**
   * @method getDepartmentPath
   * @description 获取部门路径（从根部门到当前部门的路径）
   * @param departmentId 部门ID
   * @returns {Promise<Department[]>} 部门路径
   */
  getDepartmentPath(departmentId: string): Promise<Department[]>;

  /**
   * @method getDepartmentAncestors
   * @description 获取部门祖先（所有上级部门）
   * @param departmentId 部门ID
   * @returns {Promise<Department[]>} 祖先部门列表
   */
  getDepartmentAncestors(departmentId: string): Promise<Department[]>;

  /**
   * @method getDepartmentDescendants
   * @description 获取部门后代（所有下级部门）
   * @param departmentId 部门ID
   * @returns {Promise<Department[]>} 后代部门列表
   */
  getDepartmentDescendants(departmentId: string): Promise<Department[]>;

  /**
   * @method updateStatus
   * @description 更新部门状态
   * @param departmentId 部门ID
   * @param status 新状态
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateStatus(
    departmentId: string,
    status: string,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method updateParent
   * @description 更新部门父级关系
   * @param departmentId 部门ID
   * @param parentDepartmentId 新父部门ID
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateParent(
    departmentId: string,
    parentDepartmentId: string,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method updateSettings
   * @description 更新部门设置
   * @param departmentId 部门ID
   * @param settings 新设置
   * @param updatedBy 更新人
   * @returns {Promise<void>}
   */
  updateSettings(
    departmentId: string,
    settings: Record<string, any>,
    updatedBy: string,
  ): Promise<void>;

  /**
   * @method softDelete
   * @description 软删除部门
   * @param departmentId 部门ID
   * @param deletedBy 删除人
   * @returns {Promise<void>}
   */
  softDelete(departmentId: string, deletedBy: string): Promise<void>;

  /**
   * @method restore
   * @description 恢复已删除的部门
   * @param id 部门ID
   * @param tenantId 租户ID（可选）
   * @returns {Promise<boolean>} 是否恢复成功
   */
  restore(id: Uuid, tenantId?: string): Promise<boolean>;

  /**
   * @method getDepartmentStatistics
   * @description 获取部门统计信息
   * @param organizationId 组织ID
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  getDepartmentStatistics(organizationId: string): Promise<Record<string, any>>;

  /**
   * @method checkCodeExists
   * @description 检查部门代码是否存在
   * @param code 部门代码
   * @param tenantId 租户ID
   * @param excludeId 排除的部门ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkCodeExists(
    code: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * @method checkNameExists
   * @description 检查部门名称是否存在
   * @param name 部门名称
   * @param organizationId 组织ID
   * @param excludeId 排除的部门ID（用于更新时检查）
   * @returns {Promise<boolean>} 是否存在
   */
  checkNameExists(
    name: string,
    organizationId: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * @method moveDepartment
   * @description 移动部门（改变父级关系）
   * @param departmentId 部门ID
   * @param newParentId 新父部门ID
   * @param movedBy 移动人
   * @returns {Promise<void>}
   */
  moveDepartment(
    departmentId: string,
    newParentId: string,
    movedBy: string,
  ): Promise<void>;

  /**
   * @method getDepartmentsByLevel
   * @description 根据层级获取部门
   * @param organizationId 组织ID
   * @param level 部门层级
   * @returns {Promise<Department[]>} 部门列表
   */
  getDepartmentsByLevel(
    organizationId: string,
    level: number,
  ): Promise<Department[]>;
}
