/**
 * @file user.entity.ts
 * @description 用户实体
 *
 * 该文件定义了用户实体，包含用户的核心业务逻辑和状态管理。
 * 用户是IAM系统中的核心实体，负责身份认证和访问控制。
 *
 * 主要功能：
 * 1. 用户信息管理（基本信息、联系方式、设置等）
 * 2. 用户状态管理（激活、暂停、锁定、禁用等）
 * 3. 用户组织关系管理
 * 4. 用户角色管理
 * 5. 用户登录记录和会话管理
 *
 * 业务规则：
 * 1. 用户必须归属于某个租户
 * 2. 用户必须归属于某个组织
 * 3. 用户名和邮箱在租户内必须唯一
 * 4. 用户状态变更需要记录历史
 * 5. 用户删除前必须确保没有活跃会话
 */

import { BaseEntity, Uuid } from '@aiofix/domain-shared';
import { Username } from '../value-objects/username.vo';
import { Password } from '../value-objects/password.vo';
import { Email } from '../value-objects/email.vo';

/**
 * @enum UserStatus
 * @description 用户状态枚举
 */
export enum UserStatus {
  PENDING = 'pending', // 待激活
  ACTIVE = 'active', // 活跃
  SUSPENDED = 'suspended', // 暂停
  LOCKED = 'locked', // 锁定
  DISABLED = 'disabled', // 禁用
}

/**
 * @enum UserType
 * @description 用户类型枚举
 */
export enum UserType {
  INTERNAL = 'internal', // 内部用户
  EXTERNAL = 'external', // 外部用户
  SYSTEM = 'system', // 系统用户
  GUEST = 'guest', // 访客用户
}

/**
 * @interface UserProfile
 * @description 用户档案信息
 */
export interface UserProfile {
  firstName?: string; // 名
  lastName?: string; // 姓
  displayName?: string; // 显示名称
  avatar?: string; // 头像URL
  phone?: string; // 电话号码
  address?: string; // 地址
  timezone?: string; // 时区
  locale?: string; // 语言环境
  bio?: string; // 个人简介
  website?: string; // 个人网站
  socialLinks?: {
    // 社交链接
    linkedin?: string;
    twitter?: string;
    github?: string;
    facebook?: string;
  };
}

/**
 * @interface UserSettings
 * @description 用户设置
 */
export interface UserSettings {
  emailNotifications: boolean; // 邮件通知
  smsNotifications: boolean; // 短信通知
  pushNotifications: boolean; // 推送通知
  twoFactorEnabled: boolean; // 双因素认证
  language: string; // 语言
  theme: string; // 主题
  timezone: string; // 时区
  dateFormat: string; // 日期格式
  timeFormat: string; // 时间格式
  currency: string; // 货币
  privacyLevel: string; // 隐私级别
}

/**
 * @interface LoginRecord
 * @description 登录记录
 */
export interface LoginRecord {
  timestamp: Date; // 登录时间
  ipAddress: string; // IP地址
  userAgent: string; // 用户代理
  location?: string; // 地理位置
  success: boolean; // 是否成功
  failureReason?: string; // 失败原因
}

/**
 * @class User
 * @description 用户实体，负责维护用户状态和业务规则
 * @extends BaseEntity
 * @rule 密码必须满足复杂度要求
 * @event UserPasswordChangedEvent
 */
export class User extends BaseEntity {
  private readonly _username: Username;
  private readonly _email: Email;
  private _password: Password;
  private _status: UserStatus;
  private _type: UserType;
  private readonly _tenantId: Uuid;
  private _organizationId?: Uuid;
  private _departmentIds: Uuid[] = [];
  private _roleIds: Uuid[] = [];
  private _profile: UserProfile = {};
  private _settings: UserSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    twoFactorEnabled: false,
    language: 'zh-CN',
    theme: 'light',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    currency: 'CNY',
    privacyLevel: 'public',
  };
  private _lastLoginAt?: Date;
  private _loginAttempts: number = 0;
  private _lockedUntil?: Date;
  private _loginHistory: LoginRecord[] = [];
  private _metadata: Record<string, any> = {};

  /**
   * @constructor
   * @param id 用户ID
   * @param username 用户名
   * @param email 邮箱
   * @param password 密码
   * @param tenantId 租户ID
   * @param organizationId 组织ID
   * @param type 用户类型
   */
  constructor(
    id: Uuid,
    username: Username,
    email: Email,
    password: Password,
    tenantId: Uuid,
    organizationId?: Uuid,
    type: UserType = UserType.INTERNAL,
  ) {
    super(id);
    this._username = username;
    this._email = email;
    this._password = password;
    this._tenantId = tenantId;
    this._organizationId = organizationId;
    this._type = type;
    this._status = UserStatus.PENDING;
  }

  /**
   * @getter username
   * @description 获取用户名
   * @returns {Username} 用户名
   */
  get username(): Username {
    return this._username;
  }

  /**
   * @getter email
   * @description 获取邮箱
   * @returns {Email} 邮箱
   */
  get email(): Email {
    return this._email;
  }

  /**
   * @getter password
   * @description 获取密码
   * @returns {Password} 密码
   */
  get password(): Password {
    return this._password;
  }

  /**
   * @getter status
   * @description 获取用户状态
   * @returns {UserStatus} 用户状态
   */
  get status(): UserStatus {
    return this._status;
  }

  /**
   * @getter type
   * @description 获取用户类型
   * @returns {UserType} 用户类型
   */
  get type(): UserType {
    return this._type;
  }

  /**
   * @getter tenantId
   * @description 获取租户ID
   * @returns {Uuid} 租户ID
   */
  get tenantId(): Uuid {
    return this._tenantId;
  }

  /**
   * @getter organizationId
   * @description 获取组织ID
   * @returns {Uuid|undefined} 组织ID
   */
  get organizationId(): Uuid | undefined {
    return this._organizationId;
  }

  /**
   * @getter departmentIds
   * @description 获取部门ID列表
   * @returns {Uuid[]} 部门ID列表
   */
  get departmentIds(): Uuid[] {
    return [...this._departmentIds];
  }

  /**
   * @getter roleIds
   * @description 获取角色ID列表
   * @returns {Uuid[]} 角色ID列表
   */
  get roleIds(): Uuid[] {
    return [...this._roleIds];
  }

  /**
   * @getter profile
   * @description 获取用户档案
   * @returns {UserProfile} 用户档案
   */
  get profile(): UserProfile {
    return { ...this._profile };
  }

  /**
   * @getter settings
   * @description 获取用户设置
   * @returns {UserSettings} 用户设置
   */
  get settings(): UserSettings {
    return { ...this._settings };
  }

  /**
   * @getter lastLoginAt
   * @description 获取最后登录时间
   * @returns {Date|undefined} 最后登录时间
   */
  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  /**
   * @getter loginAttempts
   * @description 获取登录尝试次数
   * @returns {number} 登录尝试次数
   */
  get loginAttempts(): number {
    return this._loginAttempts;
  }

  /**
   * @getter isLocked
   * @description 判断用户是否被锁定
   * @returns {boolean} 是否被锁定
   */
  get isLocked(): boolean {
    return (
      this._status === UserStatus.LOCKED ||
      (this._lockedUntil !== undefined && this._lockedUntil > new Date())
    );
  }

  /**
   * @getter isActive
   * @description 判断用户是否活跃
   * @returns {boolean} 是否活跃
   */
  get isActive(): boolean {
    return this._status === UserStatus.ACTIVE && !this.isLocked;
  }

  /**
   * @method activate
   * @description 激活用户
   */
  activate(): void {
    if (this._status === UserStatus.PENDING) {
      this._status = UserStatus.ACTIVE;
      this._loginAttempts = 0;
      this._lockedUntil = undefined;
    }
  }

  /**
   * @method suspend
   * @description 暂停用户
   */
  suspend(): void {
    if (this._status === UserStatus.ACTIVE) {
      this._status = UserStatus.SUSPENDED;
    }
  }

  /**
   * @method lock
   * @description 锁定用户
   * @param duration 锁定时长（分钟）
   */
  lock(duration: number = 30): void {
    this._status = UserStatus.LOCKED;
    this._lockedUntil = new Date(Date.now() + duration * 60 * 1000);
  }

  /**
   * @method unlock
   * @description 解锁用户
   */
  unlock(): void {
    if (this._status === UserStatus.LOCKED) {
      this._status = UserStatus.ACTIVE;
      this._lockedUntil = undefined;
      this._loginAttempts = 0;
    }
  }

  /**
   * @method disable
   * @description 禁用用户
   */
  disable(): void {
    this._status = UserStatus.DISABLED;
  }

  /**
   * @method changePassword
   * @description 修改密码
   * @param newPassword 新密码
   */
  changePassword(newPassword: Password): void {
    this._password = newPassword;
    this._loginAttempts = 0;
    this._lockedUntil = undefined;
  }

  /**
   * @method verifyPassword
   * @description 验证密码
   * @param plainPassword 明文密码
   * @returns {boolean} 是否匹配
   */
  verifyPassword(plainPassword: string): boolean {
    return this._password.verify(plainPassword);
  }

  /**
   * @method updateProfile
   * @description 更新用户档案
   * @param profile 用户档案
   */
  updateProfile(profile: Partial<UserProfile>): void {
    this._profile = { ...this._profile, ...profile };
  }

  /**
   * @method updateSettings
   * @description 更新用户设置
   * @param settings 用户设置
   */
  updateSettings(settings: Partial<UserSettings>): void {
    this._settings = { ...this._settings, ...settings };
  }

  /**
   * @method setOrganization
   * @description 设置用户组织
   * @param organizationId 组织ID
   */
  setOrganization(organizationId: Uuid): void {
    this._organizationId = organizationId;
  }

  /**
   * @method addToDepartment
   * @description 添加用户到部门
   * @param departmentId 部门ID
   */
  addToDepartment(departmentId: Uuid): void {
    if (!this._departmentIds.includes(departmentId)) {
      this._departmentIds.push(departmentId);
    }
  }

  /**
   * @method removeFromDepartment
   * @description 从部门移除用户
   * @param departmentId 部门ID
   */
  removeFromDepartment(departmentId: Uuid): void {
    this._departmentIds = this._departmentIds.filter(
      id => !id.equals(departmentId),
    );
  }

  /**
   * @method assignRole
   * @description 分配角色
   * @param roleId 角色ID
   */
  assignRole(roleId: Uuid): void {
    if (!this._roleIds.includes(roleId)) {
      this._roleIds.push(roleId);
    }
  }

  /**
   * @method removeRole
   * @description 移除角色
   * @param roleId 角色ID
   */
  removeRole(roleId: Uuid): void {
    this._roleIds = this._roleIds.filter(id => !id.equals(roleId));
  }

  /**
   * @method hasRole
   * @description 检查用户是否有指定角色
   * @param roleId 角色ID
   * @returns {boolean} 是否有角色
   */
  hasRole(roleId: Uuid): boolean {
    return this._roleIds.some(id => id.equals(roleId));
  }

  /**
   * @method recordLogin
   * @description 记录登录
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   * @param success 是否成功
   * @param failureReason 失败原因
   */
  recordLogin(
    ipAddress: string,
    userAgent: string,
    success: boolean,
    failureReason?: string,
  ): void {
    const loginRecord: LoginRecord = {
      timestamp: new Date(),
      ipAddress,
      userAgent,
      success,
      failureReason,
    };

    this._loginHistory.push(loginRecord);

    if (success) {
      this._lastLoginAt = new Date();
      this._loginAttempts = 0;
      this._lockedUntil = undefined;
    } else {
      this._loginAttempts++;
      if (this._loginAttempts >= 5) {
        this.lock();
      }
    }
  }

  /**
   * @method getSetting
   * @description 获取用户设置
   * @param key 设置键
   * @returns {UserSettings[keyof UserSettings]} 设置值
   */
  getSetting(key: keyof UserSettings): UserSettings[keyof UserSettings] {
    return this._settings[key];
  }

  /**
   * @method setSetting
   * @description 设置用户设置
   * @param key 设置键
   * @param value 设置值
   */
  setSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ): void {
    this._settings[key] = value;
  }

  /**
   * @method getMetadata
   * @description 获取元数据
   * @param key 元数据键
   * @returns {unknown} 元数据值
   */
  getMetadata(key: string): unknown {
    return this._metadata[key];
  }

  /**
   * @method setMetadata
   * @description 设置元数据
   * @param key 元数据键
   * @param value 元数据值
   */
  setMetadata(key: string, value: unknown): void {
    this._metadata[key] = value;
  }

  /**
   * @static
   * @method create
   * @description 创建用户
   * @param username 用户名
   * @param email 邮箱
   * @param password 密码
   * @param tenantId 租户ID
   * @param organizationId 组织ID
   * @param type 用户类型
   * @returns {User} 用户实体
   */
  static create(
    username: Username,
    email: Email,
    password: Password,
    tenantId: Uuid,
    organizationId?: Uuid,
    type: UserType = UserType.INTERNAL,
  ): User {
    const id = Uuid.generate();
    return new User(
      id,
      username,
      email,
      password,
      tenantId,
      organizationId,
      type,
    );
  }
}
