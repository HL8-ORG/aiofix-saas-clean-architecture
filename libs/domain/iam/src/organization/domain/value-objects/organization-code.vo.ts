/**
 * @file organization-code.vo.ts
 * @description 组织代码值对象
 *
 * 该文件定义了组织代码值对象，包含组织代码的验证规则和业务逻辑。
 * 组织代码是组织在系统中的唯一标识符，需要满足特定的格式要求。
 *
 * 主要功能：
 * 1. 组织代码格式验证（长度、字符类型、唯一性等）
 * 2. 组织代码生成和转换
 * 3. 组织代码比较和相等性判断
 *
 * 业务规则：
 * 1. 组织代码长度必须在3-20个字符之间
 * 2. 只能包含字母、数字、连字符和下划线
 * 3. 不能以连字符或下划线开头或结尾
 * 4. 不能包含连续的两个连字符或下划线
 * 5. 不能是纯数字
 * 6. 组织代码在租户内必须唯一
 */

/**
 * @class OrganizationCode
 * @description 组织代码值对象
 *
 * 该值对象封装了组织代码的验证逻辑和业务规则，
 * 确保组织代码的格式正确性和唯一性。
 */
export class OrganizationCode {
  private readonly _value: string;

  /**
   * @constructor
   * @param value 组织代码字符串
   * @throws {Error} 当组织代码格式不正确时抛出错误
   */
  constructor(value: string) {
    this.validateOrganizationCode(value);
    this._value = value.toUpperCase(); // 统一转换为大写
  }

  /**
   * @getter value
   * @description 获取组织代码字符串值
   * @returns {string} 组织代码
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 组织代码字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个组织代码是否相等
   * @param other 另一个组织代码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: OrganizationCode | null | undefined): boolean {
    if (!other) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * @private
   * @method validateOrganizationCode
   * @description 验证组织代码格式
   * @param value 组织代码字符串
   * @throws {Error} 当组织代码格式不正确时抛出错误
   */
  private validateOrganizationCode(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('组织代码不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('组织代码不能为空');
    }

    // 检查长度
    if (trimmedValue.length < 3) {
      throw new Error('组织代码长度不能少于3个字符');
    }

    if (trimmedValue.length > 20) {
      throw new Error('组织代码长度不能超过20个字符');
    }

    // 检查字符类型
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmedValue)) {
      throw new Error('组织代码只能包含字母、数字、连字符和下划线');
    }

    // 检查是否以连字符或下划线开头或结尾
    if (
      trimmedValue.startsWith('-') ||
      trimmedValue.startsWith('_') ||
      trimmedValue.endsWith('-') ||
      trimmedValue.endsWith('_')
    ) {
      throw new Error('组织代码不能以连字符或下划线开头或结尾');
    }

    // 检查是否包含连续的两个连字符或下划线
    if (
      trimmedValue.includes('--') ||
      trimmedValue.includes('__') ||
      trimmedValue.includes('-_') ||
      trimmedValue.includes('_-')
    ) {
      throw new Error('组织代码不能包含连续的连字符或下划线');
    }

    // 检查是否为纯数字
    if (/^\d+$/.test(trimmedValue)) {
      throw new Error('组织代码不能是纯数字');
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
      'org',
      'organization',
      'company',
      'corp',
      'corporation',
      'inc',
      'llc',
      'ltd',
      'limited',
      'co',
      'company',
      'group',
      'team',
      'department',
      'division',
      'unit',
      'branch',
      'office',
      'location',
      'site',
      'facility',
    ];

    if (reservedWords.includes(trimmedValue.toLowerCase())) {
      throw new Error('组织代码不能使用系统保留字');
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建组织代码值对象
   * @param value 组织代码字符串
   * @returns {OrganizationCode} 组织代码值对象
   */
  static fromString(value: string): OrganizationCode {
    return new OrganizationCode(value);
  }

  /**
   * @static
   * @method generateFromName
   * @description 从组织名称生成组织代码
   * @param name 组织名称
   * @returns {OrganizationCode} 组织代码值对象
   */
  static generateFromName(name: string): OrganizationCode {
    if (!name || typeof name !== 'string') {
      throw new Error('组织名称不能为空');
    }

    // 清理组织名称，只保留字母、数字、连字符和下划线
    let code = name.replace(/[^a-zA-Z0-9\s_-]/g, '');

    // 将空格替换为连字符
    code = code.replace(/\s+/g, '-');

    // 转换为大写
    code = code.toUpperCase();

    // 确保长度在3-20之间
    if (code.length < 3) {
      code = code + 'ORG';
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
      code = 'ORG';
    }

    return new OrganizationCode(code);
  }

  /**
   * @static
   * @method generate
   * @description 生成随机组织代码
   * @param prefix 组织代码前缀
   * @param length 组织代码长度
   * @returns {OrganizationCode} 组织代码值对象
   */
  static generate(
    prefix: string = 'ORG',
    length: number = 8,
  ): OrganizationCode {
    if (!prefix || typeof prefix !== 'string') {
      prefix = 'ORG';
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
    return new OrganizationCode(code);
  }
}
