/**
 * @file role-aggregate.ts
 * @description 角色聚合根
 *
 * 该文件定义了角色聚合根，负责管理角色及其相关实体的生命周期和一致性。
 * 角色聚合根是DDD中的核心概念，确保角色边界内的所有实体保持一致状态。
 *
 * 主要功能：
 * 1. 角色生命周期管理
 * 2. 角色权限管理
 * 3. 角色成员管理
 * 4. 角色状态一致性保证
 * 5. 角色事件发布
 * 6. 角色业务规则验证
 *
 * 业务规则：
 * 1. 角色创建时必须设置基本信息和组织
 * 2. 角色状态变更需要验证所有相关权限
 * 3. 角色删除前必须确保所有资源已清理
 * 4. 角色权限变更需要通知相关系统
 */

import { Uuid } from '@aiofix/domain-shared';
import { Role, RoleStatus } from '../entities/role.entity';

/**
 * @interface RoleAggregateSettings
 * @description 角色聚合根设置
 */
export interface RoleAggregateSettings {
  allowPermissionAssignment: boolean;
  allowUserAssignment: boolean;
  allowSubRoleCreation: boolean;
  maxPermissions: number;
  maxUsers: number;
  maxSubRoles: number;
  features: string[];
  customSettings: Record<string, any>;
}

/**
 * @interface RoleAggregateStatistics
 * @description 角色聚合根统计信息
 */
export interface RoleAggregateStatistics {
  permissionCount: number;
  userCount: number;
  subRoleCount: number;
  activeUserCount: number;
  lastActivityAt?: Date;
}

/**
 * @interface RoleDomainEvent
 * @description 角色领域事件
 */
export interface RoleDomainEvent {
  type: string;
  roleId: string;
  timestamp: Date;
  [key: string]: unknown;
}

/**
 * @interface RoleAggregateState
 * @description 角色聚合根状态
 */
export interface RoleAggregateState {
  role: Role;
  settings: RoleAggregateSettings;
  statistics: RoleAggregateStatistics;
  permissions: Uuid[];
  users: Uuid[];
  subRoles: Uuid[];
  lastUpdated: Date;
}

/**
 * @class RoleAggregate
 * @description 角色聚合根
 *
 * 该聚合根负责管理角色及其相关实体的生命周期，
 * 确保角色边界内的所有实体保持一致状态。
 */
export class RoleAggregate {
  private _state: RoleAggregateState;
  private _domainEvents: RoleDomainEvent[] = [];

  /**
   * @constructor
   * @param role 角色实体
   * @param settings 角色设置
   */
  constructor(role: Role, settings: RoleAggregateSettings) {
    this._state = {
      role,
      settings,
      statistics: {
        permissionCount: 0,
        userCount: 0,
        subRoleCount: 0,
        activeUserCount: 0,
      },
      permissions: [],
      users: [],
      subRoles: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * @getter id
   * @description 获取角色ID
   * @returns {Uuid} 角色ID
   */
  get id(): Uuid {
    return this._state.role.id;
  }

  /**
   * @getter role
   * @description 获取角色实体
   * @returns {Role} 角色实体
   */
  get role(): Role {
    return this._state.role;
  }

  /**
   * @getter settings
   * @description 获取角色设置
   * @returns {RoleAggregateSettings} 角色设置
   */
  get settings(): RoleAggregateSettings {
    return { ...this._state.settings };
  }

  /**
   * @getter statistics
   * @description 获取角色统计信息
   * @returns {RoleAggregateStatistics} 统计信息
   */
  get statistics(): RoleAggregateStatistics {
    return { ...this._state.statistics };
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
   * @getter subRoles
   * @description 获取子角色列表
   * @returns {Uuid[]} 子角色ID列表
   */
  get subRoles(): Uuid[] {
    return [...this._state.subRoles];
  }

  /**
   * @getter domainEvents
   * @description 获取领域事件
   * @returns {any[]} 领域事件列表
   */
  get domainEvents(): RoleDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method updateSettings
   * @description 更新角色设置
   * @param settings 新设置
   */
  updateSettings(settings: Partial<RoleAggregateSettings>): void {
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
      type: 'RoleSettingsUpdated',
      roleId: this._state.role.id.value,
      settings: this._state.settings,
      timestamp: new Date(),
    });
  }

  /**
   * @method updateStatistics
   * @description 更新角色统计信息
   * @param statistics 新统计信息
   */
  updateStatistics(statistics: Partial<RoleAggregateStatistics>): void {
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
   * @method assignPermission
   * @description 分配权限给角色
   * @param permissionId 权限ID
   */
  assignPermission(permissionId: Uuid): void {
    // 验证权限分配
    this.validatePermissionAssignment(permissionId);

    // 分配权限
    if (!this._state.permissions.some(id => id.equals(permissionId))) {
      this._state.permissions.push(permissionId);
      this._state.statistics.permissionCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布权限分配事件
    this.addDomainEvent({
      type: 'RolePermissionAssigned',
      roleId: this._state.role.id.value,
      permissionId: permissionId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removePermission
   * @description 从角色移除权限
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
      type: 'RolePermissionRemoved',
      roleId: this._state.role.id.value,
      permissionId: permissionId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method assignUser
   * @description 分配用户给角色
   * @param userId 用户ID
   */
  assignUser(userId: Uuid): void {
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
      type: 'RoleUserAssigned',
      roleId: this._state.role.id.value,
      userId: userId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeUser
   * @description 从角色移除用户
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
      type: 'RoleUserRemoved',
      roleId: this._state.role.id.value,
      userId: userId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method addSubRole
   * @description 添加子角色
   * @param subRoleId 子角色ID
   */
  addSubRole(subRoleId: Uuid): void {
    // 验证子角色添加
    this.validateSubRoleAddition(subRoleId);

    // 添加子角色
    if (!this._state.subRoles.some(id => id.equals(subRoleId))) {
      this._state.subRoles.push(subRoleId);
      this._state.statistics.subRoleCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布子角色添加事件
    this.addDomainEvent({
      type: 'RoleSubRoleAdded',
      roleId: this._state.role.id.value,
      subRoleId: subRoleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeSubRole
   * @description 移除子角色
   * @param subRoleId 子角色ID
   */
  removeSubRole(subRoleId: Uuid): void {
    // 验证子角色移除
    this.validateSubRoleRemoval(subRoleId);

    // 移除子角色
    this._state.subRoles = this._state.subRoles.filter(
      id => !id.equals(subRoleId),
    );
    this._state.statistics.subRoleCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布子角色移除事件
    this.addDomainEvent({
      type: 'RoleSubRoleRemoved',
      roleId: this._state.role.id.value,
      subRoleId: subRoleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method changeStatus
   * @description 变更角色状态
   * @param newStatus 新状态
   * @param reason 变更原因
   */
  changeStatus(newStatus: RoleStatus, reason?: string): void {
    // 验证状态变更
    this.validateStatusChange(newStatus);

    // 变更状态
    switch (newStatus) {
      case RoleStatus.ACTIVE:
        this._state.role.activate();
        break;
      case RoleStatus.SUSPENDED:
        this._state.role.suspend();
        break;
      case RoleStatus.DISABLED:
        this._state.role.disable();
        break;
      default:
        throw new Error(`不支持的角色状态: ${String(newStatus)}`);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布状态变更事件
    this.addDomainEvent({
      type: 'RoleStatusChanged',
      roleId: this._state.role.id.value,
      oldStatus: this._state.role.status,
      newStatus,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * @method canAssignPermission
   * @description 检查是否可以分配权限
   * @returns {boolean} 是否可以分配权限
   */
  canAssignPermission(): boolean {
    return (
      this._state.settings.allowPermissionAssignment &&
      this._state.statistics.permissionCount <
        this._state.settings.maxPermissions
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
   * @method canAddSubRole
   * @description 检查是否可以添加子角色
   * @returns {boolean} 是否可以添加子角色
   */
  canAddSubRole(): boolean {
    return (
      this._state.settings.allowSubRoleCreation &&
      this._state.statistics.subRoleCount < this._state.settings.maxSubRoles
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
   * @method hasPermission
   * @description 检查是否有指定权限
   * @param permissionId 权限ID
   * @returns {boolean} 是否有权限
   */
  hasPermission(permissionId: Uuid): boolean {
    return this._state.permissions.some(id => id.equals(permissionId));
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
   * @method hasSubRole
   * @description 检查是否有指定子角色
   * @param subRoleId 子角色ID
   * @returns {boolean} 是否有子角色
   */
  hasSubRole(subRoleId: Uuid): boolean {
    return this._state.subRoles.some(id => id.equals(subRoleId));
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
    settings: Partial<RoleAggregateSettings>,
  ): void {
    // 验证限制不能小于当前数量
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

    if (
      settings.maxSubRoles !== undefined &&
      settings.maxSubRoles < this._state.statistics.subRoleCount
    ) {
      throw new Error(
        `子角色数量限制不能小于当前子角色数量: ${this._state.statistics.subRoleCount}`,
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
    statistics: Partial<RoleAggregateStatistics>,
  ): void {
    // 验证统计信息不能为负数
    if (
      statistics.permissionCount !== undefined &&
      statistics.permissionCount < 0
    ) {
      throw new Error('权限数量不能为负数');
    }

    if (statistics.userCount !== undefined && statistics.userCount < 0) {
      throw new Error('用户数量不能为负数');
    }

    if (statistics.subRoleCount !== undefined && statistics.subRoleCount < 0) {
      throw new Error('子角色数量不能为负数');
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
   * @method validatePermissionAssignment
   * @description 验证权限分配
   * @param permissionId 权限ID
   */
  private validatePermissionAssignment(permissionId: Uuid): void {
    if (this._state.permissions.some(id => id.equals(permissionId))) {
      throw new Error('权限已分配');
    }

    if (!this.canAssignPermission()) {
      throw new Error('无法分配更多权限');
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
      throw new Error('权限未分配');
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
   * @method validateSubRoleAddition
   * @description 验证子角色添加
   * @param subRoleId 子角色ID
   */
  private validateSubRoleAddition(subRoleId: Uuid): void {
    if (this._state.subRoles.some(id => id.equals(subRoleId))) {
      throw new Error('子角色已存在');
    }

    if (!this.canAddSubRole()) {
      throw new Error('无法添加更多子角色');
    }
  }

  /**
   * @private
   * @method validateSubRoleRemoval
   * @description 验证子角色移除
   * @param subRoleId 子角色ID
   */
  private validateSubRoleRemoval(subRoleId: Uuid): void {
    if (!this._state.subRoles.some(id => id.equals(subRoleId))) {
      throw new Error('子角色不存在');
    }
  }

  /**
   * @private
   * @method validateStatusChange
   * @description 验证状态变更
   * @param newStatus 新状态
   */
  private validateStatusChange(newStatus: RoleStatus): void {
    // 验证状态变更逻辑
    if (
      this._state.role.status === RoleStatus.DISABLED &&
      newStatus === RoleStatus.ACTIVE
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

    if (
      this._state.statistics.subRoleCount >=
      this._state.settings.maxSubRoles * 0.9
    ) {
      warnings.push('子角色数量接近限制');
    }

    // 发布警告事件
    if (warnings.length > 0) {
      this.addDomainEvent({
        type: 'RoleLimitsWarning',
        roleId: this._state.role.id.value,
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
  private addDomainEvent(event: RoleDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @static
   * @method create
   * @description 创建角色聚合根
   * @param role 角色实体
   * @param settings 角色设置
   * @returns {RoleAggregate} 角色聚合根
   */
  static create(role: Role, settings: RoleAggregateSettings): RoleAggregate {
    return new RoleAggregate(role, settings);
  }
}
