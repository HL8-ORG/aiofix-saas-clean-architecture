/**
 * @file permission-domain.service.ts
 * @description 权限领域服务
 *
 * 该文件定义了权限领域服务，负责处理权限相关的复杂业务逻辑。
 * 权限领域服务是DDD中的核心组件，封装了不归属于单个实体的业务规则。
 *
 * 主要功能：
 * 1. 权限创建和验证
 * 2. 权限资源管理
 * 3. 权限层级管理
 * 4. 权限分配管理
 * 5. 权限业务规则验证
 *
 * 业务规则：
 * 1. 权限代码在系统内必须唯一
 * 2. 权限名称在组织内必须唯一
 * 3. 系统权限不能被删除
 * 4. 权限继承关系不能形成循环
 * 5. 权限资源分配需要验证资源存在性
 * 6. 权限角色数量不能超过限制
 */

import { Uuid } from '@aiofix/domain-shared';
import {
  Permission,
  PermissionStatus,
  PermissionType,
  PermissionScope,
  PermissionAction,
  PermissionResource,
} from '../entities/permission.entity';
import { PermissionCode } from '../value-objects/permission-code.vo';
import { PermissionRepository } from '../repositories/permission-repository.interface';

/**
 * @interface CreatePermissionRequest
 * @description 创建权限请求
 */
export interface CreatePermissionRequest {
  code: string;
  name: string;
  description?: string;
  organizationId: string;
  type?: PermissionType;
  scope?: PermissionScope;
  action: PermissionAction;
  resource: PermissionResource;
  parentId?: string;
  settings?: Partial<Permission['settings']>;
  limits?: Partial<Permission['limits']>;
  metadata?: Record<string, any>;
}

/**
 * @interface UpdatePermissionRequest
 * @description 更新权限请求
 */
export interface UpdatePermissionRequest {
  id: string;
  name?: string;
  description?: string;
  type?: PermissionType;
  scope?: PermissionScope;
  action?: PermissionAction;
  resource?: PermissionResource;
  parentId?: string;
  settings?: Partial<Permission['settings']>;
  limits?: Partial<Permission['limits']>;
  metadata?: Record<string, any>;
}

/**
 * @interface ChangePermissionStatusRequest
 * @description 变更权限状态请求
 */
export interface ChangePermissionStatusRequest {
  id: string;
  status: PermissionStatus;
  reason?: string;
}

/**
 * @interface AssignToRoleRequest
 * @description 分配给角色请求
 */
export interface AssignToRoleRequest {
  permissionId: string;
  roleId: string;
  assignedBy: string;
}

/**
 * @interface RemoveFromRoleRequest
 * @description 从角色移除请求
 */
export interface RemoveFromRoleRequest {
  permissionId: string;
  roleId: string;
  removedBy: string;
}

/**
 * @interface AssignToUserRequest
 * @description 分配给用户请求
 */
export interface AssignToUserRequest {
  permissionId: string;
  userId: string;
  assignedBy: string;
}

/**
 * @interface RemoveFromUserRequest
 * @description 从用户移除请求
 */
export interface RemoveFromUserRequest {
  permissionId: string;
  userId: string;
  removedBy: string;
}

/**
 * @interface ClonePermissionRequest
 * @description 克隆权限请求
 */
export interface ClonePermissionRequest {
  sourcePermissionId: string;
  newName: string;
  newCode: string;
  clonedBy: string;
  includeRoles?: boolean;
  includeUsers?: boolean;
}

/**
 * @interface PermissionValidationResult
 * @description 权限验证结果
 */
export interface PermissionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * @class PermissionDomainService
 * @description 权限领域服务
 *
 * 该服务封装了权限相关的复杂业务逻辑，包括：
 * 1. 权限创建和验证逻辑
 * 2. 权限资源管理
 * 3. 权限层级管理
 * 4. 权限分配管理
 * 5. 业务规则验证
 */
export class PermissionDomainService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  /**
   * @method createPermission
   * @description 创建权限
   * @param request 创建权限请求
   * @returns {Promise<Permission>} 创建的权限
   */
  async createPermission(
    request: CreatePermissionRequest,
  ): Promise<Permission> {
    // 验证请求参数
    const validationResult =
      await this.validateCreatePermissionRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `权限创建验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 创建权限代码值对象
    const permissionCode = new PermissionCode(request.code);

    // 创建权限实体
    const permission = Permission.create(
      permissionCode,
      request.name,
      new Uuid(request.organizationId),
      request.type || PermissionType.CUSTOM,
      request.scope || PermissionScope.ORGANIZATION,
      request.action,
      request.resource,
      request.parentId ? new Uuid(request.parentId) : undefined,
    );

    // 设置描述
    if (request.description) {
      permission.updateDescription(request.description);
    }

    // 设置自定义设置
    if (request.settings) {
      Object.entries(request.settings).forEach(([key, value]) => {
        permission.setSetting(key as keyof Permission['settings'], value);
      });
    }

    // 设置自定义限制
    if (request.limits) {
      Object.entries(request.limits).forEach(([key, value]) => {
        permission.setLimit(key as keyof Permission['limits'], value);
      });
    }

    // 设置元数据
    if (request.metadata) {
      Object.entries(request.metadata).forEach(([key, value]) => {
        permission.setMetadata(key, value);
      });
    }

    return permission;
  }

  /**
   * @method updatePermission
   * @description 更新权限
   * @param request 更新权限请求
   * @returns {Promise<Permission>} 更新后的权限
   */
  async updatePermission(
    request: UpdatePermissionRequest,
  ): Promise<Permission> {
    // 获取现有权限
    const permission = await this.permissionRepository.findById(
      new Uuid(request.id),
    );
    if (!permission) {
      throw new Error('权限不存在');
    }

    // 验证更新请求
    const validationResult =
      await this.validateUpdatePermissionRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `权限更新验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 更新权限信息
    if (request.name !== undefined) {
      permission.updateName(request.name);
    }

    if (request.description !== undefined) {
      permission.updateDescription(request.description);
    }

    if (request.type !== undefined) {
      permission.updateType(request.type);
    }

    if (request.scope !== undefined) {
      permission.updateScope(request.scope);
    }

    if (request.action !== undefined) {
      permission.updateAction(request.action);
    }

    if (request.resource !== undefined) {
      permission.updateResource(request.resource);
    }

    if (request.parentId !== undefined) {
      permission.setParent(
        request.parentId ? new Uuid(request.parentId) : undefined,
      );
    }

    // 更新设置
    if (request.settings) {
      Object.entries(request.settings).forEach(([key, value]) => {
        permission.setSetting(key as keyof Permission['settings'], value);
      });
    }

    // 更新限制
    if (request.limits) {
      Object.entries(request.limits).forEach(([key, value]) => {
        permission.setLimit(key as keyof Permission['limits'], value);
      });
    }

    // 更新元数据
    if (request.metadata) {
      Object.entries(request.metadata).forEach(([key, value]) => {
        permission.setMetadata(key, value);
      });
    }

    return permission;
  }

  /**
   * @method changePermissionStatus
   * @description 变更权限状态
   * @param request 变更状态请求
   * @returns {Promise<Permission>} 更新后的权限
   */
  async changePermissionStatus(
    request: ChangePermissionStatusRequest,
  ): Promise<Permission> {
    // 获取现有权限
    const permission = await this.permissionRepository.findById(
      new Uuid(request.id),
    );
    if (!permission) {
      throw new Error('权限不存在');
    }

    // 验证状态变更
    const validationResult = this.validateStatusChange(
      permission,
      request.status,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `状态变更验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 变更状态
    switch (request.status) {
      case PermissionStatus.ACTIVE:
        permission.activate();
        break;
      case PermissionStatus.SUSPENDED:
        permission.suspend();
        break;
      case PermissionStatus.DISABLED:
        permission.disable();
        break;
      default:
        throw new Error(`不支持的权限状态: ${String(request.status)}`);
    }

    return permission;
  }

  /**
   * @method assignToRole
   * @description 将权限分配给角色
   * @param request 分配请求
   * @returns {Promise<void>}
   */
  async assignToRole(request: AssignToRoleRequest): Promise<void> {
    // 获取权限
    const permission = await this.permissionRepository.findById(
      new Uuid(request.permissionId),
    );
    if (!permission) {
      throw new Error('权限不存在');
    }

    // 验证权限分配
    const validationResult = this.validateRoleAssignment(
      permission,
      request.roleId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `权限分配验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 分配权限
    await this.permissionRepository.assignToRole(
      request.permissionId,
      request.roleId,
      request.assignedBy,
    );
  }

  /**
   * @method removeFromRole
   * @description 从角色移除权限
   * @param request 移除请求
   * @returns {Promise<void>}
   */
  async removeFromRole(request: RemoveFromRoleRequest): Promise<void> {
    // 获取权限
    const permission = await this.permissionRepository.findById(
      new Uuid(request.permissionId),
    );
    if (!permission) {
      throw new Error('权限不存在');
    }

    // 验证权限移除
    const validationResult = this.validateRoleRemoval(
      permission,
      request.roleId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `权限移除验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 移除权限
    await this.permissionRepository.removeFromRole(
      request.permissionId,
      request.roleId,
      request.removedBy,
    );
  }

  /**
   * @method assignToUser
   * @description 将权限分配给用户
   * @param request 分配请求
   * @returns {Promise<void>}
   */
  async assignToUser(request: AssignToUserRequest): Promise<void> {
    // 获取权限
    const permission = await this.permissionRepository.findById(
      new Uuid(request.permissionId),
    );
    if (!permission) {
      throw new Error('权限不存在');
    }

    // 验证权限分配
    const validationResult = this.validateUserAssignment(
      permission,
      request.userId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `权限分配验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 分配权限
    await this.permissionRepository.assignToUser(
      request.permissionId,
      request.userId,
      request.assignedBy,
    );
  }

  /**
   * @method removeFromUser
   * @description 从用户移除权限
   * @param request 移除请求
   * @returns {Promise<void>}
   */
  async removeFromUser(request: RemoveFromUserRequest): Promise<void> {
    // 获取权限
    const permission = await this.permissionRepository.findById(
      new Uuid(request.permissionId),
    );
    if (!permission) {
      throw new Error('权限不存在');
    }

    // 验证权限移除
    const validationResult = this.validateUserRemoval(
      permission,
      request.userId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `权限移除验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 移除权限
    await this.permissionRepository.removeFromUser(
      request.permissionId,
      request.userId,
      request.removedBy,
    );
  }

  /**
   * @method clonePermission
   * @description 克隆权限
   * @param request 克隆权限请求
   * @returns {Promise<Permission>} 克隆的权限
   */
  async clonePermission(request: ClonePermissionRequest): Promise<Permission> {
    // 获取源权限
    const sourcePermission = await this.permissionRepository.findById(
      new Uuid(request.sourcePermissionId),
    );
    if (!sourcePermission) {
      throw new Error('源权限不存在');
    }

    // 验证克隆请求
    const validationResult = await this.validateClonePermissionRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `权限克隆验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 克隆权限
    const clonedPermission = await this.permissionRepository.clonePermission(
      request.sourcePermissionId,
      request.newName,
      request.newCode,
      request.clonedBy,
    );

    return clonedPermission;
  }

  /**
   * @method getPermissionHierarchy
   * @description 获取权限层级
   * @param permissionId 权限ID
   * @returns {Promise<Permission[]>} 权限层级
   */
  async getPermissionHierarchy(permissionId: string): Promise<Permission[]> {
    return await this.permissionRepository.getPermissionHierarchy(permissionId);
  }

  /**
   * @method getPermissionUsage
   * @description 获取权限使用情况
   * @param permissionId 权限ID
   * @returns {Promise<Record<string, any>>} 使用情况
   */
  async getPermissionUsage(permissionId: string): Promise<Record<string, any>> {
    return await this.permissionRepository.getPermissionUsage(permissionId);
  }

  /**
   * @method getPermissionStatistics
   * @description 获取权限统计信息
   * @param tenantId 租户ID
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  async getPermissionStatistics(
    tenantId: string,
  ): Promise<Record<string, any>> {
    return await this.permissionRepository.getPermissionStatistics(tenantId);
  }

  // ==================== 验证方法 ====================

  /**
   * @private
   * @method validateCreatePermissionRequest
   * @description 验证创建权限请求
   * @param request 创建权限请求
   * @returns {Promise<PermissionValidationResult>} 验证结果
   */
  private async validateCreatePermissionRequest(
    request: CreatePermissionRequest,
  ): Promise<PermissionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证基本信息
    if (!request.code || request.code.trim().length === 0) {
      errors.push('权限代码不能为空');
    }

    if (!request.name || request.name.trim().length === 0) {
      errors.push('权限名称不能为空');
    }

    if (!request.organizationId) {
      errors.push('组织ID不能为空');
    }

    if (!request.action) {
      errors.push('权限动作不能为空');
    }

    if (!request.resource) {
      errors.push('权限资源不能为空');
    }

    // 验证权限代码唯一性
    if (request.code) {
      try {
        const permissionCode = new PermissionCode(request.code);
        const existingPermission = await this.permissionRepository.findByCode(
          permissionCode.value,
          request.organizationId,
        );
        if (existingPermission) {
          errors.push('权限代码在组织内必须唯一');
        }
      } catch (error) {
        errors.push(
          `权限代码格式错误: ${error instanceof Error ? error.message : '未知错误'}`,
        );
      }
    }

    // 验证权限名称唯一性
    if (request.name) {
      const existingPermissions = await this.permissionRepository.findByName(
        request.name,
        request.organizationId,
      );
      if (existingPermissions.length > 0) {
        errors.push('权限名称在组织内必须唯一');
      }
    }

    // 验证资源和动作组合唯一性
    if (request.resource && request.action) {
      const existingPermission =
        await this.permissionRepository.findByResourceAndAction(
          request.resource.name,
          request.action,
          request.organizationId,
        );
      if (existingPermission) {
        errors.push('资源和动作组合在组织内必须唯一');
      }
    }

    // 验证父权限
    if (request.parentId) {
      const parentPermission = await this.permissionRepository.findById(
        new Uuid(request.parentId),
      );
      if (!parentPermission) {
        errors.push('父权限不存在');
      } else if (
        parentPermission.organizationId.value !== request.organizationId
      ) {
        errors.push('父权限必须属于同一组织');
      }
    }

    // 验证资源格式
    if (request.resource) {
      this.validatePermissionResource(request.resource, errors, warnings);
    }

    // 验证设置和限制
    if (request.settings) {
      this.validatePermissionSettings(request.settings, errors, warnings);
    }

    if (request.limits) {
      this.validatePermissionLimits(request.limits, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateUpdatePermissionRequest
   * @description 验证更新权限请求
   * @param request 更新权限请求
   * @returns {Promise<PermissionValidationResult>} 验证结果
   */
  private async validateUpdatePermissionRequest(
    request: UpdatePermissionRequest,
  ): Promise<PermissionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证权限存在性
    const permission = await this.permissionRepository.findById(
      new Uuid(request.id),
    );
    if (!permission) {
      errors.push('权限不存在');
      return { isValid: false, errors, warnings };
    }

    // 验证权限名称唯一性
    if (request.name && request.name !== permission.name) {
      const existingPermissions = await this.permissionRepository.findByName(
        request.name,
        permission.organizationId.value,
      );
      const conflictingPermissions = existingPermissions.filter(
        p => !p.id.equals(permission.id),
      );
      if (conflictingPermissions.length > 0) {
        errors.push('权限名称在组织内必须唯一');
      }
    }

    // 验证资源和动作组合唯一性
    if (request.resource && request.action) {
      const existingPermission =
        await this.permissionRepository.findByResourceAndAction(
          request.resource.name,
          request.action,
          permission.organizationId.value,
        );
      if (existingPermission && !existingPermission.id.equals(permission.id)) {
        errors.push('资源和动作组合在组织内必须唯一');
      }
    }

    // 验证父权限
    if (request.parentId !== undefined) {
      if (request.parentId) {
        const parentPermission = await this.permissionRepository.findById(
          new Uuid(request.parentId),
        );
        if (!parentPermission) {
          errors.push('父权限不存在');
        } else if (
          parentPermission.organizationId.value !==
          permission.organizationId.value
        ) {
          errors.push('父权限必须属于同一组织');
        } else if (parentPermission.id.equals(permission.id)) {
          errors.push('权限不能将自己设为父权限');
        }
      }
    }

    // 验证系统权限限制
    if (permission.type === PermissionType.SYSTEM) {
      if (request.type && request.type !== PermissionType.SYSTEM) {
        errors.push('系统权限类型不能修改');
      }
    }

    // 验证资源格式
    if (request.resource) {
      this.validatePermissionResource(request.resource, errors, warnings);
    }

    // 验证设置和限制
    if (request.settings) {
      this.validatePermissionSettings(request.settings, errors, warnings);
    }

    if (request.limits) {
      this.validatePermissionLimits(request.limits, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateStatusChange
   * @description 验证状态变更
   * @param permission 权限实体
   * @param newStatus 新状态
   * @returns {PermissionValidationResult} 验证结果
   */
  private validateStatusChange(
    permission: Permission,
    newStatus: PermissionStatus,
  ): PermissionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证系统权限状态变更
    if (
      permission.type === PermissionType.SYSTEM &&
      newStatus === PermissionStatus.DISABLED
    ) {
      errors.push('系统权限不能被禁用');
    }

    // 验证状态变更逻辑
    if (
      permission.status === PermissionStatus.DISABLED &&
      newStatus === PermissionStatus.ACTIVE
    ) {
      warnings.push('从禁用状态直接激活权限可能需要额外验证');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateRoleAssignment
   * @description 验证角色分配
   * @param permission 权限实体
   * @param roleId 角色ID
   * @returns {PermissionValidationResult} 验证结果
   */
  private validateRoleAssignment(
    permission: Permission,
    roleId: string,
  ): PermissionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证权限是否可以添加角色
    if (!permission.canAddRole()) {
      errors.push('权限角色数量已达到上限');
    }

    // 验证角色是否已存在
    if (permission.hasRole(new Uuid(roleId))) {
      errors.push('角色已经拥有该权限');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateRoleRemoval
   * @description 验证角色移除
   * @param permission 权限实体
   * @param roleId 角色ID
   * @returns {PermissionValidationResult} 验证结果
   */
  private validateRoleRemoval(
    permission: Permission,
    roleId: string,
  ): PermissionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证角色是否存在
    if (!permission.hasRole(new Uuid(roleId))) {
      errors.push('角色不拥有该权限');
    }

    // 验证系统权限角色移除
    if (permission.type === PermissionType.SYSTEM) {
      warnings.push('移除系统权限角色可能影响系统功能');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateUserAssignment
   * @description 验证用户分配
   * @param permission 权限实体
   * @param userId 用户ID
   * @returns {PermissionValidationResult} 验证结果
   */
  private validateUserAssignment(
    permission: Permission,
    userId: string,
  ): PermissionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证权限是否可以添加用户
    if (!permission.canAddUser()) {
      errors.push('权限用户数量已达到上限');
    }

    // 验证用户是否已存在
    if (permission.hasUser(new Uuid(userId))) {
      errors.push('用户已经拥有该权限');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateUserRemoval
   * @description 验证用户移除
   * @param permission 权限实体
   * @param userId 用户ID
   * @returns {PermissionValidationResult} 验证结果
   */
  private validateUserRemoval(
    permission: Permission,
    userId: string,
  ): PermissionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证用户是否存在
    if (!permission.hasUser(new Uuid(userId))) {
      errors.push('用户不拥有该权限');
    }

    // 验证系统权限用户移除
    if (permission.type === PermissionType.SYSTEM) {
      warnings.push('移除系统权限用户可能影响系统功能');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateClonePermissionRequest
   * @description 验证克隆权限请求
   * @param request 克隆权限请求
   * @returns {Promise<PermissionValidationResult>} 验证结果
   */
  private async validateClonePermissionRequest(
    request: ClonePermissionRequest,
  ): Promise<PermissionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证新权限代码唯一性
    try {
      const permissionCode = new PermissionCode(request.newCode);
      const sourcePermission = await this.permissionRepository.findById(
        new Uuid(request.sourcePermissionId),
      );
      if (sourcePermission) {
        const existingPermission = await this.permissionRepository.findByCode(
          permissionCode.value,
          sourcePermission.organizationId.value,
        );
        if (existingPermission) {
          errors.push('新权限代码在组织内必须唯一');
        }
      }
    } catch (error) {
      errors.push(
        `新权限代码格式错误: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }

    // 验证新权限名称唯一性
    const sourcePermission = await this.permissionRepository.findById(
      new Uuid(request.sourcePermissionId),
    );
    if (sourcePermission) {
      const existingPermissions = await this.permissionRepository.findByName(
        request.newName,
        sourcePermission.organizationId.value,
      );
      if (existingPermissions.length > 0) {
        errors.push('新权限名称在组织内必须唯一');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validatePermissionResource
   * @description 验证权限资源
   * @param resource 权限资源
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validatePermissionResource(
    resource: PermissionResource,
    errors: string[],
    _warnings: string[],
  ): void {
    if (!resource.type || resource.type.trim().length === 0) {
      errors.push('资源类型不能为空');
    }

    if (!resource.name || resource.name.trim().length === 0) {
      errors.push('资源名称不能为空');
    }

    if (!resource.path || resource.path.trim().length === 0) {
      errors.push('资源路径不能为空');
    }

    // 验证资源路径格式
    if (resource.path && !resource.path.startsWith('/')) {
      _warnings.push('资源路径建议以/开头');
    }
  }

  /**
   * @private
   * @method validatePermissionSettings
   * @description 验证权限设置
   * @param settings 权限设置
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validatePermissionSettings(
    settings: Partial<Permission['settings']>,
    errors: string[],
    _warnings: string[],
  ): void {
    if (settings.expirationDays !== undefined && settings.expirationDays < 1) {
      errors.push('过期天数必须大于0');
    }

    if (settings.maxUsage !== undefined && settings.maxUsage < -1) {
      errors.push('最大使用次数不能小于-1');
    }
  }

  /**
   * @private
   * @method validatePermissionLimits
   * @description 验证权限限制
   * @param limits 权限限制
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validatePermissionLimits(
    limits: Partial<Permission['limits']>,
    errors: string[],
    _warnings: string[],
  ): void {
    if (limits.maxRoles !== undefined && limits.maxRoles < 1) {
      errors.push('最大角色数必须大于0');
    }

    if (limits.maxUsers !== undefined && limits.maxUsers < 0) {
      errors.push('最大用户数不能为负数');
    }

    if (
      limits.maxSubPermissions !== undefined &&
      limits.maxSubPermissions < 0
    ) {
      errors.push('最大子权限数不能为负数');
    }

    if (limits.maxDelegations !== undefined && limits.maxDelegations < 0) {
      errors.push('最大委派数不能为负数');
    }

    if (limits.sessionTimeout !== undefined && limits.sessionTimeout < 1) {
      errors.push('会话超时时间必须大于0');
    }

    if (limits.concurrentAccess !== undefined && limits.concurrentAccess < 1) {
      errors.push('并发访问数必须大于0');
    }
  }
}
