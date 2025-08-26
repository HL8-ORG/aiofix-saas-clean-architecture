/**
 * @file permission-aggregate.ts
 * @description 权限聚合根
 *
 * 该文件定义了权限聚合根，负责管理权限及其相关实体的生命周期和一致性。
 * 权限聚合根是DDD中的核心概念，确保权限边界内的所有实体保持一致状态。
 *
 * 主要功能：
 * 1. 权限生命周期管理
 * 2. 权限资源管理
 * 3. 权限分配管理
 * 4. 权限状态一致性保证
 * 5. 权限事件发布
 * 6. 权限业务规则验证
 *
 * 业务规则：
 * 1. 权限创建时必须设置基本信息和资源
 * 2. 权限状态变更需要验证所有相关分配
 * 3. 权限删除前必须确保所有资源已清理
 * 4. 权限分配变更需要通知相关系统
 */

import { Uuid } from '@aiofix/domain-shared';
import { Permission, PermissionStatus } from '../entities/permission.entity';

/**
 * @interface PermissionAggregateSettings
 * @description 权限聚合根设置
 */
export interface PermissionAggregateSettings {
  allowRoleAssignment: boolean;
  allowUserAssignment: boolean;
  allowSubPermissionCreation: boolean;
  maxRoles: number;
  maxUsers: number;
  maxSubPermissions: number;
  features: string[];
  customSettings: Record<string, any>;
}

/**
 * @interface PermissionAggregateStatistics
 * @description 权限聚合根统计信息
 */
export interface PermissionAggregateStatistics {
  roleCount: number;
  userCount: number;
  subPermissionCount: number;
  activeUserCount: number;
  lastActivityAt?: Date;
}

/**
 * @interface PermissionDomainEvent
 * @description 权限领域事件
 */
export interface PermissionDomainEvent {
  type: string;
  permissionId: string;
  timestamp: Date;
  [key: string]: unknown;
}

/**
 * @interface PermissionAggregateState
 * @description 权限聚合根状态
 */
export interface PermissionAggregateState {
  permission: Permission;
  settings: PermissionAggregateSettings;
  statistics: PermissionAggregateStatistics;
  roles: Uuid[];
  users: Uuid[];
  subPermissions: Uuid[];
  lastUpdated: Date;
}

/**
 * @class PermissionAggregate
 * @description 权限聚合根
 *
 * 该聚合根负责管理权限及其相关实体的生命周期，
 * 确保权限边界内的所有实体保持一致状态。
 */
export class PermissionAggregate {
  private _state: PermissionAggregateState;
  private _domainEvents: PermissionDomainEvent[] = [];

  /**
   * @constructor
   * @param permission 权限实体
   * @param settings 权限设置
   */
  constructor(permission: Permission, settings: PermissionAggregateSettings) {
    this._state = {
      permission,
      settings,
      statistics: {
        roleCount: 0,
        userCount: 0,
        subPermissionCount: 0,
        activeUserCount: 0,
      },
      roles: [],
      users: [],
      subPermissions: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * @getter id
   * @description 获取权限ID
   * @returns {Uuid} 权限ID
   */
  get id(): Uuid {
    return this._state.permission.id;
  }

  /**
   * @getter permission
   * @description 获取权限实体
   * @returns {Permission} 权限实体
   */
  get permission(): Permission {
    return this._state.permission;
  }

  /**
   * @getter settings
   * @description 获取权限设置
   * @returns {PermissionAggregateSettings} 权限设置
   */
  get settings(): PermissionAggregateSettings {
    return { ...this._state.settings };
  }

  /**
   * @getter statistics
   * @description 获取权限统计信息
   * @returns {PermissionAggregateStatistics} 统计信息
   */
  get statistics(): PermissionAggregateStatistics {
    return { ...this._state.statistics };
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
   * @getter users
   * @description 获取用户列表
   * @returns {Uuid[]} 用户ID列表
   */
  get users(): Uuid[] {
    return [...this._state.users];
  }

  /**
   * @getter subPermissions
   * @description 获取子权限列表
   * @returns {Uuid[]} 子权限ID列表
   */
  get subPermissions(): Uuid[] {
    return [...this._state.subPermissions];
  }

  /**
   * @getter domainEvents
   * @description 获取领域事件
   * @returns {any[]} 领域事件列表
   */
  get domainEvents(): PermissionDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method updateSettings
   * @description 更新权限设置
   * @param settings 新设置
   */
  updateSettings(settings: Partial<PermissionAggregateSettings>): void {
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
      type: 'PermissionSettingsUpdated',
      permissionId: this._state.permission.id.value,
      settings: this._state.settings,
      timestamp: new Date(),
    });
  }

  /**
   * @method updateStatistics
   * @description 更新权限统计信息
   * @param statistics 新统计信息
   */
  updateStatistics(statistics: Partial<PermissionAggregateStatistics>): void {
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
   * @method assignToRole
   * @description 分配权限给角色
   * @param roleId 角色ID
   */
  assignToRole(roleId: Uuid): void {
    // 验证角色分配
    this.validateRoleAssignment(roleId);

    // 分配角色
    if (!this._state.roles.some(id => id.equals(roleId))) {
      this._state.roles.push(roleId);
      this._state.statistics.roleCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布角色分配事件
    this.addDomainEvent({
      type: 'PermissionRoleAssigned',
      permissionId: this._state.permission.id.value,
      roleId: roleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeFromRole
   * @description 从角色移除权限
   * @param roleId 角色ID
   */
  removeFromRole(roleId: Uuid): void {
    // 验证角色移除
    this.validateRoleRemoval(roleId);

    // 移除角色
    this._state.roles = this._state.roles.filter(id => !id.equals(roleId));
    this._state.statistics.roleCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布角色移除事件
    this.addDomainEvent({
      type: 'PermissionRoleRemoved',
      permissionId: this._state.permission.id.value,
      roleId: roleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method assignToUser
   * @description 分配权限给用户
   * @param userId 用户ID
   */
  assignToUser(userId: Uuid): void {
    // 验证用户分配
    this.validateUserAssignment(userId);

    // 分配用户
    if (!this._state.users.some(id => id.equals(userId))) {
      this._state.users.push(userId);
      this._state.statistics.userCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布用户分配事件
    this.addDomainEvent({
      type: 'PermissionUserAssigned',
      permissionId: this._state.permission.id.value,
      userId: userId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeFromUser
   * @description 从用户移除权限
   * @param userId 用户ID
   */
  removeFromUser(userId: Uuid): void {
    // 验证用户移除
    this.validateUserRemoval(userId);

    // 移除用户
    this._state.users = this._state.users.filter(id => !id.equals(userId));
    this._state.statistics.userCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布用户移除事件
    this.addDomainEvent({
      type: 'PermissionUserRemoved',
      permissionId: this._state.permission.id.value,
      userId: userId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method addSubPermission
   * @description 添加子权限
   * @param subPermissionId 子权限ID
   */
  addSubPermission(subPermissionId: Uuid): void {
    // 验证子权限添加
    this.validateSubPermissionAddition(subPermissionId);

    // 添加子权限
    if (!this._state.subPermissions.some(id => id.equals(subPermissionId))) {
      this._state.subPermissions.push(subPermissionId);
      this._state.statistics.subPermissionCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布子权限添加事件
    this.addDomainEvent({
      type: 'PermissionSubPermissionAdded',
      permissionId: this._state.permission.id.value,
      subPermissionId: subPermissionId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeSubPermission
   * @description 移除子权限
   * @param subPermissionId 子权限ID
   */
  removeSubPermission(subPermissionId: Uuid): void {
    // 验证子权限移除
    this.validateSubPermissionRemoval(subPermissionId);

    // 移除子权限
    this._state.subPermissions = this._state.subPermissions.filter(
      id => !id.equals(subPermissionId),
    );
    this._state.statistics.subPermissionCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布子权限移除事件
    this.addDomainEvent({
      type: 'PermissionSubPermissionRemoved',
      permissionId: this._state.permission.id.value,
      subPermissionId: subPermissionId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method changeStatus
   * @description 变更权限状态
   * @param newStatus 新状态
   * @param reason 变更原因
   */
  changeStatus(newStatus: PermissionStatus, reason?: string): void {
    // 验证状态变更
    this.validateStatusChange(newStatus);

    // 变更状态
    switch (newStatus) {
      case PermissionStatus.ACTIVE:
        this._state.permission.activate();
        break;
      case PermissionStatus.SUSPENDED:
        this._state.permission.suspend();
        break;
      case PermissionStatus.DISABLED:
        this._state.permission.disable();
        break;
      default:
        throw new Error(`不支持的权限状态: ${String(newStatus)}`);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布状态变更事件
    this.addDomainEvent({
      type: 'PermissionStatusChanged',
      permissionId: this._state.permission.id.value,
      oldStatus: this._state.permission.status,
      newStatus,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * @method canAssignRole
   * @description 检查是否可以分配角色
   * @returns {boolean} 是否可以分配角色
   */
  canAssignRole(): boolean {
    return (
      this._state.settings.allowRoleAssignment &&
      this._state.statistics.roleCount < this._state.settings.maxRoles
    );
  }

  /**
   * @method canAssignUser
   * @description 检查是否可以分配用户
   * @returns {boolean} 是否可以分配用户
   */
  canAssignUser(): boolean {
    return (
      this._state.settings.allowUserAssignment &&
      this._state.statistics.userCount < this._state.settings.maxUsers
    );
  }

  /**
   * @method canAddSubPermission
   * @description 检查是否可以添加子权限
   * @returns {boolean} 是否可以添加子权限
   */
  canAddSubPermission(): boolean {
    return (
      this._state.settings.allowSubPermissionCreation &&
      this._state.statistics.subPermissionCount <
        this._state.settings.maxSubPermissions
    );
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
   * @method hasRole
   * @description 检查是否有指定角色
   * @param roleId 角色ID
   * @returns {boolean} 是否有角色
   */
  hasRole(roleId: Uuid): boolean {
    return this._state.roles.some(id => id.equals(roleId));
  }

  /**
   * @method hasUser
   * @description 检查是否有指定用户
   * @param userId 用户ID
   * @returns {boolean} 是否有用户
   */
  hasUser(userId: Uuid): boolean {
    return this._state.users.some(id => id.equals(userId));
  }

  /**
   * @method hasSubPermission
   * @description 检查是否有指定子权限
   * @param subPermissionId 子权限ID
   * @returns {boolean} 是否有子权限
   */
  hasSubPermission(subPermissionId: Uuid): boolean {
    return this._state.subPermissions.some(id => id.equals(subPermissionId));
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
    settings: Partial<PermissionAggregateSettings>,
  ): void {
    // 验证限制不能小于当前数量
    if (
      settings.maxRoles !== undefined &&
      settings.maxRoles < this._state.statistics.roleCount
    ) {
      throw new Error(
        `角色数量限制不能小于当前角色数量: ${this._state.statistics.roleCount}`,
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

    if (
      settings.maxSubPermissions !== undefined &&
      settings.maxSubPermissions < this._state.statistics.subPermissionCount
    ) {
      throw new Error(
        `子权限数量限制不能小于当前子权限数量: ${this._state.statistics.subPermissionCount}`,
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
    statistics: Partial<PermissionAggregateStatistics>,
  ): void {
    // 验证统计信息不能为负数
    if (statistics.roleCount !== undefined && statistics.roleCount < 0) {
      throw new Error('角色数量不能为负数');
    }

    if (statistics.userCount !== undefined && statistics.userCount < 0) {
      throw new Error('用户数量不能为负数');
    }

    if (
      statistics.subPermissionCount !== undefined &&
      statistics.subPermissionCount < 0
    ) {
      throw new Error('子权限数量不能为负数');
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
   * @method validateRoleAssignment
   * @description 验证角色分配
   * @param roleId 角色ID
   */
  private validateRoleAssignment(roleId: Uuid): void {
    if (this._state.roles.some(id => id.equals(roleId))) {
      throw new Error('角色已分配');
    }

    if (!this.canAssignRole()) {
      throw new Error('无法分配更多角色');
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
      throw new Error('角色未分配');
    }
  }

  /**
   * @private
   * @method validateUserAssignment
   * @description 验证用户分配
   * @param userId 用户ID
   */
  private validateUserAssignment(userId: Uuid): void {
    if (this._state.users.some(id => id.equals(userId))) {
      throw new Error('用户已分配');
    }

    if (!this.canAssignUser()) {
      throw new Error('无法分配更多用户');
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
      throw new Error('用户未分配');
    }
  }

  /**
   * @private
   * @method validateSubPermissionAddition
   * @description 验证子权限添加
   * @param subPermissionId 子权限ID
   */
  private validateSubPermissionAddition(subPermissionId: Uuid): void {
    if (this._state.subPermissions.some(id => id.equals(subPermissionId))) {
      throw new Error('子权限已存在');
    }

    if (!this.canAddSubPermission()) {
      throw new Error('无法添加更多子权限');
    }
  }

  /**
   * @private
   * @method validateSubPermissionRemoval
   * @description 验证子权限移除
   * @param subPermissionId 子权限ID
   */
  private validateSubPermissionRemoval(subPermissionId: Uuid): void {
    if (!this._state.subPermissions.some(id => id.equals(subPermissionId))) {
      throw new Error('子权限不存在');
    }
  }

  /**
   * @private
   * @method validateStatusChange
   * @description 验证状态变更
   * @param newStatus 新状态
   */
  private validateStatusChange(newStatus: PermissionStatus): void {
    // 验证状态变更逻辑
    if (
      this._state.permission.status === PermissionStatus.DISABLED &&
      newStatus === PermissionStatus.ACTIVE
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
    // 检查是否有未处理的安全问题
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
      this._state.statistics.roleCount >=
      this._state.settings.maxRoles * 0.9
    ) {
      warnings.push('角色数量接近限制');
    }

    if (
      this._state.statistics.userCount >=
      this._state.settings.maxUsers * 0.9
    ) {
      warnings.push('用户数量接近限制');
    }

    if (
      this._state.statistics.subPermissionCount >=
      this._state.settings.maxSubPermissions * 0.9
    ) {
      warnings.push('子权限数量接近限制');
    }

    // 发布警告事件
    if (warnings.length > 0) {
      this.addDomainEvent({
        type: 'PermissionLimitsWarning',
        permissionId: this._state.permission.id.value,
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
  private addDomainEvent(event: PermissionDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @static
   * @method create
   * @description 创建权限聚合根
   * @param permission 权限实体
   * @param settings 权限设置
   * @returns {PermissionAggregate} 权限聚合根
   */
  static create(
    permission: Permission,
    settings: PermissionAggregateSettings,
  ): PermissionAggregate {
    return new PermissionAggregate(permission, settings);
  }
}
