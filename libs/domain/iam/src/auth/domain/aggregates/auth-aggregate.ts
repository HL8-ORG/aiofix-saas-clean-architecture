/**
 * @file auth-aggregate.ts
 * @description 认证聚合根
 *
 * 该文件定义了认证聚合根，负责管理认证及其相关实体的生命周期和一致性。
 * 认证聚合根是DDD中的核心概念，确保认证边界内的所有实体保持一致状态。
 *
 * 主要功能：
 * 1. 认证生命周期管理
 * 2. 认证会话管理
 * 3. 认证令牌管理
 * 4. 认证状态一致性保证
 * 5. 认证事件发布
 * 6. 认证业务规则验证
 *
 * 业务规则：
 * 1. 认证创建时必须设置基本信息和用户
 * 2. 认证状态变更需要验证所有相关会话
 * 3. 认证删除前必须确保所有资源已清理
 * 4. 认证会话变更需要通知相关系统
 */

import { Uuid } from '@aiofix/domain-shared';
import {
  Auth,
  AuthStatus,
  AuthSession,
  AuthHistory,
} from '../entities/auth.entity';

/**
 * @interface AuthAggregateSettings
 * @description 认证聚合根设置
 */
export interface AuthAggregateSettings {
  allowMultipleSessions: boolean;
  allowRememberMe: boolean;
  requireMFA: boolean;
  maxSessions: number;
  maxFailedAttempts: number;
  sessionTimeout: number;
  features: string[];
  customSettings: Record<string, any>;
}

/**
 * @interface AuthAggregateStatistics
 * @description 认证聚合根统计信息
 */
export interface AuthAggregateStatistics {
  activeSessionCount: number;
  totalLoginCount: number;
  failedLoginCount: number;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
}

/**
 * @interface AuthDomainEvent
 * @description 认证领域事件
 */
export interface AuthDomainEvent {
  type: string;
  authId: string;
  timestamp: Date;
  [key: string]: unknown;
}

/**
 * @interface AuthAggregateState
 * @description 认证聚合根状态
 */
export interface AuthAggregateState {
  auth: Auth;
  settings: AuthAggregateSettings;
  statistics: AuthAggregateStatistics;
  activeSessions: AuthSession[];
  recentHistory: AuthHistory[];
  lastUpdated: Date;
}

/**
 * @class AuthAggregate
 * @description 认证聚合根
 *
 * 该聚合根负责管理认证及其相关实体的生命周期，
 * 确保认证边界内的所有实体保持一致状态。
 */
export class AuthAggregate {
  private _state: AuthAggregateState;
  private _domainEvents: AuthDomainEvent[] = [];

  /**
   * @constructor
   * @param auth 认证实体
   * @param settings 认证设置
   */
  constructor(auth: Auth, settings: AuthAggregateSettings) {
    this._state = {
      auth,
      settings,
      statistics: {
        activeSessionCount: 0,
        totalLoginCount: 0,
        failedLoginCount: 0,
      },
      activeSessions: [],
      recentHistory: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * @getter id
   * @description 获取认证ID
   * @returns {Uuid} 认证ID
   */
  get id(): Uuid {
    return this._state.auth.id;
  }

  /**
   * @getter auth
   * @description 获取认证实体
   * @returns {Auth} 认证实体
   */
  get auth(): Auth {
    return this._state.auth;
  }

  /**
   * @getter settings
   * @description 获取认证设置
   * @returns {AuthAggregateSettings} 认证设置
   */
  get settings(): AuthAggregateSettings {
    return { ...this._state.settings };
  }

  /**
   * @getter statistics
   * @description 获取认证统计信息
   * @returns {AuthAggregateStatistics} 统计信息
   */
  get statistics(): AuthAggregateStatistics {
    return { ...this._state.statistics };
  }

  /**
   * @getter activeSessions
   * @description 获取活跃会话列表
   * @returns {AuthSession[]} 活跃会话列表
   */
  get activeSessions(): AuthSession[] {
    return [...this._state.activeSessions];
  }

  /**
   * @getter recentHistory
   * @description 获取最近历史记录
   * @returns {AuthHistory[]} 最近历史记录
   */
  get recentHistory(): AuthHistory[] {
    return [...this._state.recentHistory];
  }

  /**
   * @getter domainEvents
   * @description 获取领域事件
   * @returns {AuthDomainEvent[]} 领域事件列表
   */
  get domainEvents(): AuthDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method updateSettings
   * @description 更新认证设置
   * @param settings 新设置
   */
  updateSettings(settings: Partial<AuthAggregateSettings>): void {
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
      type: 'AuthSettingsUpdated',
      authId: this._state.auth.id.value,
      settings: this._state.settings,
      timestamp: new Date(),
    });
  }

  /**
   * @method updateStatistics
   * @description 更新认证统计信息
   * @param statistics 新统计信息
   */
  updateStatistics(statistics: Partial<AuthAggregateStatistics>): void {
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
   * @method addSession
   * @description 添加会话
   * @param session 会话信息
   */
  addSession(session: AuthSession): void {
    // 验证会话添加
    this.validateSessionAddition(session);

    // 添加会话
    this._state.activeSessions.push(session);
    this._state.statistics.activeSessionCount++;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布会话添加事件
    this.addDomainEvent({
      type: 'AuthSessionAdded',
      authId: this._state.auth.id.value,
      sessionId: session.sessionId,
      timestamp: new Date(),
    });
  }

  /**
   * @method removeSession
   * @description 移除会话
   * @param sessionId 会话ID
   */
  removeSession(sessionId: string): void {
    // 验证会话移除
    this.validateSessionRemoval(sessionId);

    // 移除会话
    this._state.activeSessions = this._state.activeSessions.filter(
      s => s.sessionId !== sessionId,
    );
    this._state.statistics.activeSessionCount--;

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布会话移除事件
    this.addDomainEvent({
      type: 'AuthSessionRemoved',
      authId: this._state.auth.id.value,
      sessionId,
      timestamp: new Date(),
    });
  }

  /**
   * @method addHistory
   * @description 添加历史记录
   * @param history 历史记录
   */
  addHistory(history: AuthHistory): void {
    // 验证历史记录添加
    this.validateHistoryAddition(history);

    // 添加历史记录
    this._state.recentHistory.push(history);

    // 更新统计信息
    if (history.eventType === 'login') {
      this._state.statistics.totalLoginCount++;
      this._state.statistics.lastLoginAt = history.eventTime;
    }

    if (!history.success && history.eventType === 'login') {
      this._state.statistics.failedLoginCount++;
    }

    // 限制历史记录数量
    if (this._state.recentHistory.length > 100) {
      this._state.recentHistory = this._state.recentHistory.slice(-100);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布历史记录添加事件
    this.addDomainEvent({
      type: 'AuthHistoryAdded',
      authId: this._state.auth.id.value,
      eventType: history.eventType,
      timestamp: new Date(),
    });
  }

  /**
   * @method changeStatus
   * @description 变更认证状态
   * @param newStatus 新状态
   * @param reason 变更原因
   */
  changeStatus(newStatus: AuthStatus, reason?: string): void {
    // 验证状态变更
    this.validateStatusChange(newStatus);

    // 变更状态
    switch (newStatus) {
      case AuthStatus.ACTIVE:
        this._state.auth.activate();
        break;
      case AuthStatus.SUSPENDED:
        this._state.auth.suspend();
        break;
      case AuthStatus.DISABLED:
        this._state.auth.disable();
        break;
      case AuthStatus.EXPIRED:
        // 对于过期状态，我们直接设置状态而不调用不存在的方法
        this._state.auth['_status'] = AuthStatus.EXPIRED;
        break;
      default:
        throw new Error(`不支持的认证状态: ${String(newStatus)}`);
    }

    // 更新最后修改时间
    this._state.lastUpdated = new Date();

    // 发布状态变更事件
    this.addDomainEvent({
      type: 'AuthStatusChanged',
      authId: this._state.auth.id.value,
      oldStatus: this._state.auth.status,
      newStatus,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * @method canAddSession
   * @description 检查是否可以添加会话
   * @returns {boolean} 是否可以添加会话
   */
  canAddSession(): boolean {
    return (
      this._state.settings.allowMultipleSessions &&
      this._state.statistics.activeSessionCount <
        this._state.settings.maxSessions
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
   * @method hasActiveSession
   * @description 检查是否有活跃会话
   * @param sessionId 会话ID
   * @returns {boolean} 是否有活跃会话
   */
  hasActiveSession(sessionId: string): boolean {
    return this._state.activeSessions.some(s => s.sessionId === sessionId);
  }

  /**
   * @method getActiveSession
   * @description 获取活跃会话
   * @param sessionId 会话ID
   * @returns {AuthSession | undefined} 活跃会话
   */
  getActiveSession(sessionId: string): AuthSession | undefined {
    return this._state.activeSessions.find(s => s.sessionId === sessionId);
  }

  /**
   * @method clearExpiredSessions
   * @description 清理过期会话
   */
  clearExpiredSessions(): void {
    const now = new Date();
    const expiredSessions = this._state.activeSessions.filter(
      s => s.expiresAt <= now,
    );

    expiredSessions.forEach(session => {
      this.removeSession(session.sessionId);
    });
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
    settings: Partial<AuthAggregateSettings>,
  ): void {
    // 验证限制不能小于当前数量
    if (
      settings.maxSessions !== undefined &&
      settings.maxSessions < this._state.statistics.activeSessionCount
    ) {
      throw new Error(
        `最大会话数限制不能小于当前活跃会话数: ${this._state.statistics.activeSessionCount}`,
      );
    }

    if (
      settings.maxFailedAttempts !== undefined &&
      settings.maxFailedAttempts < 1
    ) {
      throw new Error('最大失败尝试次数不能小于1');
    }

    if (settings.sessionTimeout !== undefined && settings.sessionTimeout < 1) {
      throw new Error('会话超时时间不能小于1分钟');
    }
  }

  /**
   * @private
   * @method validateStatisticsUpdate
   * @description 验证统计信息更新
   * @param statistics 新统计信息
   */
  private validateStatisticsUpdate(
    statistics: Partial<AuthAggregateStatistics>,
  ): void {
    // 验证统计信息不能为负数
    if (
      statistics.activeSessionCount !== undefined &&
      statistics.activeSessionCount < 0
    ) {
      throw new Error('活跃会话数不能为负数');
    }

    if (
      statistics.totalLoginCount !== undefined &&
      statistics.totalLoginCount < 0
    ) {
      throw new Error('总登录次数不能为负数');
    }

    if (
      statistics.failedLoginCount !== undefined &&
      statistics.failedLoginCount < 0
    ) {
      throw new Error('失败登录次数不能为负数');
    }
  }

  /**
   * @private
   * @method validateSessionAddition
   * @description 验证会话添加
   * @param session 会话信息
   */
  private validateSessionAddition(session: AuthSession): void {
    if (
      this._state.activeSessions.some(s => s.sessionId === session.sessionId)
    ) {
      throw new Error('会话已存在');
    }

    if (!this.canAddSession()) {
      throw new Error('无法添加更多会话');
    }

    if (session.expiresAt <= new Date()) {
      throw new Error('会话过期时间不能早于当前时间');
    }
  }

  /**
   * @private
   * @method validateSessionRemoval
   * @description 验证会话移除
   * @param sessionId 会话ID
   */
  private validateSessionRemoval(sessionId: string): void {
    if (!this._state.activeSessions.some(s => s.sessionId === sessionId)) {
      throw new Error('会话不存在');
    }
  }

  /**
   * @private
   * @method validateHistoryAddition
   * @description 验证历史记录添加
   * @param history 历史记录
   */
  private validateHistoryAddition(history: AuthHistory): void {
    if (!history.eventId) {
      throw new Error('事件ID不能为空');
    }

    if (!history.eventType) {
      throw new Error('事件类型不能为空');
    }

    if (!history.eventTime) {
      throw new Error('事件时间不能为空');
    }
  }

  /**
   * @private
   * @method validateStatusChange
   * @description 验证状态变更
   * @param newStatus 新状态
   */
  private validateStatusChange(newStatus: AuthStatus): void {
    // 验证状态变更逻辑
    if (
      this._state.auth.status === AuthStatus.DISABLED &&
      newStatus === AuthStatus.ACTIVE
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
      this._state.statistics.activeSessionCount >=
      this._state.settings.maxSessions * 0.9
    ) {
      warnings.push('活跃会话数接近限制');
    }

    if (
      this._state.statistics.failedLoginCount >=
      this._state.settings.maxFailedAttempts * 0.8
    ) {
      warnings.push('失败登录次数接近限制');
    }

    // 发布警告事件
    if (warnings.length > 0) {
      this.addDomainEvent({
        type: 'AuthLimitsWarning',
        authId: this._state.auth.id.value,
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
  private addDomainEvent(event: AuthDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @static
   * @method create
   * @description 创建认证聚合根
   * @param auth 认证实体
   * @param settings 认证设置
   * @returns {AuthAggregate} 认证聚合根
   */
  static create(auth: Auth, settings: AuthAggregateSettings): AuthAggregate {
    return new AuthAggregate(auth, settings);
  }
}
