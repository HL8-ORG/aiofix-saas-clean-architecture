/**
 * @file email.vo.ts
 * @description 邮箱值对象
 *
 * 该文件定义了邮箱值对象，用于表示邮箱地址。
 * 邮箱值对象是不可变的，通过值来定义相等性。
 *
 * 遵循DDD和Clean Architecture原则，提供统一的邮箱地址抽象。
 */

/**
 * @class Email
 * @description 邮箱值对象
 *
 * 表示邮箱地址，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保邮箱格式正确
 * - 类型安全：强类型约束
 */
export class Email {
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建邮箱值对象
   * @param value 邮箱地址字符串
   */
  constructor(value: string) {
    this.validateEmail(value);
    this._value = value.toLowerCase(); // 标准化为小写
  }

  /**
   * @getter value
   * @description 获取邮箱值
   * @returns {string} 邮箱字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 邮箱字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个邮箱是否相等
   * @param other 另一个邮箱值对象
   * @returns {boolean} 是否相等
   */
  equals(other: Email): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @method getDomain
   * @description 获取邮箱域名部分
   * @returns {string} 域名
   */
  getDomain(): string {
    return this._value.split('@')[1];
  }

  /**
   * @method getLocalPart
   * @description 获取邮箱本地部分
   * @returns {string} 本地部分
   */
  getLocalPart(): string {
    return this._value.split('@')[0];
  }

  /**
   * @private
   * @method validateEmail
   * @description 验证邮箱格式
   * @param value 邮箱字符串
   * @throws {Error} 当邮箱格式无效时抛出错误
   */
  private validateEmail(value: string): void {
    if (!value) {
      throw new Error('Email cannot be empty');
    }

    if (value.length > 254) {
      throw new Error('Email is too long (max 254 characters)');
    }

    // 基本的邮箱格式验证
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }

    // 检查本地部分长度
    const localPart = value.split('@')[0];
    if (localPart.length > 64) {
      throw new Error('Email local part is too long (max 64 characters)');
    }

    // 检查域名部分长度
    const domainPart = value.split('@')[1];
    if (domainPart.length > 253) {
      throw new Error('Email domain part is too long (max 253 characters)');
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建邮箱
   * @param value 邮箱字符串
   * @returns {Email} 邮箱值对象
   */
  static fromString(value: string): Email {
    return new Email(value);
  }
}
