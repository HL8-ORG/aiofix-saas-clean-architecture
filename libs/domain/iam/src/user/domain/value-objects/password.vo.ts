/**
 * @file password.vo.ts
 * @description 密码值对象
 *
 * 该文件定义了密码值对象，包含密码的验证规则、强度评估和业务逻辑。
 * 密码是用户身份验证的重要组成部分，需要满足安全性和可用性的要求。
 *
 * 主要功能：
 * 1. 密码格式验证（长度、字符类型、复杂度等）
 * 2. 密码强度评估
 * 3. 密码生成和转换
 * 4. 密码比较和相等性判断
 *
 * 业务规则：
 * 1. 密码长度必须在8-128个字符之间
 * 2. 必须包含至少一个大写字母、一个小写字母、一个数字
 * 3. 不能包含常见密码和弱密码
 * 4. 不能包含连续字符或键盘序列
 * 5. 密码强度分为弱、中、强三个等级
 */

/**
 * @enum PasswordStrength
 * @description 密码强度等级
 */
export enum PasswordStrength {
  WEAK = 'weak', // 弱密码
  MEDIUM = 'medium', // 中等密码
  STRONG = 'strong', // 强密码
}

/**
 * @class Password
 * @description 密码值对象
 *
 * 该值对象封装了密码的验证逻辑、强度评估和业务规则，
 * 确保密码的安全性和可用性。
 */
export class Password {
  private readonly _value: string;
  private readonly _hashedValue: string;

  /**
   * @constructor
   * @param value 密码字符串
   * @throws {Error} 当密码格式不正确时抛出错误
   */
  constructor(value: string) {
    this.validatePassword(value);
    this._value = value;
    this._hashedValue = this.hashPassword(value);
  }

  /**
   * @getter value
   * @description 获取密码字符串值（仅用于验证，不建议直接使用）
   * @returns {string} 密码
   */
  get value(): string {
    return this._value;
  }

  /**
   * @getter hashedValue
   * @description 获取密码哈希值
   * @returns {string} 密码哈希值
   */
  get hashedValue(): string {
    return this._hashedValue;
  }

  /**
   * @method toString
   * @description 转换为字符串（返回哈希值）
   * @returns {string} 密码哈希值
   */
  toString(): string {
    return this._hashedValue;
  }

  /**
   * @method equals
   * @description 比较两个密码是否相等
   * @param other 另一个密码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: Password): boolean {
    return this._hashedValue === other._hashedValue;
  }

  /**
   * @method verify
   * @description 验证密码是否匹配
   * @param plainPassword 明文密码
   * @returns {boolean} 是否匹配
   */
  verify(plainPassword: string): boolean {
    return this._hashedValue === this.hashPassword(plainPassword);
  }

  /**
   * @method getStrength
   * @description 获取密码强度
   * @returns {number} 密码强度分数（0-100）
   */
  getStrength(): number {
    let score = 0;
    const password = this._value;

    // 长度分数
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // 字符类型分数
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    // 复杂度分数
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);

    // 模式检测扣分
    if (this.hasCommonPatterns(password)) score -= 20;
    if (this.hasKeyboardSequences(password)) score -= 15;
    if (this.hasRepeatingChars(password)) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * @method getStrengthLevel
   * @description 获取密码强度等级
   * @returns {PasswordStrength} 密码强度等级
   */
  getStrengthLevel(): PasswordStrength {
    const score = this.getStrength();
    if (score < 40) return PasswordStrength.WEAK;
    if (score < 70) return PasswordStrength.MEDIUM;
    return PasswordStrength.STRONG;
  }

  /**
   * @method isStrong
   * @description 判断密码是否为强密码
   * @returns {boolean} 是否为强密码
   */
  isStrong(): boolean {
    return this.getStrengthLevel() === PasswordStrength.STRONG;
  }

  /**
   * @method isWeak
   * @description 判断密码是否为弱密码
   * @returns {boolean} 是否为弱密码
   */
  isWeak(): boolean {
    return this.getStrengthLevel() === PasswordStrength.WEAK;
  }

  /**
   * @private
   * @method validatePassword
   * @description 验证密码格式
   * @param value 密码字符串
   * @throws {Error} 当密码格式不正确时抛出错误
   */
  private validatePassword(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('密码不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('密码不能为空');
    }

    // 检查长度
    if (trimmedValue.length < 8) {
      throw new Error('密码长度不能少于8个字符');
    }

    if (trimmedValue.length > 128) {
      throw new Error('密码长度不能超过128个字符');
    }

    // 检查字符类型
    if (!/[a-z]/.test(trimmedValue)) {
      throw new Error('密码必须包含至少一个小写字母');
    }

    if (!/[A-Z]/.test(trimmedValue)) {
      throw new Error('密码必须包含至少一个大写字母');
    }

    if (!/[0-9]/.test(trimmedValue)) {
      throw new Error('密码必须包含至少一个数字');
    }

    // 检查常见密码
    if (this.isCommonPassword(trimmedValue)) {
      throw new Error('密码不能使用常见密码');
    }

    // 检查连续字符
    if (this.hasRepeatingChars(trimmedValue)) {
      throw new Error('密码不能包含连续重复的字符');
    }

    // 检查键盘序列
    if (this.hasKeyboardSequences(trimmedValue)) {
      throw new Error('密码不能包含键盘序列');
    }
  }

  /**
   * @private
   * @method hashPassword
   * @description 哈希密码（简单实现，实际应使用bcrypt等）
   * @param password 明文密码
   * @returns {string} 哈希值
   */
  private hashPassword(password: string): string {
    // 这里使用简单的哈希算法，实际项目中应使用bcrypt等安全算法
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }

  /**
   * @private
   * @method isCommonPassword
   * @description 检查是否为常见密码
   * @param password 密码
   * @returns {boolean} 是否为常见密码
   */
  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      'dragon',
      'master',
      'hello',
      'freedom',
      'whatever',
      'qwerty123',
      'trustno1',
      'jordan',
      'harley',
      'ranger',
      'iwantu',
      'jennifer',
      'hunter',
      'buster',
      'soccer',
      'baseball',
      'tiger',
      'charlie',
      'andrew',
      'michelle',
      'love',
      'sunshine',
      'jessica',
      'asshole',
      '696969',
      'pepper',
      'daniel',
      'access',
      '1234567',
      'maggie',
      '654321',
      'pussy',
      'george',
      'horses',
      'thunder',
      'cooper',
      'internet',
      'mercedes',
      'bigtits',
      'marine',
      'chicago',
      'rangers',
      'gandalf',
      'winter',
      'bigtiger',
      'barney',
      'edward',
      'raiders',
      'porn',
      'badass',
      'blowme',
      'spanky',
      'bigdaddy',
      'johnson',
      'chester',
      'london',
      'midnight',
      'blue',
      'fishing',
      '000000',
      'hacker',
      'slayer',
      'matt',
      'qwe',
      'tester',
      'jordan23',
      '123123',
      'donkey',
      'bitch',
      'white',
      'peter',
      'pacific',
      'amanda',
      'cookie',
      'orange',
      'ginger',
      'hammer',
      'silver',
      '222222',
      'yankees',
      'diablo',
      'asdf',
      'tiger1',
      'doctor',
      'gateway',
      'golfer',
      'heaven',
      'mother',
      'winner',
      'hello123',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * @private
   * @method hasRepeatingChars
   * @description 检查是否包含连续重复字符
   * @param password 密码
   * @returns {boolean} 是否包含连续重复字符
   */
  private hasRepeatingChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }
    return false;
  }

  /**
   * @private
   * @method hasKeyboardSequences
   * @description 检查是否包含键盘序列
   * @param password 密码
   * @returns {boolean} 是否包含键盘序列
   */
  private hasKeyboardSequences(password: string): boolean {
    const sequences = [
      'qwerty',
      'asdfgh',
      'zxcvbn',
      '123456',
      '654321',
      'abcdef',
      'fedcba',
      'qazwsx',
      'edcrfv',
      'tgbyhn',
      'ujmikl',
      'plokij',
      'mnbvcx',
      'lkjhgf',
      'poiuyt',
      'rewq',
      'asdf',
      'zxcv',
      'qwe',
      'asd',
      'zxc',
    ];

    const lowerPassword = password.toLowerCase();
    return sequences.some(seq => lowerPassword.includes(seq));
  }

  /**
   * @private
   * @method hasCommonPatterns
   * @description 检查是否包含常见模式
   * @param password 密码
   * @returns {boolean} 是否包含常见模式
   */
  private hasCommonPatterns(password: string): boolean {
    const patterns = [
      /(.)\1{2,}/, // 连续重复字符
      /(.)(.)\1\2/, // 重复模式
      /(.)(.)(.)\1\2\3/, // 三字符重复
    ];

    return patterns.some(pattern => pattern.test(password));
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建密码值对象
   * @param value 密码字符串
   * @returns {Password} 密码值对象
   */
  static fromString(value: string): Password {
    return new Password(value);
  }

  /**
   * @static
   * @method generate
   * @description 生成随机密码
   * @param length 密码长度
   * @param includeSpecialChars 是否包含特殊字符
   * @returns {Password} 密码值对象
   */
  static generate(
    length: number = 16,
    includeSpecialChars: boolean = true,
  ): Password {
    if (length < 8 || length > 128) {
      length = 16;
    }

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = lowercase + uppercase + numbers;
    if (includeSpecialChars) {
      chars += special;
    }

    let password = '';

    // 确保包含至少一个大写字母、一个小写字母、一个数字
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));

    if (includeSpecialChars) {
      password += special.charAt(Math.floor(Math.random() * special.length));
    }

    // 填充剩余长度
    for (let i = password.length; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 打乱密码字符顺序
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    return new Password(password);
  }
}
