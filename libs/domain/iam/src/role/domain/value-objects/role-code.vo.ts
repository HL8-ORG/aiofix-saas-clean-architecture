/**
 * @file role-code.vo.ts
 * @description 角色代码值对象
 *
 * 该文件定义了角色代码值对象，包含角色代码的验证规则和业务逻辑。
 * 角色代码是角色在系统中的唯一标识符，需要满足特定的格式要求。
 *
 * 主要功能：
 * 1. 角色代码格式验证（长度、字符类型、唯一性等）
 * 2. 角色代码生成和转换
 * 3. 角色代码比较和相等性判断
 *
 * 业务规则：
 * 1. 角色代码长度必须在3-20个字符之间
 * 2. 只能包含字母、数字、连字符和下划线
 * 3. 不能以连字符或下划线开头或结尾
 * 4. 不能包含连续的两个连字符或下划线
 * 5. 不能是纯数字
 * 6. 角色代码在组织内必须唯一
 */

/**
 * @class RoleCode
 * @description 角色代码值对象
 *
 * 该值对象封装了角色代码的验证逻辑和业务规则，
 * 确保角色代码的格式正确性和唯一性。
 */
export class RoleCode {
  private readonly _value: string;

  /**
   * @constructor
   * @param value 角色代码字符串
   * @throws {Error} 当角色代码格式不正确时抛出错误
   */
  constructor(value: string) {
    this.validateRoleCode(value);
    this._value = value.toUpperCase(); // 统一转换为大写
  }

  /**
   * @getter value
   * @description 获取角色代码字符串值
   * @returns {string} 角色代码
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 角色代码字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个角色代码是否相等
   * @param other 另一个角色代码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: RoleCode | null | undefined): boolean {
    if (!other) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * @private
   * @method validateRoleCode
   * @description 验证角色代码格式
   * @param value 角色代码字符串
   * @throws {Error} 当角色代码格式不正确时抛出错误
   */
  private validateRoleCode(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('角色代码不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('角色代码不能为空');
    }

    // 检查长度
    if (trimmedValue.length < 3) {
      throw new Error('角色代码长度不能少于3个字符');
    }

    if (trimmedValue.length > 20) {
      throw new Error('角色代码长度不能超过20个字符');
    }

    // 检查字符类型
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmedValue)) {
      throw new Error('角色代码只能包含字母、数字、连字符和下划线');
    }

    // 检查是否以连字符或下划线开头或结尾
    if (
      trimmedValue.startsWith('-') ||
      trimmedValue.startsWith('_') ||
      trimmedValue.endsWith('-') ||
      trimmedValue.endsWith('_')
    ) {
      throw new Error('角色代码不能以连字符或下划线开头或结尾');
    }

    // 检查是否包含连续的两个连字符或下划线
    if (
      trimmedValue.includes('--') ||
      trimmedValue.includes('__') ||
      trimmedValue.includes('-_') ||
      trimmedValue.includes('_-')
    ) {
      throw new Error('角色代码不能包含连续的连字符或下划线');
    }

    // 检查是否为纯数字
    if (/^\d+$/.test(trimmedValue)) {
      throw new Error('角色代码不能是纯数字');
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
      'role',
      'user',
      'group',
      'team',
      'member',
      'owner',
      'super',
      'master',
      'primary',
      'secondary',
      'backup',
      'temp',
      'public',
      'private',
      'internal',
      'external',
      'guest',
      'visitor',
      'read',
      'write',
      'execute',
      'delete',
      'create',
      'update',
      'view',
      'edit',
      'manage',
      'control',
      'access',
      'permission',
    ];

    if (reservedWords.includes(trimmedValue.toLowerCase())) {
      throw new Error('角色代码不能使用系统保留字');
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建角色代码值对象
   * @param value 角色代码字符串
   * @returns {RoleCode} 角色代码值对象
   */
  static fromString(value: string): RoleCode {
    return new RoleCode(value);
  }

  /**
   * @static
   * @method generateFromName
   * @description 从角色名称生成角色代码
   * @param name 角色名称
   * @returns {RoleCode} 角色代码值对象
   */
  static generateFromName(name: string): RoleCode {
    if (!name || typeof name !== 'string') {
      throw new Error('角色名称不能为空');
    }

    // 清理角色名称，只保留字母、数字、连字符和下划线
    let code = name.replace(/[^a-zA-Z0-9\s_-]/g, '');

    // 将空格替换为连字符
    code = code.replace(/\s+/g, '-');

    // 转换为大写
    code = code.toUpperCase();

    // 确保长度在3-20之间
    if (code.length < 3) {
      code = code + 'ROLE';
    } else if (code.length > 20) {
      code = code.substring(0, 20);
    }

    // 确保不以连字符或下划线结尾
    while (code.endsWith('-') || code.endsWith('_')) {
      code = code.slice(0, -1);
    }

    // 确保不以连字符或下划线开头
    while (code.startsWith('-') || code.startsWith('_')) {
      code = code.slice(1);
    }

    // 如果清理后为空，使用默认代码
    if (code.length === 0) {
      code = 'ROLE';
    }

    return new RoleCode(code);
  }

  /**
   * @static
   * @method generate
   * @description 生成随机角色代码
   * @param prefix 角色代码前缀
   * @param length 角色代码长度
   * @returns {RoleCode} 角色代码值对象
   */
  static generate(prefix: string = 'ROLE', length: number = 8): RoleCode {
    if (!prefix || typeof prefix !== 'string') {
      prefix = 'ROLE';
    }

    if (length < 3 || length > 20) {
      length = 8;
    }

    // 生成随机字符串
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < length - prefix.length; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const code = prefix + randomPart;
    return new RoleCode(code);
  }
}
