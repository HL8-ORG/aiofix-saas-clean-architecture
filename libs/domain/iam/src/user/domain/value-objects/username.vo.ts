/**
 * @file username.vo.ts
 * @description 用户名值对象
 *
 * 该文件定义了用户名字值对象，包含用户名的验证规则和业务逻辑。
 * 用户名是用户在系统中的唯一标识符，需要满足特定的格式要求。
 *
 * 主要功能：
 * 1. 用户名格式验证（长度、字符类型、唯一性等）
 * 2. 用户名生成和转换
 * 3. 用户名比较和相等性判断
 *
 * 业务规则：
 * 1. 用户名长度必须在3-30个字符之间
 * 2. 只能包含字母、数字、连字符和下划线
 * 3. 不能以连字符或下划线开头或结尾
 * 4. 不能包含连续的连字符或下划线
 * 5. 不能是纯数字
 * 6. 用户名在租户内必须唯一
 */

// Uuid import removed as it's not used in this file

/**
 * @class Username
 * @description 用户名字值对象
 *
 * 该值对象封装了用户名的验证逻辑和业务规则，
 * 确保用户名的格式正确性和唯一性。
 */
export class Username {
  private readonly _value: string;

  /**
   * @constructor
   * @param value 用户名字符串
   * @throws {Error} 当用户名格式不正确时抛出错误
   */
  constructor(value: string) {
    this.validateUsername(value);
    this._value = value.toLowerCase(); // 统一转换为小写
  }

  /**
   * @getter value
   * @description 获取用户名字符串值
   * @returns {string} 用户名
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 用户名字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个用户名是否相等
   * @param other 另一个用户名值对象
   * @returns {boolean} 是否相等
   */
  equals(other: Username): boolean {
    return this._value === other._value;
  }

  /**
   * @private
   * @method validateUsername
   * @description 验证用户名格式
   * @param value 用户名字符串
   * @throws {Error} 当用户名格式不正确时抛出错误
   */
  private validateUsername(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('用户名不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('用户名不能为空');
    }

    // 检查长度
    if (trimmedValue.length < 3) {
      throw new Error('用户名长度不能少于3个字符');
    }

    if (trimmedValue.length > 30) {
      throw new Error('用户名长度不能超过30个字符');
    }

    // 检查字符类型
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmedValue)) {
      throw new Error('用户名只能包含字母、数字、连字符和下划线');
    }

    // 检查是否以连字符或下划线开头或结尾
    if (
      trimmedValue.startsWith('-') ||
      trimmedValue.startsWith('_') ||
      trimmedValue.endsWith('-') ||
      trimmedValue.endsWith('_')
    ) {
      throw new Error('用户名不能以连字符或下划线开头或结尾');
    }

    // 检查是否包含连续的两个连字符或下划线
    if (
      trimmedValue.includes('--') ||
      trimmedValue.includes('__') ||
      trimmedValue.includes('-_') ||
      trimmedValue.includes('_-')
    ) {
      throw new Error('用户名不能包含连续的连字符或下划线');
    }

    // 检查是否为纯数字
    if (/^\d+$/.test(trimmedValue)) {
      throw new Error('用户名不能是纯数字');
    }

    // 检查保留字
    const reservedWords = [
      'admin',
      'administrator',
      'root',
      'system',
      'guest',
      'anonymous',
      'null',
      'undefined',
      'test',
      'demo',
      'example',
      'sample',
      'user',
      'username',
      'login',
      'signin',
      'signup',
      'register',
      'account',
      'profile',
      'settings',
      'config',
      'help',
      'support',
    ];

    if (reservedWords.includes(trimmedValue.toLowerCase())) {
      throw new Error('用户名不能使用系统保留字');
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建用户名值对象
   * @param value 用户名字符串
   * @returns {Username} 用户名值对象
   */
  static fromString(value: string): Username {
    return new Username(value);
  }

  /**
   * @static
   * @method fromEmail
   * @description 从邮箱地址生成用户名
   * @param email 邮箱地址
   * @returns {Username} 用户名值对象
   */
  static fromEmail(email: string): Username {
    if (!email || typeof email !== 'string') {
      throw new Error('邮箱地址不能为空');
    }

    // 提取邮箱前缀部分
    const emailPrefix = email.split('@')[0];
    if (!emailPrefix) {
      throw new Error('无效的邮箱地址');
    }

    // 清理邮箱前缀，只保留字母、数字、连字符和下划线
    let username = emailPrefix.replace(/[^a-zA-Z0-9_-]/g, '');

    // 确保长度在3-30之间
    if (username.length < 3) {
      username = username + 'user';
    } else if (username.length > 30) {
      username = username.substring(0, 30);
    }

    // 确保不以连字符或下划线结尾
    while (username.endsWith('-') || username.endsWith('_')) {
      username = username.slice(0, -1);
    }

    // 确保不以连字符或下划线开头
    while (username.startsWith('-') || username.startsWith('_')) {
      username = username.slice(1);
    }

    // 如果清理后为空，使用默认用户名
    if (username.length === 0) {
      username = 'user';
    }

    return new Username(username);
  }

  /**
   * @static
   * @method generate
   * @description 生成随机用户名
   * @param prefix 用户名前缀
   * @param length 用户名长度
   * @returns {Username} 用户名值对象
   */
  static generate(prefix: string = 'user', length: number = 8): Username {
    if (!prefix || typeof prefix !== 'string') {
      prefix = 'user';
    }

    if (length < 3 || length > 30) {
      length = 8;
    }

    // 生成随机字符串
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';
    for (let i = 0; i < length - prefix.length; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const username = prefix + randomPart;
    return new Username(username);
  }
}
