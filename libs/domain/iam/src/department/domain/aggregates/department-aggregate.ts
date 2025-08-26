/**
 * @file department-aggregate.ts
 * @description 部门聚合根
 *
 * 该文件定义了部门聚合根，负责管理部门及其相关实体的生命周期和一致性。
 * 部门聚合根是DDD中的核心概念，确保部门边界内的所有实体保持一致状态。
 *
 * 主要功能：
 * 1. 部门生命周期管理
 * 2. 部门层级管理
 * 3. 部门状态一致性保证
 * 4. 部门事件发布
 * 5. 部门业务规则验证
 *
 * 业务规则：
 * 1. 部门创建时必须设置基本信息和组织
 * 2. 部门状态变更需要验证所有子实体状态
 * 3. 部门删除前必须确保所有资源已清理
 * 4. 部门层级变更需要通知相关实体
 */

import { Uuid } from '@aiofix/domain-shared';
import { Department, DepartmentStatus } from '../entities/department.entity';

/**
 * @interface DepartmentAggregateSettings
 * @description 部门聚合根设置
 */
export interface DepartmentAggregateSettings {
  allowSubDepartmentCreation: boolean;
  allowUserAssignment: boolean;
  allowRoleAssignment: boolean;
  maxSubDepartments: number;
  maxUsers: number;
  maxRoles: number;
  features: string[];
  customSettings: Record<string, any>;
}

/**
 * @interface DepartmentAggregateStatistics
 * @description 部门聚合根统计信息
 */
export interface DepartmentAggregateStatistics {
  subDepartmentCount: number;
  userCount: number;
  roleCount: number;
  activeUserCount: number;
  lastActivityAt?: Date;
}

/**
 * @interface DepartmentDomainEvent
 * @description 部门领域事件
 */
export interface DepartmentDomainEvent {
  type: string;
  departmentId: string;
  timestamp: Date;
  [key: string]: unknown;
}

/**
 * @interface DepartmentAggregateState
 * @description 部门聚合根状态
 */
export interface DepartmentAggregateState {
  department: Department;
  settings: DepartmentAggregateSettings;
  statistics: DepartmentAggregateStatistics;
  subDepartments: Uuid[];
  users: Uuid[];
  roles: Uuid[];
  lastUpdated: Date;
}

/**
 * @class DepartmentAggregate
 * @description 部门聚合根
 *
 * 该聚合根负责管理部门及其相关实体的生命周期，
 * 确保部门边界内的所有实体保持一致状态。
 */
export class DepartmentAggregate {
  private _state: DepartmentAggregateState;
  private _domainEvents: DepartmentDomainEvent[] = [];

  /**
   * @constructor
   * @param department 部门实体
   * @param settings 部门设置
   */
  constructor(department: Department, settings: DepartmentAggregateSettings) {
    this._state = {
      department,
      settings,
      statistics: {
        subDepartmentCount: 0,
        userCount: 0,
        roleCount: 0,
        activeUserCount: 0,
      },
      subDepartments: [],
      users: [],
      roles: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * @getter id
   * @description 获取部门ID
   * @returns {Uuid} 部门ID
   */
  get id(): Uuid {
    return this._state.department.id;
  }

  /**
   * @getter department
   * @description 获取部门实体
   * @returns {Department} 部门实体
   */
  get department(): Department {
    return this._state.department;
  }

  /**
   * @getter settings
   * @description 获取部门设置
   * @returns {DepartmentAggregateSettings} 部门设置
   */
  get settings(): DepartmentAggregateSettings {
    return { ...this._state.settings };
  }

  /**
   * @getter statistics
   * @description 获取部门统计信息
   * @returns {DepartmentAggregateStatistics} 统计信息
   */
  get statistics(): DepartmentAggregateStatistics {
    return { ...this._state.statistics };
  }

  /**
   * @getter subDepartments
   * @description 获取子部门列表
   * @returns {Uuid[]} 子部门ID列表
   */
  get subDepartments(): Uuid[] {
    return [...this._state.subDepartments];
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
   * @getter roles
   * @description 获取角色列表
   * @returns {Uuid[]} 角色ID列表
   */
  get roles(): Uuid[] {
    return [...this._state.roles];
  }

  /**
   * @getter domainEvents
   * @description 获取领域事件
   * @returns {any[]} 领域事件列表
   */
  get domainEvents(): DepartmentDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method updateSettings
   * @description 更新部门设置
   * @param settings 新设置
   */
  updateSettings(settings: Partial<DepartmentAggregateSettings>): void {
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
      type: 'DepartmentSettingsUpdated',
      departmentId: this._state.department.id.value,
      settings: this._state.settings,
      timestamp: new Date(),
    });
  }

  /**
   * @method updateStatistics
   * @description 更新部门统计信息
   * @param statistics 新统计信息
   */
  updateStatistics(statistics: Partial<DepartmentAggregateStatistics>): void {
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
   * @method addSubDepartment
   * @description 添加子部门
   * @param subDepartmentId 子部门ID
   */
  addSubDepartment(subDepartmentId: Uuid): void {
    // 验证子部门添加
    this.validateSubDepartmentAddition(subDepartmentId);

    // 添加子部门
    if (!this._state.subDepartments.some(id => id.equals(subDepartmentId))) {
      this._state.subDepartments.push(subDepartmentId);
      this._state.statistics.subDepartmentCount++;
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布子部门添加事件
    this.addDomainEvent({
      type: 'DepartmentSubDepartmentAdded',
      departmentId: this._state.department.id.value,
      subDepartmentId: subDepartmentId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeSubDepartment
   * @description 移除子部门
   * @param subDepartmentId 子部门ID
   */
  removeSubDepartment(subDepartmentId: Uuid): void {
    // 验证子部门移除
    this.validateSubDepartmentRemoval(subDepartmentId);

    // 移除子部门
    this._state.subDepartments = this._state.subDepartments.filter(
      id => !id.equals(subDepartmentId),
    );
    this._state.statistics.subDepartmentCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布子部门移除事件
    this.addDomainEvent({
      type: 'DepartmentSubDepartmentRemoved',
      departmentId: this._state.department.id.value,
      subDepartmentId: subDepartmentId.value,
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
      type: 'DepartmentUserAdded',
      departmentId: this._state.department.id.value,
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
      type: 'DepartmentUserRemoved',
      departmentId: this._state.department.id.value,
      userId: userId.value,
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
      type: 'DepartmentRoleAdded',
      departmentId: this._state.department.id.value,
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
      type: 'DepartmentRoleRemoved',
      departmentId: this._state.department.id.value,
      roleId: roleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method changeStatus
   * @description 变更部门状态
   * @param newStatus 新状态
   * @param reason 变更原因
   */
  changeStatus(newStatus: DepartmentStatus, reason?: string): void {
    // 验证状态变更
    this.validateStatusChange(newStatus);

    // 变更状态
    switch (newStatus) {
      case DepartmentStatus.ACTIVE:
        this._state.department.activate();
        break;
      case DepartmentStatus.SUSPENDED:
        this._state.department.suspend();
        break;
      case DepartmentStatus.DISABLED:
        this._state.department.disable();
        break;
      default:
        throw new Error(`不支持的部门状态: ${String(newStatus)}`);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布状态变更事件
    this.addDomainEvent({
      type: 'DepartmentStatusChanged',
      departmentId: this._state.department.id.value,
      oldStatus: this._state.department.status,
      newStatus,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * @method canAddSubDepartment
   * @description 检查是否可以添加子部门
   * @returns {boolean} 是否可以添加子部门
   */
  canAddSubDepartment(): boolean {
    return (
      this._state.settings.allowSubDepartmentCreation &&
      this._state.statistics.subDepartmentCount <
        this._state.settings.maxSubDepartments
    );
  }

  /**
   * @method canAddUser
   * @description 检查是否可以添加用户
   * @returns {boolean} 是否可以添加用户
   */
  canAddUser(): boolean {
    return (
      this._state.settings.allowUserAssignment &&
      this._state.statistics.userCount < this._state.settings.maxUsers
    );
  }

  /**
   * @method canAddRole
   * @description 检查是否可以添加角色
   * @returns {boolean} 是否可以添加角色
   */
  canAddRole(): boolean {
    return (
      this._state.settings.allowRoleAssignment &&
      this._state.statistics.roleCount < this._state.settings.maxRoles
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
   * @method hasUser
   * @description 检查是否有指定用户
   * @param userId 用户ID
   * @returns {boolean} 是否有用户
   */
  hasUser(userId: Uuid): boolean {
    return this._state.users.some(id => id.equals(userId));
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
    settings: Partial<DepartmentAggregateSettings>,
  ): void {
    // 验证限制不能小于当前数量
    if (
      settings.maxSubDepartments !== undefined &&
      settings.maxSubDepartments < this._state.statistics.subDepartmentCount
    ) {
      throw new Error(
        `子部门数量限制不能小于当前子部门数量: ${this._state.statistics.subDepartmentCount}`,
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
      settings.maxRoles !== undefined &&
      settings.maxRoles < this._state.statistics.roleCount
    ) {
      throw new Error(
        `角色数量限制不能小于当前角色数量: ${this._state.statistics.roleCount}`,
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
    statistics: Partial<DepartmentAggregateStatistics>,
  ): void {
    // 验证统计信息不能为负数
    if (
      statistics.subDepartmentCount !== undefined &&
      statistics.subDepartmentCount < 0
    ) {
      throw new Error('子部门数量不能为负数');
    }

    if (statistics.userCount !== undefined && statistics.userCount < 0) {
      throw new Error('用户数量不能为负数');
    }

    if (statistics.roleCount !== undefined && statistics.roleCount < 0) {
      throw new Error('角色数量不能为负数');
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
   * @method validateSubDepartmentAddition
   * @description 验证子部门添加
   * @param subDepartmentId 子部门ID
   */
  private validateSubDepartmentAddition(subDepartmentId: Uuid): void {
    if (this._state.subDepartments.some(id => id.equals(subDepartmentId))) {
      throw new Error('子部门已存在');
    }

    if (!this.canAddSubDepartment()) {
      throw new Error('无法添加更多子部门');
    }
  }

  /**
   * @private
   * @method validateSubDepartmentRemoval
   * @description 验证子部门移除
   * @param subDepartmentId 子部门ID
   */
  private validateSubDepartmentRemoval(subDepartmentId: Uuid): void {
    if (!this._state.subDepartments.some(id => id.equals(subDepartmentId))) {
      throw new Error('子部门不存在');
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
   * @method validateStatusChange
   * @description 验证状态变更
   * @param newStatus 新状态
   */
  private validateStatusChange(newStatus: DepartmentStatus): void {
    // 验证状态变更逻辑
    if (
      this._state.department.status === DepartmentStatus.DISABLED &&
      newStatus === DepartmentStatus.ACTIVE
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
      this._state.statistics.subDepartmentCount >=
      this._state.settings.maxSubDepartments * 0.9
    ) {
      warnings.push('子部门数量接近限制');
    }

    if (
      this._state.statistics.userCount >=
      this._state.settings.maxUsers * 0.9
    ) {
      warnings.push('用户数量接近限制');
    }

    if (
      this._state.statistics.roleCount >=
      this._state.settings.maxRoles * 0.9
    ) {
      warnings.push('角色数量接近限制');
    }

    // 发布警告事件
    if (warnings.length > 0) {
      this.addDomainEvent({
        type: 'DepartmentLimitsWarning',
        departmentId: this._state.department.id.value,
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
  private addDomainEvent(event: DepartmentDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @static
   * @method create
   * @description 创建部门聚合根
   * @param department 部门实体
   * @param settings 部门设置
   * @returns {DepartmentAggregate} 部门聚合根
   */
  static create(
    department: Department,
    settings: DepartmentAggregateSettings,
  ): DepartmentAggregate {
    return new DepartmentAggregate(department, settings);
  }
}
