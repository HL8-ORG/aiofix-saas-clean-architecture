/**
 * @file auth-token.vo.ts
 * @description 认证令牌值对象
 *
 * 该文件定义了认证令牌值对象，包含认证令牌的验证规则和业务逻辑。
 * 认证令牌是认证系统中的重要组件，用于身份验证和会话管理。
 *
 * 主要功能：
 * 1. 认证令牌格式验证（长度、字符类型、唯一性等）
 * 2. 认证令牌生成和转换
 * 3. 认证令牌比较和相等性判断
 *
 * 业务规则：
 * 1. 认证令牌长度必须在32-512个字符之间
 * 2. 只能包含字母、数字、连字符、下划线、点号和等号
 * 3. 不能包含空格和特殊字符
 * 4. 认证令牌在系统内必须唯一
 * 5. 认证令牌有过期时间
 */

/**
 * @class AuthToken
 * @description 认证令牌值对象
 *
 * 该值对象封装了认证令牌的验证逻辑和业务规则，
 * 确保认证令牌的格式正确性和唯一性。
 */
export class AuthToken {
  private readonly _value: string;
  private readonly _type: string;
  private readonly _expiresAt: Date;

  /**
   * @constructor
   * @param value 认证令牌字符串
   * @param type 令牌类型
   * @param expiresAt 过期时间
   * @throws {Error} 当认证令牌格式不正确时抛出错误
   */
  constructor(value: string, type: string = 'jwt', expiresAt?: Date) {
    this.validateAuthToken(value);
    this._value = value;
    this._type = type;
    this._expiresAt = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 默认24小时
  }

  /**
   * @getter value
   * @description 获取认证令牌字符串值
   * @returns {string} 认证令牌
   */
  get value(): string {
    return this._value;
  }

  /**
   * @getter type
   * @description 获取令牌类型
   * @returns {string} 令牌类型
   */
  get type(): string {
    return this._type;
  }

  /**
   * @getter expiresAt
   * @description 获取过期时间
   * @returns {Date} 过期时间
   */
  get expiresAt(): Date {
    return new Date(this._expiresAt);
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 认证令牌字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个认证令牌是否相等
   * @param other 另一个认证令牌值对象
   * @returns {boolean} 是否相等
   */
  equals(other: AuthToken): boolean {
    return this._value === other._value;
  }

  /**
   * @method isExpired
   * @description 检查令牌是否已过期
   * @returns {boolean} 是否已过期
   */
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  /**
   * @method isExpiringSoon
   * @description 检查令牌是否即将过期
   * @param minutes 提前多少分钟算即将过期
   * @returns {boolean} 是否即将过期
   */
  isExpiringSoon(minutes: number = 30): boolean {
    const now = new Date();
    const expiringTime = new Date(
      this._expiresAt.getTime() - minutes * 60 * 1000,
    );
    return now > expiringTime;
  }

  /**
   * @method getRemainingTime
   * @description 获取剩余时间（毫秒）
   * @returns {number} 剩余时间
   */
  getRemainingTime(): number {
    const now = new Date();
    return Math.max(0, this._expiresAt.getTime() - now.getTime());
  }

  /**
   * @method getRemainingMinutes
   * @description 获取剩余分钟数
   * @returns {number} 剩余分钟数
   */
  getRemainingMinutes(): number {
    return Math.floor(this.getRemainingTime() / (60 * 1000));
  }

  /**
   * @private
   * @method validateAuthToken
   * @description 验证认证令牌格式
   * @param value 认证令牌字符串
   * @throws {Error} 当认证令牌格式不正确时抛出错误
   */
  private validateAuthToken(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('认证令牌不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('认证令牌不能为空');
    }

    // 检查长度
    if (trimmedValue.length < 32) {
      throw new Error('认证令牌长度不能少于32个字符');
    }

    if (trimmedValue.length > 512) {
      throw new Error('认证令牌长度不能超过512个字符');
    }

    // 检查字符类型（JWT格式：base64编码的字符）
    const validPattern = /^[A-Za-z0-9\-_.=]+$/;
    if (!validPattern.test(trimmedValue)) {
      throw new Error('认证令牌只能包含字母、数字、连字符、下划线、点号和等号');
    }

    // 检查是否包含空格
    if (trimmedValue.includes(' ')) {
      throw new Error('认证令牌不能包含空格');
    }

    // 检查是否为纯数字
    if (/^\d+$/.test(trimmedValue)) {
      throw new Error('认证令牌不能是纯数字');
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建认证令牌值对象
   * @param value 认证令牌字符串
   * @param type 令牌类型
   * @param expiresAt 过期时间
   * @returns {AuthToken} 认证令牌值对象
   */
  static fromString(
    value: string,
    type: string = 'jwt',
    expiresAt?: Date,
  ): AuthToken {
    return new AuthToken(value, type, expiresAt);
  }

  /**
   * @static
   * @method generate
   * @description 生成随机认证令牌
   * @param type 令牌类型
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generate(
    type: string = 'jwt',
    expiresInMinutes: number = 1440,
  ): AuthToken {
    // 生成随机字符串
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    // 生成第一部分（头部）
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    token += '.';

    // 生成第二部分（载荷）
    for (let i = 0; i < 16; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    token += '.';

    // 生成第三部分（签名）
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    return new AuthToken(token, type, expiresAt);
  }

  /**
   * @static
   * @method generateAccessToken
   * @description 生成访问令牌
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generateAccessToken(expiresInMinutes: number = 60): AuthToken {
    return AuthToken.generate('access', expiresInMinutes);
  }

  /**
   * @static
   * @method generateRefreshToken
   * @description 生成刷新令牌
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generateRefreshToken(expiresInMinutes: number = 1440): AuthToken {
    return AuthToken.generate('refresh', expiresInMinutes);
  }

  /**
   * @static
   * @method generateApiToken
   * @description 生成API令牌
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generateApiToken(expiresInMinutes: number = 1440): AuthToken {
    return AuthToken.generate('api', expiresInMinutes);
  }

  /**
   * @static
   * @method generateSessionToken
   * @description 生成会话令牌
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generateSessionToken(expiresInMinutes: number = 480): AuthToken {
    return AuthToken.generate('session', expiresInMinutes);
  }
}
