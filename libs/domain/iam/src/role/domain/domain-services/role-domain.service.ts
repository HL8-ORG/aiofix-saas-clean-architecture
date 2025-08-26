/**
 * @file role-domain.service.ts
 * @description 角色领域服务
 *
 * 该文件定义了角色领域服务，负责处理角色相关的复杂业务逻辑。
 * 角色领域服务是DDD中的核心组件，封装了不归属于单个实体的业务规则。
 *
 * 主要功能：
 * 1. 角色创建和验证
 * 2. 角色权限管理
 * 3. 角色层级管理
 * 4. 角色成员管理
 * 5. 角色业务规则验证
 *
 * 业务规则：
 * 1. 角色代码在组织内必须唯一
 * 2. 角色名称在组织内必须唯一
 * 3. 系统角色不能被删除
 * 4. 角色继承关系不能形成循环
 * 5. 角色权限分配需要验证权限存在性
 * 6. 角色成员数量不能超过限制
 */

import { Uuid } from '@aiofix/domain-shared';
import { Role, RoleStatus, RoleType, RoleScope } from '../entities/role.entity';
import { RoleCode } from '../value-objects/role-code.vo';
import { RoleRepository } from '../repositories/role-repository.interface';

/**
 * @interface CreateRoleRequest
 * @description 创建角色请求
 */
export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string;
  organizationId: string;
  type?: RoleType;
  scope?: RoleScope;
  parentId?: string;
  settings?: Partial<Role['settings']>;
  limits?: Partial<Role['limits']>;
  metadata?: Record<string, any>;
}

/**
 * @interface UpdateRoleRequest
 * @description 更新角色请求
 */
export interface UpdateRoleRequest {
  id: string;
  name?: string;
  description?: string;
  type?: RoleType;
  scope?: RoleScope;
  parentId?: string;
  settings?: Partial<Role['settings']>;
  limits?: Partial<Role['limits']>;
  metadata?: Record<string, any>;
}

/**
 * @interface ChangeRoleStatusRequest
 * @description 变更角色状态请求
 */
export interface ChangeRoleStatusRequest {
  id: string;
  status: RoleStatus;
  reason?: string;
}

/**
 * @interface AssignPermissionRequest
 * @description 分配权限请求
 */
export interface AssignPermissionRequest {
  roleId: string;
  permissionId: string;
  assignedBy: string;
}

/**
 * @interface RemovePermissionRequest
 * @description 移除权限请求
 */
export interface RemovePermissionRequest {
  roleId: string;
  permissionId: string;
  removedBy: string;
}

/**
 * @interface AssignMemberRequest
 * @description 分配成员请求
 */
export interface AssignMemberRequest {
  roleId: string;
  memberId: string;
  assignedBy: string;
}

/**
 * @interface RemoveMemberRequest
 * @description 移除成员请求
 */
export interface RemoveMemberRequest {
  roleId: string;
  memberId: string;
  removedBy: string;
}

/**
 * @interface CloneRoleRequest
 * @description 克隆角色请求
 */
export interface CloneRoleRequest {
  sourceRoleId: string;
  newName: string;
  newCode: string;
  clonedBy: string;
  includePermissions?: boolean;
  includeMembers?: boolean;
}

/**
 * @interface RoleValidationResult
 * @description 角色验证结果
 */
export interface RoleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * @class RoleDomainService
 * @description 角色领域服务
 *
 * 该服务封装了角色相关的复杂业务逻辑，包括：
 * 1. 角色创建和验证逻辑
 * 2. 角色权限管理
 * 3. 角色层级管理
 * 4. 角色成员管理
 * 5. 业务规则验证
 */
export class RoleDomainService {
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * @method createRole
   * @description 创建角色
   * @param request 创建角色请求
   * @returns {Promise<Role>} 创建的角色
   */
  async createRole(request: CreateRoleRequest): Promise<Role> {
    // 验证请求参数
    const validationResult = await this.validateCreateRoleRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `角色创建验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 创建角色代码值对象
    const roleCode = new RoleCode(request.code);

    // 创建角色实体
    const role = Role.create(
      roleCode,
      request.name,
      new Uuid(request.organizationId),
      request.type || RoleType.CUSTOM,
      request.scope || RoleScope.ORGANIZATION,
      request.parentId ? new Uuid(request.parentId) : undefined,
    );

    // 设置描述
    if (request.description) {
      role.updateDescription(request.description);
    }

    // 设置自定义设置
    if (request.settings) {
      Object.entries(request.settings).forEach(([key, value]) => {
        role.setSetting(key as keyof Role['settings'], value);
      });
    }

    // 设置自定义限制
    if (request.limits) {
      Object.entries(request.limits).forEach(([key, value]) => {
        role.setLimit(key as keyof Role['limits'], value);
      });
    }

    // 设置元数据
    if (request.metadata) {
      Object.entries(request.metadata).forEach(([key, value]) => {
        role.setMetadata(key, value);
      });
    }

    return role;
  }

  /**
   * @method updateRole
   * @description 更新角色
   * @param request 更新角色请求
   * @returns {Promise<Role>} 更新后的角色
   */
  async updateRole(request: UpdateRoleRequest): Promise<Role> {
    // 获取现有角色
    const role = await this.roleRepository.findById(new Uuid(request.id));
    if (!role) {
      throw new Error('角色不存在');
    }

    // 验证更新请求
    const validationResult = await this.validateUpdateRoleRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `角色更新验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 更新角色信息
    if (request.name !== undefined) {
      role.updateName(request.name);
    }

    if (request.description !== undefined) {
      role.updateDescription(request.description);
    }

    if (request.type !== undefined) {
      role.updateType(request.type);
    }

    if (request.scope !== undefined) {
      role.updateScope(request.scope);
    }

    if (request.parentId !== undefined) {
      role.setParent(request.parentId ? new Uuid(request.parentId) : undefined);
    }

    // 更新设置
    if (request.settings) {
      Object.entries(request.settings).forEach(([key, value]) => {
        role.setSetting(key as keyof Role['settings'], value);
      });
    }

    // 更新限制
    if (request.limits) {
      Object.entries(request.limits).forEach(([key, value]) => {
        role.setLimit(key as keyof Role['limits'], value);
      });
    }

    // 更新元数据
    if (request.metadata) {
      Object.entries(request.metadata).forEach(([key, value]) => {
        role.setMetadata(key, value);
      });
    }

    return role;
  }

  /**
   * @method changeRoleStatus
   * @description 变更角色状态
   * @param request 变更状态请求
   * @returns {Promise<Role>} 更新后的角色
   */
  async changeRoleStatus(request: ChangeRoleStatusRequest): Promise<Role> {
    // 获取现有角色
    const role = await this.roleRepository.findById(new Uuid(request.id));
    if (!role) {
      throw new Error('角色不存在');
    }

    // 验证状态变更
    const validationResult = this.validateStatusChange(role, request.status);
    if (!validationResult.isValid) {
      throw new Error(
        `状态变更验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 变更状态
    switch (request.status) {
      case RoleStatus.ACTIVE:
        role.activate();
        break;
      case RoleStatus.SUSPENDED:
        role.suspend();
        break;
      case RoleStatus.DISABLED:
        role.disable();
        break;
      default:
        throw new Error(`不支持的角色状态: ${String(request.status)}`);
    }

    return role;
  }

  /**
   * @method assignPermission
   * @description 分配权限给角色
   * @param request 分配权限请求
   * @returns {Promise<void>}
   */
  async assignPermission(request: AssignPermissionRequest): Promise<void> {
    // 获取角色
    const role = await this.roleRepository.findById(new Uuid(request.roleId));
    if (!role) {
      throw new Error('角色不存在');
    }

    // 验证权限分配
    const validationResult = await this.validatePermissionAssignment(
      role,
      request.permissionId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `权限分配验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 分配权限
    await this.roleRepository.assignPermission(
      request.roleId,
      request.permissionId,
      request.assignedBy,
    );
  }

  /**
   * @method removePermission
   * @description 从角色移除权限
   * @param request 移除权限请求
   * @returns {Promise<void>}
   */
  async removePermission(request: RemovePermissionRequest): Promise<void> {
    // 获取角色
    const role = await this.roleRepository.findById(new Uuid(request.roleId));
    if (!role) {
      throw new Error('角色不存在');
    }

    // 验证权限移除
    const validationResult = this.validatePermissionRemoval(
      role,
      request.permissionId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `权限移除验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 移除权限
    await this.roleRepository.removePermission(
      request.roleId,
      request.permissionId,
      request.removedBy,
    );
  }

  /**
   * @method assignMember
   * @description 分配成员给角色
   * @param request 分配成员请求
   * @returns {Promise<void>}
   */
  async assignMember(request: AssignMemberRequest): Promise<void> {
    // 获取角色
    const role = await this.roleRepository.findById(new Uuid(request.roleId));
    if (!role) {
      throw new Error('角色不存在');
    }

    // 验证成员分配
    const validationResult = this.validateMemberAssignment(
      role,
      request.memberId,
    );
    if (!validationResult.isValid) {
      throw new Error(
        `成员分配验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 分配成员
    await this.roleRepository.assignToUser(
      request.roleId,
      request.memberId,
      request.assignedBy,
    );
  }

  /**
   * @method removeMember
   * @description 从角色移除成员
   * @param request 移除成员请求
   * @returns {Promise<void>}
   */
  async removeMember(request: RemoveMemberRequest): Promise<void> {
    // 获取角色
    const role = await this.roleRepository.findById(new Uuid(request.roleId));
    if (!role) {
      throw new Error('角色不存在');
    }

    // 验证成员移除
    const validationResult = this.validateMemberRemoval(role, request.memberId);
    if (!validationResult.isValid) {
      throw new Error(
        `成员移除验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 移除成员
    await this.roleRepository.removeFromUser(
      request.roleId,
      request.memberId,
      request.removedBy,
    );
  }

  /**
   * @method cloneRole
   * @description 克隆角色
   * @param request 克隆角色请求
   * @returns {Promise<Role>} 克隆的角色
   */
  async cloneRole(request: CloneRoleRequest): Promise<Role> {
    // 获取源角色
    const sourceRole = await this.roleRepository.findById(
      new Uuid(request.sourceRoleId),
    );
    if (!sourceRole) {
      throw new Error('源角色不存在');
    }

    // 验证克隆请求
    const validationResult = await this.validateCloneRoleRequest(request);
    if (!validationResult.isValid) {
      throw new Error(
        `角色克隆验证失败: ${validationResult.errors.join(', ')}`,
      );
    }

    // 克隆角色
    const clonedRole = await this.roleRepository.cloneRole(
      request.sourceRoleId,
      request.newName,
      request.newCode,
      request.clonedBy,
    );

    return clonedRole;
  }

  /**
   * @method getRoleHierarchy
   * @description 获取角色层级
   * @param roleId 角色ID
   * @returns {Promise<Role[]>} 角色层级
   */
  async getRoleHierarchy(roleId: string): Promise<Role[]> {
    return await this.roleRepository.getRoleHierarchy(roleId);
  }

  /**
   * @method getRoleUsage
   * @description 获取角色使用情况
   * @param roleId 角色ID
   * @returns {Promise<Record<string, any>>} 使用情况
   */
  async getRoleUsage(roleId: string): Promise<Record<string, any>> {
    return await this.roleRepository.getRoleUsage(roleId);
  }

  /**
   * @method getRoleStatistics
   * @description 获取角色统计信息
   * @param tenantId 租户ID
   * @returns {Promise<Record<string, any>>} 统计信息
   */
  async getRoleStatistics(tenantId: string): Promise<Record<string, any>> {
    return await this.roleRepository.getRoleStatistics(tenantId);
  }

  // ==================== 验证方法 ====================

  /**
   * @private
   * @method validateCreateRoleRequest
   * @description 验证创建角色请求
   * @param request 创建角色请求
   * @returns {Promise<RoleValidationResult>} 验证结果
   */
  private async validateCreateRoleRequest(
    request: CreateRoleRequest,
  ): Promise<RoleValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证基本信息
    if (!request.code || request.code.trim().length === 0) {
      errors.push('角色代码不能为空');
    }

    if (!request.name || request.name.trim().length === 0) {
      errors.push('角色名称不能为空');
    }

    if (!request.organizationId) {
      errors.push('组织ID不能为空');
    }

    // 验证角色代码唯一性
    if (request.code) {
      try {
        const roleCode = new RoleCode(request.code);
        const existingRole = await this.roleRepository.findByCode(
          roleCode.value,
          request.organizationId,
        );
        if (existingRole) {
          errors.push('角色代码在组织内必须唯一');
        }
      } catch (error) {
        errors.push(
          `角色代码格式错误: ${error instanceof Error ? error.message : '未知错误'}`,
        );
      }
    }

    // 验证角色名称唯一性
    if (request.name) {
      const existingRoles = await this.roleRepository.findByName(
        request.name,
        request.organizationId,
      );
      if (existingRoles.length > 0) {
        errors.push('角色名称在组织内必须唯一');
      }
    }

    // 验证父角色
    if (request.parentId) {
      const parentRole = await this.roleRepository.findById(
        new Uuid(request.parentId),
      );
      if (!parentRole) {
        errors.push('父角色不存在');
      } else if (parentRole.organizationId.value !== request.organizationId) {
        errors.push('父角色必须属于同一组织');
      }
    }

    // 验证设置和限制
    if (request.settings) {
      this.validateRoleSettings(request.settings, errors, warnings);
    }

    if (request.limits) {
      this.validateRoleLimits(request.limits, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateUpdateRoleRequest
   * @description 验证更新角色请求
   * @param request 更新角色请求
   * @returns {Promise<RoleValidationResult>} 验证结果
   */
  private async validateUpdateRoleRequest(
    request: UpdateRoleRequest,
  ): Promise<RoleValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证角色存在性
    const role = await this.roleRepository.findById(new Uuid(request.id));
    if (!role) {
      errors.push('角色不存在');
      return { isValid: false, errors, warnings };
    }

    // 验证角色名称唯一性
    if (request.name && request.name !== role.name) {
      const existingRoles = await this.roleRepository.findByName(
        request.name,
        role.organizationId.value,
      );
      const conflictingRoles = existingRoles.filter(r => !r.id.equals(role.id));
      if (conflictingRoles.length > 0) {
        errors.push('角色名称在组织内必须唯一');
      }
    }

    // 验证父角色
    if (request.parentId !== undefined) {
      if (request.parentId) {
        const parentRole = await this.roleRepository.findById(
          new Uuid(request.parentId),
        );
        if (!parentRole) {
          errors.push('父角色不存在');
        } else if (
          parentRole.organizationId.value !== role.organizationId.value
        ) {
          errors.push('父角色必须属于同一组织');
        } else if (parentRole.id.equals(role.id)) {
          errors.push('角色不能将自己设为父角色');
        }
      }
    }

    // 验证系统角色限制
    if (role.type === RoleType.SYSTEM) {
      if (request.type && request.type !== RoleType.SYSTEM) {
        errors.push('系统角色类型不能修改');
      }
    }

    // 验证设置和限制
    if (request.settings) {
      this.validateRoleSettings(request.settings, errors, warnings);
    }

    if (request.limits) {
      this.validateRoleLimits(request.limits, errors, warnings);
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
   * @param role 角色实体
   * @param newStatus 新状态
   * @returns {RoleValidationResult} 验证结果
   */
  private validateStatusChange(
    role: Role,
    newStatus: RoleStatus,
  ): RoleValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证系统角色状态变更
    if (role.type === RoleType.SYSTEM && newStatus === RoleStatus.DISABLED) {
      errors.push('系统角色不能被禁用');
    }

    // 验证状态变更逻辑
    if (
      role.status === RoleStatus.DISABLED &&
      newStatus === RoleStatus.ACTIVE
    ) {
      warnings.push('从禁用状态直接激活角色可能需要额外验证');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validatePermissionAssignment
   * @description 验证权限分配
   * @param role 角色实体
   * @param permissionId 权限ID
   * @returns {Promise<RoleValidationResult>} 验证结果
   */
  private async validatePermissionAssignment(
    role: Role,
    permissionId: string,
  ): Promise<RoleValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证角色是否可以添加权限
    if (!role.canAddPermission()) {
      errors.push('角色权限数量已达到上限');
    }

    // 验证权限是否已存在
    const existingPermissions = await this.roleRepository.findByPermission(
      permissionId,
      role.organizationId.value,
    );
    const hasPermission = existingPermissions.some(r => r.id.equals(role.id));
    if (hasPermission) {
      errors.push('角色已拥有该权限');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validatePermissionRemoval
   * @description 验证权限移除
   * @param role 角色实体
   * @param permissionId 权限ID
   * @returns {RoleValidationResult} 验证结果
   */
  private validatePermissionRemoval(
    role: Role,
    _permissionId: string,
  ): RoleValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证系统角色权限移除
    if (role.type === RoleType.SYSTEM) {
      warnings.push('移除系统角色权限可能影响系统功能');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateMemberAssignment
   * @description 验证成员分配
   * @param role 角色实体
   * @param memberId 成员ID
   * @returns {RoleValidationResult} 验证结果
   */
  private validateMemberAssignment(
    role: Role,
    memberId: string,
  ): RoleValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证角色是否可以添加成员
    if (!role.canAddMember()) {
      errors.push('角色成员数量已达到上限');
    }

    // 验证成员是否已存在
    if (role.hasMember(new Uuid(memberId))) {
      errors.push('用户已经是该角色的成员');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateMemberRemoval
   * @description 验证成员移除
   * @param role 角色实体
   * @param memberId 成员ID
   * @returns {RoleValidationResult} 验证结果
   */
  private validateMemberRemoval(
    role: Role,
    memberId: string,
  ): RoleValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证成员是否存在
    if (!role.hasMember(new Uuid(memberId))) {
      errors.push('用户不是该角色的成员');
    }

    // 验证系统角色成员移除
    if (role.type === RoleType.SYSTEM) {
      warnings.push('移除系统角色成员可能影响系统功能');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @private
   * @method validateCloneRoleRequest
   * @description 验证克隆角色请求
   * @param request 克隆角色请求
   * @returns {Promise<RoleValidationResult>} 验证结果
   */
  private async validateCloneRoleRequest(
    request: CloneRoleRequest,
  ): Promise<RoleValidationResult> {
    const errors: string[] = [];
    const _warnings: string[] = [];

    // 验证新角色代码唯一性
    try {
      const roleCode = new RoleCode(request.newCode);
      const sourceRole = await this.roleRepository.findById(
        new Uuid(request.sourceRoleId),
      );
      if (sourceRole) {
        const existingRole = await this.roleRepository.findByCode(
          roleCode.value,
          sourceRole.organizationId.value,
        );
        if (existingRole) {
          errors.push('新角色代码在组织内必须唯一');
        }
      }
    } catch (error) {
      errors.push(
        `新角色代码格式错误: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }

    // 验证新角色名称唯一性
    const sourceRole = await this.roleRepository.findById(
      new Uuid(request.sourceRoleId),
    );
    if (sourceRole) {
      const existingRoles = await this.roleRepository.findByName(
        request.newName,
        sourceRole.organizationId.value,
      );
      if (existingRoles.length > 0) {
        errors.push('新角色名称在组织内必须唯一');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * @private
   * @method validateRoleSettings
   * @description 验证角色设置
   * @param settings 角色设置
   * @param errors 错误列表
   * @param warnings 警告列表
   */
  private validateRoleSettings(
    settings: Partial<Role['settings']>,
    errors: string[],
    _warnings: string[],
  ): void {
    if (settings.expirationDays !== undefined && settings.expirationDays < 1) {
      errors.push('过期天数必须大于0');
    }

    if (settings.maxDelegations !== undefined && settings.maxDelegations < 0) {
      errors.push('最大委派数不能为负数');
    }
  }

  /**
   * @private
   * @method validateRoleLimits
   * @description 验证角色限制
   * @param limits 角色限制
   * @param errors 错误列表
   * @param _warnings 警告列表
   */
  private validateRoleLimits(
    limits: Partial<Role['limits']>,
    errors: string[],
    _warnings: string[],
  ): void {
    if (limits.maxMembers !== undefined && limits.maxMembers < 1) {
      errors.push('最大成员数必须大于0');
    }

    if (limits.maxSubRoles !== undefined && limits.maxSubRoles < 0) {
      errors.push('最大子角色数不能为负数');
    }

    if (limits.maxPermissions !== undefined && limits.maxPermissions < 1) {
      errors.push('最大权限数必须大于0');
    }

    if (limits.maxDelegations !== undefined && limits.maxDelegations < 0) {
      errors.push('最大委派数不能为负数');
    }

    if (limits.sessionTimeout !== undefined && limits.sessionTimeout < 1) {
      errors.push('会话超时时间必须大于0');
    }

    if (
      limits.concurrentSessions !== undefined &&
      limits.concurrentSessions < 1
    ) {
      errors.push('并发会话数必须大于0');
    }
  }
}
