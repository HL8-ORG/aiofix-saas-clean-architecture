/**
 * @file user-aggregate.ts
 * @description 用户聚合根
 *
 * 该文件定义了用户聚合根，负责管理用户及其相关实体的生命周期和一致性。
 * 用户聚合根是DDD中的核心概念，确保用户边界内的所有实体保持一致状态。
 *
 * 主要功能：
 * 1. 用户生命周期管理
 * 2. 用户权限管理
 * 3. 用户状态一致性保证
 * 4. 用户事件发布
 * 5. 用户业务规则验证
 *
 * 业务规则：
 * 1. 用户创建时必须设置基本信息和密码
 * 2. 用户状态变更需要验证所有相关权限
 * 3. 用户删除前必须确保所有资源已清理
 * 4. 用户权限变更需要通知相关系统
 */

import { Uuid } from '@aiofix/domain-shared';
import { User, UserStatus } from '../entities/user.entity';

/**
 * @interface UserAggregateProfile
 * @description 用户聚合根档案
 */
export interface UserAggregateProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  preferences: Record<string, any>;
}

/**
 * @interface UserSecurity
 * @description 用户安全信息
 */
export interface UserSecurity {
  lastLoginAt?: Date;
  lastPasswordChangeAt?: Date;
  failedLoginAttempts: number;
  isLocked: boolean;
  lockExpiresAt?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  passwordHistory: string[];
  securityQuestions: Record<string, string>;
}

/**
 * @interface UserDomainEvent
 * @description 用户领域事件
 */
export interface UserDomainEvent {
  type: string;
  userId: string;
  timestamp: Date;
  [key: string]: unknown;
}

/**
 * @interface UserAggregateState
 * @description 用户聚合根状态
 */
export interface UserAggregateState {
  user: User;
  profile: UserAggregateProfile;
  security: UserSecurity;
  roles: Uuid[];
  permissions: Uuid[];
  organizations: Uuid[];
  departments: Uuid[];
  lastUpdated: Date;
}

/**
 * @class UserAggregate
 * @description 用户聚合根
 *
 * 该聚合根负责管理用户及其相关实体的生命周期，
 * 确保用户边界内的所有实体保持一致状态。
 */
export class UserAggregate {
  private _state: UserAggregateState;
  private _domainEvents: UserDomainEvent[] = [];

  /**
   * @constructor
   * @param user 用户实体
   * @param profile 用户档案
   * @param security 用户安全信息
   */
  constructor(
    user: User,
    profile: UserAggregateProfile,
    security: UserSecurity,
  ) {
    this._state = {
      user,
      profile,
      security,
      roles: [],
      permissions: [],
      organizations: [],
      departments: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * @getter id
   * @description 获取用户ID
   * @returns {Uuid} 用户ID
   */
  get id(): Uuid {
    return this._state.user.id;
  }

  /**
   * @getter user
   * @description 获取用户实体
   * @returns {User} 用户实体
   */
  get user(): User {
    return this._state.user;
  }

  /**
   * @getter profile
   * @description 获取用户档案
   * @returns {UserAggregateProfile} 用户档案
   */
  get profile(): UserAggregateProfile {
    return { ...this._state.profile };
  }

  /**
   * @getter security
   * @description 获取用户安全信息
   * @returns {UserSecurity} 用户安全信息
   */
  get security(): UserSecurity {
    return { ...this._state.security };
  }

  /**
   * @getter roles
   * @description 获取用户角色列表
   * @returns {Uuid[]} 角色ID列表
   */
  get roles(): Uuid[] {
    return [...this._state.roles];
  }

  /**
   * @getter permissions
   * @description 获取用户权限列表
   * @returns {Uuid[]} 权限ID列表
   */
  get permissions(): Uuid[] {
    return [...this._state.permissions];
  }

  /**
   * @getter organizations
   * @description 获取用户组织列表
   * @returns {Uuid[]} 组织ID列表
   */
  get organizations(): Uuid[] {
    return [...this._state.organizations];
  }

  /**
   * @getter departments
   * @description 获取用户部门列表
   * @returns {Uuid[]} 部门ID列表
   */
  get departments(): Uuid[] {
    return [...this._state.departments];
  }

  /**
   * @getter domainEvents
   * @description 获取领域事件
   * @returns {UserDomainEvent[]} 领域事件列表
   */
  get domainEvents(): UserDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method updateProfile
   * @description 更新用户档案
   * @param profile 新档案信息
   */
  updateProfile(profile: Partial<UserAggregateProfile>): void {
    // 验证档案更新
    this.validateProfileUpdate(profile);

    // 更新档案
    this._state.profile = {
      ...this._state.profile,
      ...profile,
    };

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布档案更新事件
    this.addDomainEvent({
      type: 'UserProfileUpdated',
      userId: this._state.user.id.value,
      profile: this._state.profile,
      timestamp: new Date(),
    });
  }

  /**
   * @method updateSecurity
   * @description 更新用户安全信息
   * @param security 新安全信息
   */
  updateSecurity(security: Partial<UserSecurity>): void {
    // 验证安全信息更新
    this.validateSecurityUpdate(security);

    // 更新安全信息
    this._state.security = {
      ...this._state.security,
      ...security,
    };

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布安全信息更新事件
    this.addDomainEvent({
      type: 'UserSecurityUpdated',
      userId: this._state.user.id.value,
      security: this._state.security,
      timestamp: new Date(),
    });
  }

  /**
   * @method assignRole
   * @description 分配角色给用户
   * @param roleId 角色ID
   */
  assignRole(roleId: Uuid): void {
    // 验证角色分配
    this.validateRoleAssignment(roleId);

    // 分配角色
    if (!this._state.roles.some(id => id.equals(roleId))) {
      this._state.roles.push(roleId);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布角色分配事件
    this.addDomainEvent({
      type: 'UserRoleAssigned',
      userId: this._state.user.id.value,
      roleId: roleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeRole
   * @description 从用户移除角色
   * @param roleId 角色ID
   */
  removeRole(roleId: Uuid): void {
    // 验证角色移除
    this.validateRoleRemoval(roleId);

    // 移除角色
    this._state.roles = this._state.roles.filter(id => !id.equals(roleId));

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布角色移除事件
    this.addDomainEvent({
      type: 'UserRoleRemoved',
      userId: this._state.user.id.value,
      roleId: roleId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method assignPermission
   * @description 分配权限给用户
   * @param permissionId 权限ID
   */
  assignPermission(permissionId: Uuid): void {
    // 验证权限分配
    this.validatePermissionAssignment(permissionId);

    // 分配权限
    if (!this._state.permissions.some(id => id.equals(permissionId))) {
      this._state.permissions.push(permissionId);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布权限分配事件
    this.addDomainEvent({
      type: 'UserPermissionAssigned',
      userId: this._state.user.id.value,
      permissionId: permissionId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method removePermission
   * @description 从用户移除权限
   * @param permissionId 权限ID
   */
  removePermission(permissionId: Uuid): void {
    // 验证权限移除
    this.validatePermissionRemoval(permissionId);

    // 移除权限
    this._state.permissions = this._state.permissions.filter(
      id => !id.equals(permissionId),
    );

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布权限移除事件
    this.addDomainEvent({
      type: 'UserPermissionRemoved',
      userId: this._state.user.id.value,
      permissionId: permissionId.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method changeStatus
   * @description 变更用户状态
   * @param newStatus 新状态
   * @param reason 变更原因
   */
  changeStatus(newStatus: UserStatus, reason?: string): void {
    // 验证状态变更
    this.validateStatusChange(newStatus);

    // 变更状态
    switch (newStatus) {
      case UserStatus.ACTIVE:
        this._state.user.activate();
        break;
      case UserStatus.SUSPENDED:
        this._state.user.suspend();
        break;
      case UserStatus.DISABLED:
        this._state.user.disable();
        break;
      default:
        throw new Error(`不支持的用户状态: ${newStatus}`);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布状态变更事件
    this.addDomainEvent({
      type: 'UserStatusChanged',
      userId: this._state.user.id.value,
      oldStatus: this._state.user.status,
      newStatus,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * @method recordLogin
   * @description 记录用户登录
   * @param success 是否成功
   */
  recordLogin(success: boolean): void {
    if (success) {
      this._state.security.lastLoginAt = new Date();
      this._state.security.failedLoginAttempts = 0;
      this._state.security.isLocked = false;
      this._state.security.lockExpiresAt = undefined;
    } else {
      this._state.security.failedLoginAttempts++;

      // 检查是否需要锁定账户
      if (this._state.security.failedLoginAttempts >= 5) {
        this._state.security.isLocked = true;
        this._state.security.lockExpiresAt = new Date(
          Date.now() + 30 * 60 * 1000,
        ); // 30分钟
      }
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布登录事件
    this.addDomainEvent({
      type: success ? 'UserLoginSuccess' : 'UserLoginFailed',
      userId: this._state.user.id.value,
      timestamp: new Date(),
    });
  }

  /**
   * @method hasRole
   * @description 检查用户是否有指定角色
   * @param roleId 角色ID
   * @returns {boolean} 是否有角色
   */
  hasRole(roleId: Uuid): boolean {
    return this._state.roles.some(id => id.equals(roleId));
  }

  /**
   * @method hasPermission
   * @description 检查用户是否有指定权限
   * @param permissionId 权限ID
   * @returns {boolean} 是否有权限
   */
  hasPermission(permissionId: Uuid): boolean {
    return this._state.permissions.some(id => id.equals(permissionId));
  }

  /**
   * @method isActive
   * @description 检查用户是否活跃
   * @returns {boolean} 是否活跃
   */
  isActive(): boolean {
    return (
      this._state.user.status === UserStatus.ACTIVE &&
      !this._state.security.isLocked
    );
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
   * @method validateProfileUpdate
   * @description 验证档案更新
   * @param profile 新档案信息
   */
  private validateProfileUpdate(profile: Partial<UserAggregateProfile>): void {
    if (
      profile.firstName !== undefined &&
      profile.firstName.trim().length === 0
    ) {
      throw new Error('名字不能为空');
    }

    if (
      profile.lastName !== undefined &&
      profile.lastName.trim().length === 0
    ) {
      throw new Error('姓氏不能为空');
    }

    if (
      profile.displayName !== undefined &&
      profile.displayName.trim().length === 0
    ) {
      throw new Error('显示名称不能为空');
    }
  }

  /**
   * @private
   * @method validateSecurityUpdate
   * @description 验证安全信息更新
   * @param security 新安全信息
   */
  private validateSecurityUpdate(security: Partial<UserSecurity>): void {
    if (
      security.failedLoginAttempts !== undefined &&
      security.failedLoginAttempts < 0
    ) {
      throw new Error('失败登录次数不能为负数');
    }
  }

  /**
   * @private
   * @method validateRoleAssignment
   * @description 验证角色分配
   * @param roleId 角色ID
   */
  private validateRoleAssignment(roleId: Uuid): void {
    if (this.hasRole(roleId)) {
      throw new Error('用户已经拥有该角色');
    }
  }

  /**
   * @private
   * @method validateRoleRemoval
   * @description 验证角色移除
   * @param roleId 角色ID
   */
  private validateRoleRemoval(roleId: Uuid): void {
    if (!this.hasRole(roleId)) {
      throw new Error('用户不拥有该角色');
    }
  }

  /**
   * @private
   * @method validatePermissionAssignment
   * @description 验证权限分配
   * @param permissionId 权限ID
   */
  private validatePermissionAssignment(permissionId: Uuid): void {
    if (this.hasPermission(permissionId)) {
      throw new Error('用户已经拥有该权限');
    }
  }

  /**
   * @private
   * @method validatePermissionRemoval
   * @description 验证权限移除
   * @param permissionId 权限ID
   */
  private validatePermissionRemoval(permissionId: Uuid): void {
    if (!this.hasPermission(permissionId)) {
      throw new Error('用户不拥有该权限');
    }
  }

  /**
   * @private
   * @method validateStatusChange
   * @description 验证状态变更
   * @param newStatus 新状态
   */
  private validateStatusChange(newStatus: UserStatus): void {
    // 验证状态变更逻辑
    if (
      this._state.user.status === UserStatus.DISABLED &&
      newStatus === UserStatus.ACTIVE
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
   * @method addDomainEvent
   * @description 添加领域事件
   * @param event 领域事件
   */
  private addDomainEvent(event: UserDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @static
   * @method create
   * @description 创建用户聚合根
   * @param user 用户实体
   * @param profile 用户档案
   * @param security 用户安全信息
   * @returns {UserAggregate} 用户聚合根
   */
  static create(
    user: User,
    profile: UserAggregateProfile,
    security: UserSecurity,
  ): UserAggregate {
    return new UserAggregate(user, profile, security);
  }
}
