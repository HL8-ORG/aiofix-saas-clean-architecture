/**
 * @file tenant-aggregate.ts
 * @description 租户聚合根
 *
 * 该文件定义了租户聚合根，负责管理租户及其相关实体的生命周期和一致性。
 * 租户聚合根是DDD中的核心概念，确保租户边界内的所有实体保持一致状态。
 *
 * 主要功能：
 * 1. 租户生命周期管理
 * 2. 租户配置管理
 * 3. 租户状态一致性保证
 * 4. 租户事件发布
 * 5. 租户业务规则验证
 *
 * 业务规则：
 * 1. 租户创建时必须设置基本配置
 * 2. 租户状态变更需要验证所有子实体状态
 * 3. 租户删除前必须确保所有资源已清理
 * 4. 租户配置变更需要通知相关实体
 */

import { Uuid } from '@aiofix/domain-shared';
import { Tenant, TenantStatus } from '../entities/tenant.entity';

/**
 * @interface TenantConfiguration
 * @description 租户配置
 */
export interface TenantConfiguration {
  maxUsers: number;
  maxOrganizations: number;
  maxDepartments: number;
  maxRoles: number;
  maxPermissions: number;
  storageLimit: number; // MB
  features: string[];
  settings: Record<string, any>;
}

/**
 * @interface TenantDomainEvent
 * @description 租户领域事件
 */
export interface TenantDomainEvent {
  type: string;
  tenantId: string;
  timestamp: Date;
  [key: string]: unknown;
}

/**
 * @interface TenantAggregateState
 * @description 租户聚合根状态
 */
export interface TenantAggregateState {
  tenant: Tenant;
  configuration: TenantConfiguration;
  statistics: {
    userCount: number;
    organizationCount: number;
    departmentCount: number;
    roleCount: number;
    permissionCount: number;
    storageUsed: number;
  };
  lastUpdated: Date;
}

/**
 * @class TenantAggregate
 * @description 租户聚合根
 *
 * 该聚合根负责管理租户及其相关实体的生命周期，
 * 确保租户边界内的所有实体保持一致状态。
 */
export class TenantAggregate {
  private _state: TenantAggregateState;
  private _domainEvents: TenantDomainEvent[] = [];

  /**
   * @constructor
   * @param tenant 租户实体
   * @param configuration 租户配置
   */
  constructor(tenant: Tenant, configuration: TenantConfiguration) {
    this._state = {
      tenant,
      configuration,
      statistics: {
        userCount: 0,
        organizationCount: 0,
        departmentCount: 0,
        roleCount: 0,
        permissionCount: 0,
        storageUsed: 0,
      },
      lastUpdated: new Date(),
    };
  }

  /**
   * @getter id
   * @description 获取租户ID
   * @returns {Uuid} 租户ID
   */
  get id(): Uuid {
    return this._state.tenant.id;
  }

  /**
   * @getter tenant
   * @description 获取租户实体
   * @returns {Tenant} 租户实体
   */
  get tenant(): Tenant {
    return this._state.tenant;
  }

  /**
   * @getter configuration
   * @description 获取租户配置
   * @returns {TenantConfiguration} 租户配置
   */
  get configuration(): TenantConfiguration {
    return { ...this._state.configuration };
  }

  /**
   * @getter statistics
   * @description 获取租户统计信息
   * @returns {TenantAggregateState['statistics']} 统计信息
   */
  get statistics(): TenantAggregateState['statistics'] {
    return { ...this._state.statistics };
  }

  /**
   * @getter domainEvents
   * @description 获取领域事件
   * @returns {any[]} 领域事件列表
   */
  get domainEvents(): TenantDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method updateConfiguration
   * @description 更新租户配置
   * @param configuration 新配置
   */
  updateConfiguration(configuration: Partial<TenantConfiguration>): void {
    // 验证配置变更
    this.validateConfigurationUpdate(configuration);

    // 更新配置
    this._state.configuration = {
      ...this._state.configuration,
      ...configuration,
    };

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布配置变更事件
    this.addDomainEvent({
      type: 'TenantConfigurationUpdated',
      tenantId: this._state.tenant.id.value,
      configuration: this._state.configuration,
      timestamp: new Date(),
    });
  }

  /**
   * @method updateStatistics
   * @description 更新租户统计信息
   * @param statistics 新统计信息
   */
  updateStatistics(
    statistics: Partial<TenantAggregateState['statistics']>,
  ): void {
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
   * @method changeStatus
   * @description 变更租户状态
   * @param newStatus 新状态
   * @param reason 变更原因
   */
  changeStatus(newStatus: TenantStatus, reason?: string): void {
    // 验证状态变更
    this.validateStatusChange(newStatus);

    // 变更状态
    switch (newStatus) {
      case TenantStatus.ACTIVE:
        this._state.tenant.activate();
        break;
      case TenantStatus.SUSPENDED:
        this._state.tenant.suspend();
        break;
      case TenantStatus.DISABLED:
        this._state.tenant.disable();
        break;
      default:
        throw new Error(`不支持的租户状态: ${String(newStatus)}`);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布状态变更事件
    this.addDomainEvent({
      type: 'TenantStatusChanged',
      tenantId: this._state.tenant.id.value,
      oldStatus: this._state.tenant.status,
      newStatus,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * @method canAddUser
   * @description 检查是否可以添加用户
   * @returns {boolean} 是否可以添加用户
   */
  canAddUser(): boolean {
    return (
      this._state.statistics.userCount < this._state.configuration.maxUsers
    );
  }

  /**
   * @method canAddOrganization
   * @description 检查是否可以添加组织
   * @returns {boolean} 是否可以添加组织
   */
  canAddOrganization(): boolean {
    return (
      this._state.statistics.organizationCount <
      this._state.configuration.maxOrganizations
    );
  }

  /**
   * @method canAddDepartment
   * @description 检查是否可以添加部门
   * @returns {boolean} 是否可以添加部门
   */
  canAddDepartment(): boolean {
    return (
      this._state.statistics.departmentCount <
      this._state.configuration.maxDepartments
    );
  }

  /**
   * @method canAddRole
   * @description 检查是否可以添加角色
   * @returns {boolean} 是否可以添加角色
   */
  canAddRole(): boolean {
    return (
      this._state.statistics.roleCount < this._state.configuration.maxRoles
    );
  }

  /**
   * @method canAddPermission
   * @description 检查是否可以添加权限
   * @returns {boolean} 是否可以添加权限
   */
  canAddPermission(): boolean {
    return (
      this._state.statistics.permissionCount <
      this._state.configuration.maxPermissions
    );
  }

  /**
   * @method canUseStorage
   * @description 检查是否可以使用存储空间
   * @param size 存储大小（MB）
   * @returns {boolean} 是否可以使用存储空间
   */
  canUseStorage(size: number): boolean {
    return (
      this._state.statistics.storageUsed + size <=
      this._state.configuration.storageLimit
    );
  }

  /**
   * @method isFeatureEnabled
   * @description 检查功能是否启用
   * @param feature 功能名称
   * @returns {boolean} 功能是否启用
   */
  isFeatureEnabled(feature: string): boolean {
    return this._state.configuration.features.includes(feature);
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
   * @method validateConfigurationUpdate
   * @description 验证配置更新
   * @param configuration 新配置
   */
  private validateConfigurationUpdate(
    configuration: Partial<TenantConfiguration>,
  ): void {
    // 验证限制不能小于当前使用量
    if (
      configuration.maxUsers !== undefined &&
      configuration.maxUsers < this._state.statistics.userCount
    ) {
      throw new Error(
        `用户数量限制不能小于当前用户数量: ${this._state.statistics.userCount}`,
      );
    }

    if (
      configuration.maxOrganizations !== undefined &&
      configuration.maxOrganizations < this._state.statistics.organizationCount
    ) {
      throw new Error(
        `组织数量限制不能小于当前组织数量: ${this._state.statistics.organizationCount}`,
      );
    }

    if (
      configuration.maxDepartments !== undefined &&
      configuration.maxDepartments < this._state.statistics.departmentCount
    ) {
      throw new Error(
        `部门数量限制不能小于当前部门数量: ${this._state.statistics.departmentCount}`,
      );
    }

    if (
      configuration.maxRoles !== undefined &&
      configuration.maxRoles < this._state.statistics.roleCount
    ) {
      throw new Error(
        `角色数量限制不能小于当前角色数量: ${this._state.statistics.roleCount}`,
      );
    }

    if (
      configuration.maxPermissions !== undefined &&
      configuration.maxPermissions < this._state.statistics.permissionCount
    ) {
      throw new Error(
        `权限数量限制不能小于当前权限数量: ${this._state.statistics.permissionCount}`,
      );
    }

    if (
      configuration.storageLimit !== undefined &&
      configuration.storageLimit < this._state.statistics.storageUsed
    ) {
      throw new Error(
        `存储限制不能小于当前使用量: ${this._state.statistics.storageUsed}MB`,
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
    statistics: Partial<TenantAggregateState['statistics']>,
  ): void {
    // 验证统计信息不能为负数
    if (statistics.userCount !== undefined && statistics.userCount < 0) {
      throw new Error('用户数量不能为负数');
    }

    if (
      statistics.organizationCount !== undefined &&
      statistics.organizationCount < 0
    ) {
      throw new Error('组织数量不能为负数');
    }

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

    if (statistics.storageUsed !== undefined && statistics.storageUsed < 0) {
      throw new Error('存储使用量不能为负数');
    }
  }

  /**
   * @private
   * @method validateStatusChange
   * @description 验证状态变更
   * @param newStatus 新状态
   */
  private validateStatusChange(newStatus: TenantStatus): void {
    // 验证状态变更逻辑
    if (
      this._state.tenant.status === TenantStatus.DISABLED &&
      newStatus === TenantStatus.ACTIVE
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
    const _warnings: string[] = [];

    if (
      this._state.statistics.userCount >=
      this._state.configuration.maxUsers * 0.9
    ) {
      _warnings.push('用户数量接近限制');
    }

    if (
      this._state.statistics.storageUsed >=
      this._state.configuration.storageLimit * 0.9
    ) {
      _warnings.push('存储使用量接近限制');
    }

    // 发布警告事件
    if (_warnings.length > 0) {
      this.addDomainEvent({
        type: 'TenantLimitsWarning',
        tenantId: this._state.tenant.id.value,
        warnings: _warnings,
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
  private addDomainEvent(event: TenantDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @static
   * @method create
   * @description 创建租户聚合根
   * @param tenant 租户实体
   * @param configuration 租户配置
   * @returns {TenantAggregate} 租户聚合根
   */
  static create(
    tenant: Tenant,
    configuration: TenantConfiguration,
  ): TenantAggregate {
    return new TenantAggregate(tenant, configuration);
  }
}
