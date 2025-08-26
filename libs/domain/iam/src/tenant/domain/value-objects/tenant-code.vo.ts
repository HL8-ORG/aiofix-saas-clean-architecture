/**
 * @file tenant-code.vo.ts
 * @description 租户代码值对象
 *
 * 该文件定义了租户代码值对象，用于表示租户的唯一标识代码。
 * 租户代码值对象是不可变的，通过值来定义相等性。
 *
 * 遵循DDD和Clean Architecture原则，提供统一的租户代码抽象。
 */

/**
 * @class TenantCode
 * @description 租户代码值对象
 *
 * 表示租户的唯一标识代码，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保代码格式正确
 * - 全局唯一：在系统中全局唯一
 * - 类型安全：强类型约束
 */
export class TenantCode {
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建租户代码值对象
   * @param value 租户代码字符串
   */
  constructor(value: string) {
    this.validateTenantCode(value);
    this._value = value.toLowerCase(); // 标准化为小写
  }

  /**
   * @getter value
   * @description 获取租户代码值
   * @returns {string} 租户代码字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 租户代码字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个租户代码是否相等
   * @param other 另一个租户代码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: TenantCode): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @private
   * @method validateTenantCode
   * @description 验证租户代码格式
   * @param value 租户代码字符串
   * @throws {Error} 当租户代码格式无效时抛出错误
   */
  private validateTenantCode(value: string): void {
    if (!value) {
      throw new Error('Tenant code cannot be empty');
    }

    if (value.length < 3) {
      throw new Error('Tenant code must be at least 3 characters long');
    }

    if (value.length > 20) {
      throw new Error('Tenant code cannot exceed 20 characters');
    }

    // 租户代码只能包含字母、数字和连字符
    const tenantCodeRegex = /^[a-zA-Z0-9-]+$/;
    if (!tenantCodeRegex.test(value)) {
      throw new Error(
        'Tenant code can only contain letters, numbers, and hyphens',
      );
    }

    // 不能以连字符开头或结尾
    if (value.startsWith('-') || value.endsWith('-')) {
      throw new Error('Tenant code cannot start or end with a hyphen');
    }

    // 不能包含连续连字符
    if (value.includes('--')) {
      throw new Error('Tenant code cannot contain consecutive hyphens');
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建租户代码
   * @param value 租户代码字符串
   * @returns {TenantCode} 租户代码值对象
   */
  static fromString(value: string): TenantCode {
    return new TenantCode(value);
  }
}
