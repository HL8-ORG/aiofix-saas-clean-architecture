/**
 * @file uuid.vo.ts
 * @description UUID v4值对象
 *
 * 该文件定义了UUID v4值对象，用于表示实体的唯一标识符。
 * UUID v4值对象是不可变的，通过值来定义相等性。
 * 使用RFC 4122标准的UUID v4格式，确保全局唯一性。
 *
 * 遵循DDD和Clean Architecture原则，提供统一的标识符抽象。
 */

/**
 * @class Uuid
 * @description UUID v4值对象
 *
 * 表示实体的唯一标识符，使用RFC 4122标准的UUID v4格式，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 唯一性：全局唯一标识（基于随机数生成）
 * - 类型安全：强类型约束
 * - 版本控制：严格遵循UUID v4格式规范
 */
export class Uuid {
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建UUID值对象
   * @param value UUID字符串值
   */
  constructor(value: string) {
    this.validateUuid(value);
    this._value = value;
  }

  /**
   * @getter value
   * @description 获取UUID值
   * @returns {string} UUID字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} UUID字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个UUID是否相等
   * @param other 另一个UUID值对象
   * @returns {boolean} 是否相等
   */
  equals(other: Uuid): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @private
   * @method validateUuid
   * @description 验证UUID v4格式
   * @param value UUID字符串
   * @throws {Error} 当UUID格式无效时抛出错误
   */
  private validateUuid(value: string): void {
    if (!value) {
      throw new Error('UUID cannot be empty');
    }

    // UUID v4格式验证：版本位必须是4，变体位必须是8、9、a或b
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(value)) {
      throw new Error(`Invalid UUID v4 format: ${value}`);
    }
  }

  /**
   * @static
   * @method generate
   * @description 生成新的UUID v4
   * @returns {Uuid} 新的UUID v4值对象
   */
  static generate(): Uuid {
    // 使用crypto.randomUUID()生成符合RFC 4122标准的UUID v4
    const uuid = crypto.randomUUID();
    return new Uuid(uuid);
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建UUID v4
   * @param value UUID v4字符串
   * @returns {Uuid} UUID v4值对象
   */
  static fromString(value: string): Uuid {
    return new Uuid(value);
  }
}
