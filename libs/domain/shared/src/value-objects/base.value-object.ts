/**
 * @class BaseValueObject
 * @description 抽象值对象基类，强制实现相等性比较和不可变性
 * @rule 所有属性必须为只读
 * @example
 * class Email extends BaseValueObject {
 *   constructor(public readonly value: string) {
 *     super();
 *     this.validateFormat(value);
 *   }
 *   private validateFormat(email: string): void {
 *     if (!/^\S+@\S+\.\S+$/.test(email)) {
 *       throw new InvalidValueObjectError('Email');
 *     }
 *   }
 *   equals(other: unknown): boolean {
 *     return other instanceof Email && this.value === other.value;
 *   }
 * }
 */
export abstract class BaseValueObject {
  /**
   * @method equals
   * @description 值对象相等性比较必须实现此方法
   * @param other 对比对象
   * @returns 是否逻辑相等
   */
  public abstract equals(other: unknown): boolean;

  /**
   * @method validateInvariants
   * @description 验证值对象不变性条件
   * @throws {InvalidValueObjectError} 当违反业务规则时抛出
   */
  protected validateInvariants(): void {}
}
