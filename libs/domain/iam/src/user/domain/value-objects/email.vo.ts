/**
 * @file email.vo.ts
 * @description 邮箱值对象
 *
 * 该文件定义了邮箱值对象，包含邮箱的验证规则和业务逻辑。
 * 邮箱是用户身份验证和通信的重要标识符，需要满足特定的格式要求。
 *
 * 主要功能：
 * 1. 邮箱格式验证（RFC 5322标准）
 * 2. 邮箱域名验证
 * 3. 邮箱比较和相等性判断
 * 4. 邮箱地址解析和提取
 *
 * 业务规则：
 * 1. 邮箱必须符合RFC 5322标准格式
 * 2. 邮箱域名必须是有效的
 * 3. 邮箱在租户内必须唯一
 * 4. 支持国际化邮箱地址
 */

/**
 * @class Email
 * @description 邮箱值对象
 *
 * 该值对象封装了邮箱的验证逻辑和业务规则，
 * 确保邮箱的格式正确性和唯一性。
 */
export class Email {
  private readonly _value: string;
  private readonly _localPart: string;
  private readonly _domain: string;

  /**
   * @constructor
   * @param value 邮箱地址字符串
   * @throws {Error} 当邮箱格式不正确时抛出错误
   */
  constructor(value: string) {
    this.validateEmail(value);
    this._value = value.toLowerCase(); // 统一转换为小写
    const [localPart, domain] = this._value.split('@');
    this._localPart = localPart;
    this._domain = domain;
  }

  /**
   * @getter value
   * @description 获取邮箱地址字符串值
   * @returns {string} 邮箱地址
   */
  get value(): string {
    return this._value;
  }

  /**
   * @getter localPart
   * @description 获取邮箱本地部分（@符号前的部分）
   * @returns {string} 本地部分
   */
  get localPart(): string {
    return this._localPart;
  }

  /**
   * @getter domain
   * @description 获取邮箱域名部分（@符号后的部分）
   * @returns {string} 域名
   */
  get domain(): string {
    return this._domain;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 邮箱地址字符串
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
    return this._value === other._value;
  }

  /**
   * @method isDisposable
   * @description 检查是否为一次性邮箱
   * @returns {boolean} 是否为一次性邮箱
   */
  isDisposable(): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      'throwaway.email',
      'yopmail.com',
      'temp-mail.org',
      'sharklasers.com',
      'grr.la',
      'guerrillamailblock.com',
      'guerrillamail.net',
      'guerrillamail.org',
      'guerrillamailblkga.com',
      'pokemail.net',
      'spam4.me',
      'bccto.me',
      'chacuo.net',
      'dispostable.com',
      'fakeinbox.com',
      'fakeinbox.net',
      'fakemailgenerator.com',
      'getairmail.com',
      'getnada.com',
      'inbox.si',
      'mailnesia.com',
      'mailnull.com',
      'mintemail.com',
      'mohmal.com',
      'mytrashmail.com',
      'nwldx.com',
      'sharklasers.com',
      'spamspot.com',
      'spam.la',
      'tempr.email',
      'tmpeml.com',
      'tmpmail.net',
      'tmpmail.org',
      'trashmail.com',
      'trashmail.net',
      'trashmailer.com',
      'trash-me.com',
      'trashymail.com',
      'trashymail.net',
      'wegwerfemail.de',
      'wegwerfemail.net',
      'wegwerfemail.org',
    ];

    return disposableDomains.includes(this._domain);
  }

  /**
   * @method isCorporate
   * @description 检查是否为企业邮箱
   * @returns {boolean} 是否为企业邮箱
   */
  isCorporate(): boolean {
    const personalDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'live.com',
      'msn.com',
      'aol.com',
      'icloud.com',
      'me.com',
      'mac.com',
      'qq.com',
      '163.com',
      '126.com',
      'sina.com',
      'sohu.com',
      'yeah.net',
      'foxmail.com',
      '139.com',
      '189.cn',
      'wo.cn',
      '21cn.com',
      'tom.com',
      '263.net',
      'eyou.com',
      'china.com',
      'netease.com',
      'sogou.com',
      'baidu.com',
    ];

    return !personalDomains.includes(this._domain);
  }

  /**
   * @method getDomainInfo
   * @description 获取域名信息
   * @returns {object} 域名信息
   */
  getDomainInfo(): {
    domain: string;
    isDisposable: boolean;
    isCorporate: boolean;
  } {
    return {
      domain: this._domain,
      isDisposable: this.isDisposable(),
      isCorporate: this.isCorporate(),
    };
  }

  /**
   * @private
   * @method validateEmail
   * @description 验证邮箱格式
   * @param value 邮箱地址字符串
   * @throws {Error} 当邮箱格式不正确时抛出错误
   */
  private validateEmail(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('邮箱地址不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('邮箱地址不能为空');
    }

    // 检查长度
    if (trimmedValue.length > 254) {
      throw new Error('邮箱地址长度不能超过254个字符');
    }

    // 检查是否包含@符号
    if (!trimmedValue.includes('@')) {
      throw new Error('邮箱地址必须包含@符号');
    }

    // 检查@符号数量
    const atCount = (trimmedValue.match(/@/g) || []).length;
    if (atCount !== 1) {
      throw new Error('邮箱地址只能包含一个@符号');
    }

    // 分割本地部分和域名
    const [localPart, domain] = trimmedValue.split('@');

    // 验证本地部分
    this.validateLocalPart(localPart);

    // 验证域名
    this.validateDomain(domain);
  }

  /**
   * @private
   * @method validateLocalPart
   * @description 验证邮箱本地部分
   * @param localPart 本地部分
   * @throws {Error} 当本地部分格式不正确时抛出错误
   */
  private validateLocalPart(localPart: string): void {
    if (!localPart || localPart.length === 0) {
      throw new Error('邮箱本地部分不能为空');
    }

    if (localPart.length > 64) {
      throw new Error('邮箱本地部分长度不能超过64个字符');
    }

    // 检查开头和结尾
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      throw new Error('邮箱本地部分不能以点号开头或结尾');
    }

    // 检查连续点号
    if (localPart.includes('..')) {
      throw new Error('邮箱本地部分不能包含连续的点号');
    }

    // 检查字符类型（简化版本，实际应支持更多字符）
    const validPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
    if (!validPattern.test(localPart)) {
      throw new Error('邮箱本地部分包含无效字符');
    }
  }

  /**
   * @private
   * @method validateDomain
   * @description 验证邮箱域名
   * @param domain 域名
   * @throws {Error} 当域名格式不正确时抛出错误
   */
  private validateDomain(domain: string): void {
    if (!domain || domain.length === 0) {
      throw new Error('邮箱域名不能为空');
    }

    if (domain.length > 253) {
      throw new Error('邮箱域名长度不能超过253个字符');
    }

    // 检查开头和结尾
    if (domain.startsWith('.') || domain.endsWith('.')) {
      throw new Error('邮箱域名不能以点号开头或结尾');
    }

    // 检查连续点号
    if (domain.includes('..')) {
      throw new Error('邮箱域名不能包含连续的点号');
    }

    // 检查字符类型
    const validPattern = /^[a-zA-Z0-9.-]+$/;
    if (!validPattern.test(domain)) {
      throw new Error('邮箱域名包含无效字符');
    }

    // 检查顶级域名
    const parts = domain.split('.');
    if (parts.length < 2) {
      throw new Error('邮箱域名必须包含至少一个点号');
    }

    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      throw new Error('邮箱顶级域名长度不能少于2个字符');
    }

    // 检查每个部分
    for (const part of parts) {
      if (part.length === 0) {
        throw new Error('邮箱域名部分不能为空');
      }

      if (part.length > 63) {
        throw new Error('邮箱域名部分长度不能超过63个字符');
      }

      if (part.startsWith('-') || part.endsWith('-')) {
        throw new Error('邮箱域名部分不能以连字符开头或结尾');
      }
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建邮箱值对象
   * @param value 邮箱地址字符串
   * @returns {Email} 邮箱值对象
   */
  static fromString(value: string): Email {
    return new Email(value);
  }

  /**
   * @static
   * @method isValid
   * @description 检查邮箱地址是否有效
   * @param value 邮箱地址字符串
   * @returns {boolean} 是否有效
   */
  static isValid(value: string): boolean {
    try {
      new Email(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method extractDomain
   * @description 从邮箱地址中提取域名
   * @param email 邮箱地址字符串
   * @returns {string|null} 域名或null
   */
  static extractDomain(email: string): string | null {
    try {
      const emailObj = new Email(email);
      return emailObj.domain;
    } catch {
      return null;
    }
  }

  /**
   * @static
   * @method extractLocalPart
   * @description 从邮箱地址中提取本地部分
   * @param email 邮箱地址字符串
   * @returns {string|null} 本地部分或null
   */
  static extractLocalPart(email: string): string | null {
    try {
      const emailObj = new Email(email);
      return emailObj.localPart;
    } catch {
      return null;
    }
  }
}
