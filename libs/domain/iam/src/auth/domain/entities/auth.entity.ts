/**
 * @file auth.entity.ts
 * @description 认证实体
 *
 * 该文件定义了认证实体，包含认证的核心业务逻辑和状态管理。
 * 认证是IAM系统中的重要实体，负责身份验证和会话管理。
 *
 * 主要功能：
 * 1. 认证信息管理（基本信息、描述、设置等）
 * 2. 认证状态管理（活跃、暂停、禁用等）
 * 3. 认证令牌管理
 * 4. 认证会话管理
 * 5. 认证历史记录管理
 *
 * 业务规则：
 * 1. 认证必须归属于某个用户
 * 2. 认证令牌在系统内必须唯一
 * 3. 认证可以形成层级关系（父子认证）
 * 4. 认证状态变更需要记录历史
 * 5. 删除认证前必须确保没有活跃会话
 */

import { BaseEntity, Uuid } from '@aiofix/domain-shared';
import { AuthToken } from '../value-objects/auth-token.vo';

/**
 * @enum AuthStatus
 * @description 认证状态枚举
 */
export enum AuthStatus {
  ACTIVE = 'active', // 活跃
  SUSPENDED = 'suspended', // 暂停
  DISABLED = 'disabled', // 禁用
  EXPIRED = 'expired', // 过期
}

/**
 * @enum AuthType
 * @description 认证类型枚举
 */
export enum AuthType {
  PASSWORD = 'password', // 密码认证
  TOKEN = 'token', // 令牌认证
  OAUTH = 'oauth', // OAuth认证
  SAML = 'saml', // SAML认证
  LDAP = 'ldap', // LDAP认证
  API_KEY = 'api_key', // API密钥认证
  BIOMETRIC = 'biometric', // 生物识别认证
}

/**
 * @enum AuthProvider
 * @description 认证提供商枚举
 */
export enum AuthProvider {
  INTERNAL = 'internal', // 内部认证
  GOOGLE = 'google', // Google认证
  FACEBOOK = 'facebook', // Facebook认证
  GITHUB = 'github', // GitHub认证
  MICROSOFT = 'microsoft', // Microsoft认证
  APPLE = 'apple', // Apple认证
  TWITTER = 'twitter', // Twitter认证
}

/**
 * @interface AuthSession
 * @description 认证会话
 */
export interface AuthSession {
  sessionId: string; // 会话ID
  token: AuthToken; // 认证令牌
  ipAddress: string; // IP地址
  userAgent: string; // 用户代理
  deviceInfo: {
    // 设备信息
    type: string;
    os: string;
    browser: string;
    version: string;
  };
  location?: {
    // 位置信息
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: Date; // 创建时间
  lastActivityAt: Date; // 最后活动时间
  expiresAt: Date; // 过期时间
}

/**
 * @interface AuthHistory
 * @description 认证历史
 */
export interface AuthHistory {
  eventId: string; // 事件ID
  eventType: string; // 事件类型
  eventTime: Date; // 事件时间
  ipAddress: string; // IP地址
  userAgent: string; // 用户代理
  success: boolean; // 是否成功
  failureReason?: string; // 失败原因
  metadata?: Record<string, any>; // 元数据
}

/**
 * @interface AuthSettings
 * @description 认证设置
 */
export interface AuthSettings {
  requireMFA: boolean; // 需要多因素认证
  allowRememberMe: boolean; // 允许记住我
  sessionTimeout: number; // 会话超时时间（分钟）
  maxConcurrentSessions: number; // 最大并发会话数
  passwordPolicy: {
    // 密码策略
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // 密码最大年龄（天）
  };
  lockoutPolicy: {
    // 锁定策略
    maxFailedAttempts: number;
    lockoutDuration: number; // 锁定时间（分钟）
    unlockAfterReset: boolean;
  };
  notificationSettings: {
    // 通知设置
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  auditSettings: {
    // 审计设置
    logLogin: boolean;
    logLogout: boolean;
    logFailedAttempts: boolean;
    logPasswordChanges: boolean;
  };
}

/**
 * @interface AuthLimits
 * @description 认证限制
 */
export interface AuthLimits {
  maxSessions: number; // 最大会话数
  maxFailedAttempts: number; // 最大失败尝试次数
  maxPasswordAge: number; // 密码最大年龄（天）
  maxTokenAge: number; // 令牌最大年龄（分钟）
  maxRefreshTokens: number; // 最大刷新令牌数
  maxApiKeys: number; // 最大API密钥数
}

/**
 * @class Auth
 * @description 认证实体，负责维护认证状态和业务规则
 * @extends BaseEntity
 * @rule 认证令牌必须唯一且有时效性
 * @event AuthTokenCreatedEvent
 */
export class Auth extends BaseEntity {
  private readonly _userId: Uuid;
  private _type: AuthType;
  private _provider: AuthProvider;
  private _status: AuthStatus;
  private _accessToken?: AuthToken;
  private _refreshToken?: AuthToken;
  private _apiKey?: AuthToken;
  private _sessions: AuthSession[] = [];
  private _history: AuthHistory[] = [];
  private _settings: AuthSettings = {
    requireMFA: false,
    allowRememberMe: true,
    sessionTimeout: 480,
    maxConcurrentSessions: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90,
    },
    lockoutPolicy: {
      maxFailedAttempts: 5,
      lockoutDuration: 30,
      unlockAfterReset: true,
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    auditSettings: {
      logLogin: true,
      logLogout: true,
      logFailedAttempts: true,
      logPasswordChanges: true,
    },
  };
  private _limits: AuthLimits = {
    maxSessions: 10,
    maxFailedAttempts: 5,
    maxPasswordAge: 90,
    maxTokenAge: 60,
    maxRefreshTokens: 5,
    maxApiKeys: 10,
  };
  private _metadata: Record<string, any> = {};
  private _lastLoginAt?: Date;
  private _lastLogoutAt?: Date;
  private _failedAttempts: number = 0;
  private _lockedUntil?: Date;

  /**
   * @constructor
   * @param id 认证ID
   * @param userId 用户ID
   * @param type 认证类型
   * @param provider 认证提供商
   */
  constructor(
    id: Uuid,
    userId: Uuid,
    type: AuthType = AuthType.PASSWORD,
    provider: AuthProvider = AuthProvider.INTERNAL,
  ) {
    super(id);
    this._userId = userId;
    this._type = type;
    this._provider = provider;
    this._status = AuthStatus.ACTIVE;
  }

  /**
   * @getter userId
   * @description 获取用户ID
   * @returns {Uuid} 用户ID
   */
  get userId(): Uuid {
    return this._userId;
  }

  /**
   * @getter type
   * @description 获取认证类型
   * @returns {AuthType} 认证类型
   */
  get type(): AuthType {
    return this._type;
  }

  /**
   * @getter provider
   * @description 获取认证提供商
   * @returns {AuthProvider} 认证提供商
   */
  get provider(): AuthProvider {
    return this._provider;
  }

  /**
   * @getter status
   * @description 获取认证状态
   * @returns {AuthStatus} 认证状态
   */
  get status(): AuthStatus {
    return this._status;
  }

  /**
   * @getter accessToken
   * @description 获取访问令牌
   * @returns {AuthToken|undefined} 访问令牌
   */
  get accessToken(): AuthToken | undefined {
    return this._accessToken;
  }

  /**
   * @getter refreshToken
   * @description 获取刷新令牌
   * @returns {AuthToken|undefined} 刷新令牌
   */
  get refreshToken(): AuthToken | undefined {
    return this._refreshToken;
  }

  /**
   * @getter apiKey
   * @description 获取API密钥
   * @returns {AuthToken|undefined} API密钥
   */
  get apiKey(): AuthToken | undefined {
    return this._apiKey;
  }

  /**
   * @getter sessions
   * @description 获取认证会话列表
   * @returns {AuthSession[]} 认证会话列表
   */
  get sessions(): AuthSession[] {
    return [...this._sessions];
  }

  /**
   * @getter history
   * @description 获取认证历史列表
   * @returns {AuthHistory[]} 认证历史列表
   */
  get history(): AuthHistory[] {
    return [...this._history];
  }

  /**
   * @getter settings
   * @description 获取认证设置
   * @returns {AuthSettings} 认证设置
   */
  get settings(): AuthSettings {
    return { ...this._settings };
  }

  /**
   * @getter limits
   * @description 获取认证限制
   * @returns {AuthLimits} 认证限制
   */
  get limits(): AuthLimits {
    return { ...this._limits };
  }

  /**
   * @getter isActive
   * @description 判断认证是否活跃
   * @returns {boolean} 是否活跃
   */
  get isActive(): boolean {
    return this._status === AuthStatus.ACTIVE;
  }

  /**
   * @getter isLocked
   * @description 判断是否被锁定
   * @returns {boolean} 是否被锁定
   */
  get isLocked(): boolean {
    if (!this._lockedUntil) {
      return false;
    }
    return new Date() < this._lockedUntil;
  }

  /**
   * @getter activeSessions
   * @description 获取活跃会话数量
   * @returns {number} 活跃会话数量
   */
  get activeSessions(): number {
    return this._sessions.filter(session => !session.token.isExpired()).length;
  }

  /**
   * @getter lastLoginAt
   * @description 获取最后登录时间
   * @returns {Date|undefined} 最后登录时间
   */
  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt ? new Date(this._lastLoginAt) : undefined;
  }

  /**
   * @getter lastLogoutAt
   * @description 获取最后登出时间
   * @returns {Date|undefined} 最后登出时间
   */
  get lastLogoutAt(): Date | undefined {
    return this._lastLogoutAt ? new Date(this._lastLogoutAt) : undefined;
  }

  /**
   * @getter failedAttempts
   * @description 获取失败尝试次数
   * @returns {number} 失败尝试次数
   */
  get failedAttempts(): number {
    return this._failedAttempts;
  }

  /**
   * @method activate
   * @description 激活认证
   */
  activate(): void {
    this._status = AuthStatus.ACTIVE;
    this._lockedUntil = undefined;
    this._failedAttempts = 0;
  }

  /**
   * @method suspend
   * @description 暂停认证
   */
  suspend(): void {
    if (this._status === AuthStatus.ACTIVE) {
      this._status = AuthStatus.SUSPENDED;
    }
  }

  /**
   * @method disable
   * @description 禁用认证
   */
  disable(): void {
    this._status = AuthStatus.DISABLED;
    this.revokeAllTokens();
  }

  /**
   * @method updateType
   * @description 更新认证类型
   * @param type 新类型
   */
  updateType(type: AuthType): void {
    this._type = type;
  }

  /**
   * @method updateProvider
   * @description 更新认证提供商
   * @param provider 新提供商
   */
  updateProvider(provider: AuthProvider): void {
    this._provider = provider;
  }

  /**
   * @method setAccessToken
   * @description 设置访问令牌
   * @param token 访问令牌
   */
  setAccessToken(token: AuthToken): void {
    this._accessToken = token;
  }

  /**
   * @method setRefreshToken
   * @description 设置刷新令牌
   * @param token 刷新令牌
   */
  setRefreshToken(token: AuthToken): void {
    this._refreshToken = token;
  }

  /**
   * @method setApiKey
   * @description 设置API密钥
   * @param apiKey API密钥
   */
  setApiKey(apiKey: AuthToken): void {
    this._apiKey = apiKey;
  }

  /**
   * @method revokeAccessToken
   * @description 撤销访问令牌
   */
  revokeAccessToken(): void {
    this._accessToken = undefined;
  }

  /**
   * @method revokeRefreshToken
   * @description 撤销刷新令牌
   */
  revokeRefreshToken(): void {
    this._refreshToken = undefined;
  }

  /**
   * @method revokeApiKey
   * @description 撤销API密钥
   */
  revokeApiKey(): void {
    this._apiKey = undefined;
  }

  /**
   * @method revokeAllTokens
   * @description 撤销所有令牌
   */
  revokeAllTokens(): void {
    this._accessToken = undefined;
    this._refreshToken = undefined;
    this._apiKey = undefined;
    this._sessions = [];
  }

  /**
   * @method addSession
   * @description 添加认证会话
   * @param session 认证会话
   */
  addSession(session: AuthSession): void {
    // 检查会话数量限制
    if (this._sessions.length >= this._limits.maxSessions) {
      // 移除最旧的会话
      this._sessions.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      this._sessions.shift();
    }
    this._sessions.push(session);
  }

  /**
   * @method removeSession
   * @description 移除认证会话
   * @param sessionId 会话ID
   */
  removeSession(sessionId: string): void {
    this._sessions = this._sessions.filter(
      session => session.sessionId !== sessionId,
    );
  }

  /**
   * @method getSession
   * @description 获取认证会话
   * @param sessionId 会话ID
   * @returns {AuthSession|undefined} 认证会话
   */
  getSession(sessionId: string): AuthSession | undefined {
    return this._sessions.find(session => session.sessionId === sessionId);
  }

  /**
   * @method updateSessionActivity
   * @description 更新会话活动时间
   * @param sessionId 会话ID
   */
  updateSessionActivity(sessionId: string): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.lastActivityAt = new Date();
    }
  }

  /**
   * @method addHistory
   * @description 添加认证历史
   * @param history 认证历史
   */
  addHistory(history: AuthHistory): void {
    this._history.push(history);
    // 限制历史记录数量
    if (this._history.length > 1000) {
      this._history = this._history.slice(-1000);
    }
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
    if (success) {
      this._lastLoginAt = new Date();
      this._failedAttempts = 0;
      this._lockedUntil = undefined;
    } else {
      this._failedAttempts++;
      if (
        this._failedAttempts >= this._settings.lockoutPolicy.maxFailedAttempts
      ) {
        this._lockedUntil = new Date(
          Date.now() + this._settings.lockoutPolicy.lockoutDuration * 60 * 1000,
        );
      }
    }

    this.addHistory({
      eventId: Uuid.generate().toString(),
      eventType: success ? 'login_success' : 'login_failed',
      eventTime: new Date(),
      ipAddress,
      userAgent,
      success,
      failureReason,
    });
  }

  /**
   * @method recordLogout
   * @description 记录登出
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   */
  recordLogout(ipAddress: string, userAgent: string): void {
    this._lastLogoutAt = new Date();
    this.addHistory({
      eventId: Uuid.generate().toString(),
      eventType: 'logout',
      eventTime: new Date(),
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * @method updateSettings
   * @description 更新认证设置
   * @param settings 认证设置
   */
  updateSettings(settings: Partial<AuthSettings>): void {
    this._settings = { ...this._settings, ...settings };
  }

  /**
   * @method updateLimits
   * @description 更新认证限制
   * @param limits 认证限制
   */
  updateLimits(limits: Partial<AuthLimits>): void {
    this._limits = { ...this._limits, ...limits };
  }

  /**
   * @method getSetting
   * @description 获取认证设置
   * @param key 设置键
   * @returns {AuthSettings[K]} 设置值
   */
  getSetting<K extends keyof AuthSettings>(key: K): AuthSettings[K] {
    return this._settings[key];
  }

  /**
   * @method setSetting
   * @description 设置认证设置
   * @param key 设置键
   * @param value 设置值
   */
  setSetting<K extends keyof AuthSettings>(
    key: K,
    value: AuthSettings[K],
  ): void {
    this._settings[key] = value;
  }

  /**
   * @method getLimit
   * @description 获取认证限制
   * @param key 限制键
   * @returns {AuthLimits[K]} 限制值
   */
  getLimit<K extends keyof AuthLimits>(key: K): AuthLimits[K] {
    return this._limits[key];
  }

  /**
   * @method setLimit
   * @description 设置认证限制
   * @param key 限制键
   * @param value 限制值
   */
  setLimit<K extends keyof AuthLimits>(key: K, value: AuthLimits[K]): void {
    this._limits[key] = value;
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
   * @method canCreateSession
   * @description 检查是否可以创建会话
   * @returns {boolean} 是否可以创建会话
   */
  canCreateSession(): boolean {
    return this.activeSessions < this._limits.maxSessions;
  }

  /**
   * @method canLogin
   * @description 检查是否可以登录
   * @returns {boolean} 是否可以登录
   */
  canLogin(): boolean {
    return this.isActive && !this.isLocked;
  }

  /**
   * @static
   * @method create
   * @description 创建认证
   * @param userId 用户ID
   * @param type 认证类型
   * @param provider 认证提供商
   * @returns {Auth} 认证实体
   */
  static create(
    userId: Uuid,
    type: AuthType = AuthType.PASSWORD,
    provider: AuthProvider = AuthProvider.INTERNAL,
  ): Auth {
    const id = Uuid.generate();
    return new Auth(id, userId, type, provider);
  }
}
