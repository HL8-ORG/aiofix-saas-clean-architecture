/**
 * @file organization-aggregate.ts
 * @description 组织聚合根
 *
 * 该文件定义了组织聚合根，负责管理组织及其相关实体的生命周期和一致性。
 * 组织聚合根是DDD中的核心概念，确保组织边界内的所有实体保持一致状态。
 *
 * 主要功能：
 * 1. 组织生命周期管理
 * 2. 组织层级管理
 * 3. 组织状态一致性保证
 * 4. 组织事件发布
 * 5. 组织业务规则验证
 *
 * 业务规则：
 * 1. 组织创建时必须设置基本信息和租户
 * 2. 组织状态变更需要验证所有子实体状态
 * 3. 组织删除前必须确保所有资源已清理
 * 4. 组织层级变更需要通知相关实体
 */

import { Uuid } from '@aiofix/domain-shared';
import {
  Organization,
  OrganizationStatus,
} from '../entities/organization.entity';

/**
 * @interface OrganizationAggregateSettings
 * @description 组织聚合根设置
 */
export interface OrganizationAggregateSettings {
  allowDepartmentCreation: boolean;
  allowRoleCreation: boolean;
  allowPermissionCreation: boolean;
  maxDepartments: number;
  maxRoles: number;
  maxPermissions: number;
  maxUsers: number;
  features: string[];
  customSettings: Record<string, any>;
}

/**
 * @interface OrganizationStatistics
 * @description 组织统计信息
 */
export interface OrganizationStatistics {
  departmentCount: number;
  roleCount: number;
  permissionCount: number;
  userCount: number;
  activeUserCount: number;
  lastActivityAt?: Date;
}

/**
 * @interface OrganizationDomainEvent
 * @description 组织领域事件
 */
export interface OrganizationDomainEvent {
  type: string;
  organizationId: string;
  timestamp: Date;
  [key: string]: unknown;
}

/**
 * @interface OrganizationAggregateState
 * @description 组织聚合根状态
 */
export interface OrganizationAggregateState {
  organization: Organization;
  settings: OrganizationAggregateSettings;
  statistics: OrganizationStatistics;
  departments: Uuid[];
  roles: Uuid[];
  permissions: Uuid[];
  users: Uuid[];
  lastUpdated: Date;
}

/**
 * @class OrganizationAggregate
 * @description 组织聚合根
 *
 * 该聚合根负责管理组织及其相关实体的生命周期，
 * 确保组织边界内的所有实体保持一致状态。
 */
export class OrganizationAggregate {
  private _state: OrganizationAggregateState;
  private _domainEvents: OrganizationDomainEvent[] = [];

  /**
   * @constructor
   * @param organization 组织实体
   * @param settings 组织设置
   */
  constructor(
    organization: Organization,
    settings: OrganizationAggregateSettings,
  ) {
    this._state = {
      organization,
      settings,
      statistics: {
        departmentCount: 0,
        roleCount: 0,
        permissionCount: 0,
        userCount: 0,
        activeUserCount: 0,
      },
      departments: [],
      roles: [],
      permissions: [],
      users: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * @getter id
   * @description 获取组织ID
   * @returns {Uuid} 组织ID
   */
  get id(): Uuid {
    return this._state.organization.id;
  }

  /**
   * @getter organization
   * @description 获取组织实体
   * @returns {Organization} 组织实体
   */
  get organization(): Organization {
    return this._state.organization;
  }

  /**
   * @getter settings
   * @description 获取组织设置
   * @returns {OrganizationAggregateSettings} 组织设置
   */
  get settings(): OrganizationAggregateSettings {
    return { ...this._state.settings };
  }

  /**
   * @getter statistics
   * @description 获取组织统计信息
   * @returns {OrganizationStatistics} 统计信息
   */
  get statistics(): OrganizationStatistics {
    return { ...this._state.statistics };
  }

  /**
   * @getter departments
   * @description 获取部门列表
   * @returns {Uuid[]} 部门ID列表
   */
  get departments(): Uuid[] {
    return [...this._state.departments];
  }

  /**
   * @getter roles
   * @description 获取角色列表
   * @returns {Uuid[]} 角色ID列表
   */
  get roles(): Uuid[] {
    return [...this._state.roles];
  }

  /**
   * @getter permissions
   * @description 获取权限列表
   * @returns {Uuid[]} 权限ID列表
   */
  get permissions(): Uuid[] {
    return [...this._state.permissions];
  }

  /**
   * @getter users
   * @description 获取用户列表
   * @returns {Uuid[]} 用户ID列表
   */
  get users(): Uuid[] {
    return [...this._state.users];
  }

  /**
   * @getter domainEvents
   * @description 获取领域事件
   * @returns {any[]} 领域事件列表
   */
  get domainEvents(): OrganizationDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method updateSettings
   * @description 更新组织设置
   * @param settings 新设置
   */
  updateSettings(settings: Partial<OrganizationAggregateSettings>): void {
    // 验证设置更新
    this.validateSettingsUpdate(settings);

    // 更新设置
    this._state.settings = {
      ...this._state.settings,
      ...settings,
    };

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布设置更新事件
    this.addDomainEvent({
      type: 'OrganizationSettingsUpdated',
      organizationId: this._state.organization.id.value,
      settings: this._state.settings,
      timestamp: new Date(),
    });
  }

  /**
   * @method updateStatistics
   * @description 更新组织统计信息
   * @param statistics 新统计信息
   */
  updateStatistics(statistics: Partial<OrganizationStatistics>): void {
    // 验证统计信息
    this.validateStatisticsUpdate(statistics);

    // 更新统计信息
    this._state.statistics = {
      ...this._state.statistics,
      ...statistics,
    };

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 检查是否超过限制
    this.checkLimits();
  }

  /**
   * @method addDepartment
   * @description 添加部门
   * @param departmentId 部门ID
   */
  addDepartment(departmentId: Uuid): void {
    // 验证部门添加
    this.validateDepartmentAddition(departmentId);

    // 添加部门
    if (!this._state.departments.some(id => id.equals(departmentId))) {
      this._state.departments.push(departmentId);
      this._state.statistics.departmentCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布部门添加事件
    this.addDomainEvent({
      type: 'OrganizationDepartmentAdded',
      organizationId: this._state.organization.id.value,
      departmentId: departmentId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeDepartment
   * @description 移除部门
   * @param departmentId 部门ID
   */
  removeDepartment(departmentId: Uuid): void {
    // 验证部门移除
    this.validateDepartmentRemoval(departmentId);

    // 移除部门
    this._state.departments = this._state.departments.filter(
      id => !id.equals(departmentId),
    );
    this._state.statistics.departmentCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布部门移除事件
    this.addDomainEvent({
      type: 'OrganizationDepartmentRemoved',
      organizationId: this._state.organization.id.value,
      departmentId: departmentId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method addRole
   * @description 添加角色
   * @param roleId 角色ID
   */
  addRole(roleId: Uuid): void {
    // 验证角色添加
    this.validateRoleAddition(roleId);

    // 添加角色
    if (!this._state.roles.some(id => id.equals(roleId))) {
      this._state.roles.push(roleId);
      this._state.statistics.roleCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布角色添加事件
    this.addDomainEvent({
      type: 'OrganizationRoleAdded',
      organizationId: this._state.organization.id.value,
      roleId: roleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeRole
   * @description 移除角色
   * @param roleId 角色ID
   */
  removeRole(roleId: Uuid): void {
    // 验证角色移除
    this.validateRoleRemoval(roleId);

    // 移除角色
    this._state.roles = this._state.roles.filter(id => !id.equals(roleId));
    this._state.statistics.roleCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布角色移除事件
    this.addDomainEvent({
      type: 'OrganizationRoleRemoved',
      organizationId: this._state.organization.id.value,
      roleId: roleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method addPermission
   * @description 添加权限
   * @param permissionId 权限ID
   */
  addPermission(permissionId: Uuid): void {
    // 验证权限添加
    this.validatePermissionAddition(permissionId);

    // 添加权限
    if (!this._state.permissions.some(id => id.equals(permissionId))) {
      this._state.permissions.push(permissionId);
      this._state.statistics.permissionCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布权限添加事件
    this.addDomainEvent({
      type: 'OrganizationPermissionAdded',
      organizationId: this._state.organization.id.value,
      permissionId: permissionId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removePermission
   * @description 移除权限
   * @param permissionId 权限ID
   */
  removePermission(permissionId: Uuid): void {
    // 验证权限移除
    this.validatePermissionRemoval(permissionId);

    // 移除权限
    this._state.permissions = this._state.permissions.filter(
      id => !id.equals(permissionId),
    );
    this._state.statistics.permissionCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布权限移除事件
    this.addDomainEvent({
      type: 'OrganizationPermissionRemoved',
      organizationId: this._state.organization.id.value,
      permissionId: permissionId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method addUser
   * @description 添加用户
   * @param userId 用户ID
   */
  addUser(userId: Uuid): void {
    // 验证用户添加
    this.validateUserAddition(userId);

    // 添加用户
    if (!this._state.users.some(id => id.equals(userId))) {
      this._state.users.push(userId);
      this._state.statistics.userCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布用户添加事件
    this.addDomainEvent({
      type: 'OrganizationUserAdded',
      organizationId: this._state.organization.id.value,
      userId: userId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeUser
   * @description 移除用户
   * @param userId 用户ID
   */
  removeUser(userId: Uuid): void {
    // 验证用户移除
    this.validateUserRemoval(userId);

    // 移除用户
    this._state.users = this._state.users.filter(id => !id.equals(userId));
    this._state.statistics.userCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布用户移除事件
    this.addDomainEvent({
      type: 'OrganizationUserRemoved',
      organizationId: this._state.organization.id.value,
      userId: userId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method changeStatus
   * @description 变更组织状态
   * @param newStatus 新状态
   * @param reason 变更原因
   */
  changeStatus(newStatus: OrganizationStatus, reason?: string): void {
    // 验证状态变更
    this.validateStatusChange(newStatus);

    // 变更状态
    switch (newStatus) {
      case OrganizationStatus.ACTIVE:
        this._state.organization.activate();
        break;
      case OrganizationStatus.SUSPENDED:
        this._state.organization.suspend();
        break;
      case OrganizationStatus.DISABLED:
        this._state.organization.disable();
        break;
      default:
        throw new Error(`不支持的组织状态: ${String(newStatus)}`);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布状态变更事件
    this.addDomainEvent({
      type: 'OrganizationStatusChanged',
      organizationId: this._state.organization.id.value,
      oldStatus: this._state.organization.status,
      newStatus,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * @method canAddDepartment
   * @description 检查是否可以添加部门
   * @returns {boolean} 是否可以添加部门
   */
  canAddDepartment(): boolean {
    return (
      this._state.settings.allowDepartmentCreation &&
      this._state.statistics.departmentCount <
        this._state.settings.maxDepartments
    );
  }

  /**
   * @method canAddRole
   * @description 检查是否可以添加角色
   * @returns {boolean} 是否可以添加角色
   */
  canAddRole(): boolean {
    return (
      this._state.settings.allowRoleCreation &&
      this._state.statistics.roleCount < this._state.settings.maxRoles
    );
  }

  /**
   * @method canAddPermission
   * @description 检查是否可以添加权限
   * @returns {boolean} 是否可以添加权限
   */
  canAddPermission(): boolean {
    return (
      this._state.settings.allowPermissionCreation &&
      this._state.statistics.permissionCount <
        this._state.settings.maxPermissions
    );
  }

  /**
   * @method canAddUser
   * @description 检查是否可以添加用户
   * @returns {boolean} 是否可以添加用户
   */
  canAddUser(): boolean {
    return this._state.statistics.userCount < this._state.settings.maxUsers;
  }

  /**
   * @method isFeatureEnabled
   * @description 检查功能是否启用
   * @param feature 功能名称
   * @returns {boolean} 功能是否启用
   */
  isFeatureEnabled(feature: string): boolean {
    return this._state.settings.features.includes(feature);
  }

  /**
   * @method clearDomainEvents
   * @description 清除领域事件
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * @private
   * @method validateSettingsUpdate
   * @description 验证设置更新
   * @param settings 新设置
   */
  private validateSettingsUpdate(
    settings: Partial<OrganizationAggregateSettings>,
  ): void {
    // 验证限制不能小于当前数量
    if (
      settings.maxDepartments !== undefined &&
      settings.maxDepartments < this._state.statistics.departmentCount
    ) {
      throw new Error(
        `部门数量限制不能小于当前部门数量: ${this._state.statistics.departmentCount}`,
      );
    }

    if (
      settings.maxRoles !== undefined &&
      settings.maxRoles < this._state.statistics.roleCount
    ) {
      throw new Error(
        `角色数量限制不能小于当前角色数量: ${this._state.statistics.roleCount}`,
      );
    }

    if (
      settings.maxPermissions !== undefined &&
      settings.maxPermissions < this._state.statistics.permissionCount
    ) {
      throw new Error(
        `权限数量限制不能小于当前权限数量: ${this._state.statistics.permissionCount}`,
      );
    }

    if (
      settings.maxUsers !== undefined &&
      settings.maxUsers < this._state.statistics.userCount
    ) {
      throw new Error(
        `用户数量限制不能小于当前用户数量: ${this._state.statistics.userCount}`,
      );
    }
  }

  /**
   * @private
   * @method validateStatisticsUpdate
   * @description 验证统计信息更新
   * @param statistics 新统计信息
   */
  private validateStatisticsUpdate(
    statistics: Partial<OrganizationStatistics>,
  ): void {
    // 验证统计信息不能为负数
    if (
      statistics.departmentCount !== undefined &&
      statistics.departmentCount < 0
    ) {
      throw new Error('部门数量不能为负数');
    }

    if (statistics.roleCount !== undefined && statistics.roleCount < 0) {
      throw new Error('角色数量不能为负数');
    }

    if (
      statistics.permissionCount !== undefined &&
      statistics.permissionCount < 0
    ) {
      throw new Error('权限数量不能为负数');
    }

    if (statistics.userCount !== undefined && statistics.userCount < 0) {
      throw new Error('用户数量不能为负数');
    }

    if (
      statistics.activeUserCount !== undefined &&
      statistics.activeUserCount < 0
    ) {
      throw new Error('活跃用户数量不能为负数');
    }
  }

  /**
   * @private
   * @method validateDepartmentAddition
   * @description 验证部门添加
   * @param departmentId 部门ID
   */
  private validateDepartmentAddition(departmentId: Uuid): void {
    if (this._state.departments.some(id => id.equals(departmentId))) {
      throw new Error('部门已存在');
    }

    if (!this.canAddDepartment()) {
      throw new Error('无法添加更多部门');
    }
  }

  /**
   * @private
   * @method validateDepartmentRemoval
   * @description 验证部门移除
   * @param departmentId 部门ID
   */
  private validateDepartmentRemoval(departmentId: Uuid): void {
    if (!this._state.departments.some(id => id.equals(departmentId))) {
      throw new Error('部门不存在');
    }
  }

  /**
   * @private
   * @method validateRoleAddition
   * @description 验证角色添加
   * @param roleId 角色ID
   */
  private validateRoleAddition(roleId: Uuid): void {
    if (this._state.roles.some(id => id.equals(roleId))) {
      throw new Error('角色已存在');
    }

    if (!this.canAddRole()) {
      throw new Error('无法添加更多角色');
    }
  }

  /**
   * @private
   * @method validateRoleRemoval
   * @description 验证角色移除
   * @param roleId 角色ID
   */
  private validateRoleRemoval(roleId: Uuid): void {
    if (!this._state.roles.some(id => id.equals(roleId))) {
      throw new Error('角色不存在');
    }
  }

  /**
   * @private
   * @method validatePermissionAddition
   * @description 验证权限添加
   * @param permissionId 权限ID
   */
  private validatePermissionAddition(permissionId: Uuid): void {
    if (this._state.permissions.some(id => id.equals(permissionId))) {
      throw new Error('权限已存在');
    }

    if (!this.canAddPermission()) {
      throw new Error('无法添加更多权限');
    }
  }

  /**
   * @private
   * @method validatePermissionRemoval
   * @description 验证权限移除
   * @param permissionId 权限ID
   */
  private validatePermissionRemoval(permissionId: Uuid): void {
    if (!this._state.permissions.some(id => id.equals(permissionId))) {
      throw new Error('权限不存在');
    }
  }

  /**
   * @private
   * @method validateUserAddition
   * @description 验证用户添加
   * @param userId 用户ID
   */
  private validateUserAddition(userId: Uuid): void {
    if (this._state.users.some(id => id.equals(userId))) {
      throw new Error('用户已存在');
    }

    if (!this.canAddUser()) {
      throw new Error('无法添加更多用户');
    }
  }

  /**
   * @private
   * @method validateUserRemoval
   * @description 验证用户移除
   * @param userId 用户ID
   */
  private validateUserRemoval(userId: Uuid): void {
    if (!this._state.users.some(id => id.equals(userId))) {
      throw new Error('用户不存在');
    }
  }

  /**
   * @private
   * @method validateStatusChange
   * @description 验证状态变更
   * @param newStatus 新状态
   */
  private validateStatusChange(newStatus: OrganizationStatus): void {
    // 验证状态变更逻辑
    if (
      this._state.organization.status === OrganizationStatus.DISABLED &&
      newStatus === OrganizationStatus.ACTIVE
    ) {
      // 从禁用状态激活需要特殊验证
      this.validateActivationFromDisabled();
    }
  }

  /**
   * @private
   * @method validateActivationFromDisabled
   * @description 验证从禁用状态激活
   */
  private validateActivationFromDisabled(): void {
    // 检查是否有未完成的清理任务
    // 检查是否有未处理的账单
    // 检查是否有未解决的安全问题
    // 这里可以添加具体的验证逻辑
  }

  /**
   * @private
   * @method checkLimits
   * @description 检查限制
   */
  private checkLimits(): void {
    const warnings: string[] = [];

    if (
      this._state.statistics.departmentCount >=
      this._state.settings.maxDepartments * 0.9
    ) {
      warnings.push('部门数量接近限制');
    }

    if (
      this._state.statistics.roleCount >=
      this._state.settings.maxRoles * 0.9
    ) {
      warnings.push('角色数量接近限制');
    }

    if (
      this._state.statistics.permissionCount >=
      this._state.settings.maxPermissions * 0.9
    ) {
      warnings.push('权限数量接近限制');
    }

    if (
      this._state.statistics.userCount >=
      this._state.settings.maxUsers * 0.9
    ) {
      warnings.push('用户数量接近限制');
    }

    // 发布警告事件
    if (warnings.length > 0) {
      this.addDomainEvent({
        type: 'OrganizationLimitsWarning',
        organizationId: this._state.organization.id.value,
        warnings,
        timestamp: new Date(),
      });
    }
  }

  /**
   * @private
   * @method addDomainEvent
   * @description 添加领域事件
   * @param event 领域事件
   */
  private addDomainEvent(event: OrganizationDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @static
   * @method create
   * @description 创建组织聚合根
   * @param organization 组织实体
   * @param settings 组织设置
   * @returns {OrganizationAggregate} 组织聚合根
   */
  static create(
    organization: Organization,
    settings: OrganizationAggregateSettings,
  ): OrganizationAggregate {
    return new OrganizationAggregate(organization, settings);
  }
}
