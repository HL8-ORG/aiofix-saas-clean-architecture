/**
 * @file auth-domain.service.ts
 * @description 认证领域服务
 *
 * 该文件定义了认证领域服务，负责处理认证相关的复杂业务逻辑。
 * 该服务封装了不自然属于认证实体的业务规则和操作。
 */

import {
  Auth,
  AuthStatus,
  AuthSession,
  AuthHistory,
} from '../entities/auth.entity';
import { Uuid } from '@aiofix/domain-shared';

/**
 * @interface PasswordPolicy
 * @description 密码策略接口
 */
interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

/**
 * @interface DeviceInfo
 * @description 设备信息接口
 */
interface DeviceInfo {
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city?: string;
  };
  deviceType?: string;
}

/**
 * @interface AuthMetadata
 * @description 认证元数据接口
 */
interface AuthMetadata {
  [key: string]: unknown;
}

/**
 * @interface LoginRequest
 * @description 登录请求
 */
export interface LoginRequest {
  userId: string;
  credentials: {
    username?: string;
    password?: string;
    token?: string;
    oauthCode?: string;
    apiKey?: string;
  };
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
    deviceType: string;
    os: string;
    browser: string;
    version: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  rememberMe?: boolean;
  mfaCode?: string;
}

/**
 * @interface LogoutRequest
 * @description 登出请求
 */
export interface LogoutRequest {
  authId: string;
  sessionId?: string;
  reason?: string;
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * @interface RefreshTokenRequest
 * @description 刷新令牌请求
 */
export interface RefreshTokenRequest {
  authId: string;
  refreshToken: string;
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * @interface ChangePasswordRequest
 * @description 修改密码请求
 */
export interface ChangePasswordRequest {
  authId: string;
  currentPassword: string;
  newPassword: string;
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * @interface ResetPasswordRequest
 * @description 重置密码请求
 */
export interface ResetPasswordRequest {
  authId: string;
  resetToken: string;
  newPassword: string;
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * @interface EnableMFARequest
 * @description 启用多因素认证请求
 */
export interface EnableMFARequest {
  authId: string;
  mfaType: 'totp' | 'sms' | 'email';
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * @interface DisableMFARequest
 * @description 禁用多因素认证请求
 */
export interface DisableMFARequest {
  authId: string;
  currentPassword: string;
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * @interface AuthValidationResult
 * @description 认证验证结果
 */
export interface AuthValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * @interface LoginResult
 * @description 登录结果
 */
export interface LoginResult {
  success: boolean;
  auth?: Auth;
  session?: AuthSession;
  error?: string;
  requiresMFA?: boolean;
  mfaType?: string;
}

/**
 * @class AuthDomainService
 * @description 认证领域服务
 *
 * 该服务负责处理认证相关的复杂业务逻辑，包括：
 * 1. 用户登录的业务规则验证
 * 2. 会话管理的业务逻辑
 * 3. 令牌管理的业务规则
 * 4. 多因素认证的业务逻辑
 * 5. 密码策略的验证和管理
 * 6. 安全策略的检查和执行
 */
export class AuthDomainService {
  /**
   * @method validateLoginRequest
   * @description 验证登录请求
   * @param request 登录请求
   * @returns {AuthValidationResult} 验证结果
   */
  validateLoginRequest(request: LoginRequest): AuthValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证基本信息
    if (!request.userId) {
      errors.push('用户ID不能为空');
    }

    if (!request.credentials) {
      errors.push('认证凭据不能为空');
    }

    // 验证凭据类型
    const hasCredentials =
      request.credentials.username ||
      request.credentials.password ||
      request.credentials.token ||
      request.credentials.oauthCode ||
      request.credentials.apiKey;

    if (!hasCredentials) {
      errors.push('至少需要提供一种认证凭据');
    }

    // 验证设备信息
    if (!request.deviceInfo.ipAddress) {
      errors.push('IP地址不能为空');
    }

    if (!request.deviceInfo.userAgent) {
      errors.push('用户代理不能为空');
    }

    // 验证位置信息（可选）
    if (request.location) {
      if (!request.location.country) {
        warnings.push('位置信息不完整');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * @method validatePassword
   * @description 验证密码强度
   * @param password 密码
   * @param policy 密码策略
   * @returns {AuthValidationResult} 验证结果
   */
  validatePassword(
    password: string,
    policy: PasswordPolicy,
  ): AuthValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('密码不能为空');
      return { isValid: false, errors };
    }

    // 验证密码长度
    if (password.length < policy.minLength) {
      errors.push(`密码长度不能少于${policy.minLength}个字符`);
    }

    // 验证密码复杂度
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('密码必须包含大写字母');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('密码必须包含小写字母');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('密码必须包含数字');
    }

    if (
      policy.requireSpecialChars &&
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    ) {
      errors.push('密码必须包含特殊字符');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method validateDeviceInfo
   * @description 验证设备信息
   * @param deviceInfo 设备信息
   * @returns {AuthValidationResult} 验证结果
   */
  validateDeviceInfo(deviceInfo: DeviceInfo): AuthValidationResult {
    const errors: string[] = [];

    if (!deviceInfo.ipAddress) {
      errors.push('IP地址不能为空');
    }

    if (!deviceInfo.userAgent) {
      errors.push('用户代理不能为空');
    }

    // 验证IP地址格式
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (deviceInfo.ipAddress && !ipRegex.test(deviceInfo.ipAddress)) {
      errors.push('IP地址格式不正确');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method checkSecurityPolicy
   * @description 检查安全策略
   * @param auth 认证实体
   * @param deviceInfo 设备信息
   * @returns {AuthValidationResult} 检查结果
   */
  checkSecurityPolicy(
    auth: Auth,
    deviceInfo: DeviceInfo,
  ): AuthValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查账户锁定状态
    if (auth.status === AuthStatus.DISABLED) {
      errors.push('账户已被禁用');
    }

    if (auth.status === AuthStatus.SUSPENDED) {
      errors.push('账户已被暂停');
    }

    // 检查会话数量限制
    const activeSessions = auth.sessions.filter(
      session => session.expiresAt > new Date(),
    );

    if (activeSessions.length >= auth.settings.maxConcurrentSessions) {
      errors.push('已达到最大并发会话数限制');
    }

    // 检查失败尝试次数
    const recentFailures = auth.history.filter(
      record =>
        !record.success &&
        record.eventTime > new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时内
    );

    if (
      recentFailures.length >= auth.settings.lockoutPolicy.maxFailedAttempts
    ) {
      errors.push('账户已被锁定，请稍后再试');
    }

    // 检查可疑活动
    const suspiciousActivity = this.detectSuspiciousActivity(auth, deviceInfo);
    if (suspiciousActivity) {
      warnings.push('检测到可疑活动，建议启用多因素认证');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * @method detectSuspiciousActivity
   * @description 检测可疑活动
   * @param auth 认证实体
   * @param deviceInfo 设备信息
   * @returns {boolean} 是否检测到可疑活动
   */
  private detectSuspiciousActivity(
    auth: Auth,
    deviceInfo: DeviceInfo,
  ): boolean {
    // 检查地理位置异常
    const recentSessions = auth.sessions.filter(
      session =>
        session.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天内
    );

    if (recentSessions.length > 0) {
      const lastSession = recentSessions[recentSessions.length - 1];
      if (lastSession.location && deviceInfo.location) {
        // 简单的地理位置检查（实际应用中需要更复杂的逻辑）
        if (lastSession.location.country !== deviceInfo.location.country) {
          return true;
        }
      }
    }

    // 检查设备类型异常
    const deviceTypes = recentSessions.map(session => session.deviceInfo.type);
    if (
      deviceTypes.length > 0 &&
      deviceInfo.deviceType &&
      !deviceTypes.includes(deviceInfo.deviceType)
    ) {
      return true;
    }

    return false;
  }

  /**
   * @method validateMFA
   * @description 验证多因素认证
   * @param auth 认证实体
   * @param mfaCode 多因素认证代码
   * @param mfaType 多因素认证类型
   * @returns {AuthValidationResult} 验证结果
   */
  validateMFA(
    auth: Auth,
    mfaCode: string,
    mfaType: string,
  ): AuthValidationResult {
    const errors: string[] = [];

    if (!auth.settings.requireMFA) {
      errors.push('多因素认证未启用');
      return { isValid: false, errors };
    }

    if (!mfaCode) {
      errors.push('多因素认证代码不能为空');
      return { isValid: false, errors };
    }

    // 验证MFA代码格式
    if (mfaType === 'totp') {
      if (!/^\d{6}$/.test(mfaCode)) {
        errors.push('TOTP代码必须是6位数字');
      }
    } else if (mfaType === 'sms' || mfaType === 'email') {
      if (!/^\d{4,8}$/.test(mfaCode)) {
        errors.push('验证码格式不正确');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method validateTokenRefresh
   * @description 验证令牌刷新
   * @param auth 认证实体
   * @param refreshToken 刷新令牌
   * @returns {AuthValidationResult} 验证结果
   */
  validateTokenRefresh(auth: Auth, refreshToken: string): AuthValidationResult {
    const errors: string[] = [];

    if (!auth.refreshToken) {
      errors.push('刷新令牌不存在');
      return { isValid: false, errors };
    }

    if (auth.refreshToken.value !== refreshToken) {
      errors.push('刷新令牌无效');
      return { isValid: false, errors };
    }

    if (auth.refreshToken.isExpired()) {
      errors.push('刷新令牌已过期');
      return { isValid: false, errors };
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method validatePasswordChange
   * @description 验证密码修改
   * @param auth 认证实体
   * @param currentPassword 当前密码
   * @param newPassword 新密码
   * @returns {AuthValidationResult} 验证结果
   */
  validatePasswordChange(
    auth: Auth,
    currentPassword: string,
    newPassword: string,
  ): AuthValidationResult {
    const errors: string[] = [];

    // 验证当前密码
    if (!currentPassword) {
      errors.push('当前密码不能为空');
    }

    // 验证新密码
    const passwordValidation = this.validatePassword(
      newPassword,
      auth.settings.passwordPolicy,
    );
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // 验证新密码不能与当前密码相同
    if (currentPassword === newPassword) {
      errors.push('新密码不能与当前密码相同');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method validateSessionManagement
   * @description 验证会话管理
   * @param auth 认证实体
   * @param sessionId 会话ID
   * @returns {AuthValidationResult} 验证结果
   */
  validateSessionManagement(
    auth: Auth,
    sessionId?: string,
  ): AuthValidationResult {
    const errors: string[] = [];

    if (sessionId) {
      const session = auth.sessions.find(s => s.sessionId === sessionId);
      if (!session) {
        errors.push('会话不存在');
      } else if (session.expiresAt <= new Date()) {
        errors.push('会话已过期');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method generateSessionId
   * @description 生成会话ID
   * @returns {string} 会话ID
   */
  generateSessionId(): string {
    return Uuid.generate().value;
  }

  /**
   * @method calculateSessionExpiry
   * @description 计算会话过期时间
   * @param sessionTimeout 会话超时时间（分钟）
   * @param rememberMe 是否记住我
   * @returns {Date} 过期时间
   */
  calculateSessionExpiry(
    sessionTimeout: number,
    rememberMe: boolean = false,
  ): Date {
    const now = new Date();
    const timeoutMs = rememberMe
      ? sessionTimeout * 2 * 60 * 1000
      : sessionTimeout * 60 * 1000;
    return new Date(now.getTime() + timeoutMs);
  }

  /**
   * @method createAuthHistory
   * @description 创建认证历史记录
   * @param eventType 事件类型
   * @param success 是否成功
   * @param deviceInfo 设备信息
   * @param failureReason 失败原因
   * @param metadata 元数据
   * @returns {AuthHistory} 认证历史记录
   */
  createAuthHistory(
    eventType: string,
    success: boolean,
    deviceInfo: DeviceInfo,
    failureReason?: string,
    metadata?: AuthMetadata,
  ): AuthHistory {
    return {
      eventId: Uuid.generate().value,
      eventType,
      eventTime: new Date(),
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      success,
      failureReason,
      metadata,
    };
  }

  /**
   * @method validateApiKey
   * @description 验证API密钥
   * @param auth 认证实体
   * @param apiKey API密钥
   * @returns {AuthValidationResult} 验证结果
   */
  validateApiKey(auth: Auth, apiKey: string): AuthValidationResult {
    const errors: string[] = [];

    if (!auth.apiKey) {
      errors.push('API密钥不存在');
      return { isValid: false, errors };
    }

    if (auth.apiKey.value !== apiKey) {
      errors.push('API密钥无效');
      return { isValid: false, errors };
    }

    if (auth.apiKey.isExpired()) {
      errors.push('API密钥已过期');
      return { isValid: false, errors };
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method checkRateLimit
   * @description 检查速率限制
   * @param auth 认证实体
   * @param eventType 事件类型
   * @returns {AuthValidationResult} 检查结果
   */
  checkRateLimit(auth: Auth, eventType: string): AuthValidationResult {
    const errors: string[] = [];

    // 检查登录速率限制
    if (eventType === 'login') {
      const recentLogins = auth.history.filter(
        record =>
          record.eventType === 'login' &&
          record.eventTime > new Date(Date.now() - 15 * 60 * 1000), // 15分钟内
      );

      if (recentLogins.length >= 5) {
        errors.push('登录尝试过于频繁，请稍后再试');
      }
    }

    // 检查密码重置速率限制
    if (eventType === 'password_reset') {
      const recentResets = auth.history.filter(
        record =>
          record.eventType === 'password_reset' &&
          record.eventTime > new Date(Date.now() - 60 * 60 * 1000), // 1小时内
      );

      if (recentResets.length >= 3) {
        errors.push('密码重置请求过于频繁，请稍后再试');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
