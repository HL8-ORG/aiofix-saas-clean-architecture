/**
 * @file permission-code.vo.ts
 * @description 权限代码值对象
 *
 * 该文件定义了权限代码值对象，包含权限代码的验证规则和业务逻辑。
 * 权限代码是权限在系统中的唯一标识符，需要满足特定的格式要求。
 *
 * 主要功能：
 * 1. 权限代码格式验证（长度、字符类型、唯一性等）
 * 2. 权限代码生成和转换
 * 3. 权限代码比较和相等性判断
 *
 * 业务规则：
 * 1. 权限代码长度必须在3-50个字符之间
 * 2. 只能包含字母、数字、连字符、下划线和冒号
 * 3. 不能以连字符、下划线或冒号开头或结尾
 * 4. 不能包含连续的两个连字符、下划线或冒号
 * 5. 不能是纯数字
 * 6. 权限代码在系统内必须唯一
 */

/**
 * @class PermissionCode
 * @description 权限代码值对象
 *
 * 该值对象封装了权限代码的验证逻辑和业务规则，
 * 确保权限代码的格式正确性和唯一性。
 */
export class PermissionCode {
  private readonly _value: string;

  /**
   * @constructor
   * @param value 权限代码字符串
   * @throws {Error} 当权限代码格式不正确时抛出错误
   */
  constructor(value: string) {
    this.validatePermissionCode(value);
    this._value = value; // 保持原始大小写
  }

  /**
   * @getter value
   * @description 获取权限代码字符串值
   * @returns {string} 权限代码
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 权限代码字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个权限代码是否相等
   * @param other 另一个权限代码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: PermissionCode | null | undefined): boolean {
    if (!other) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * @method getResource
   * @description 获取权限资源
   * @returns {string} 权限资源
   */
  getResource(): string {
    const parts = this._value.split(':');
    return parts[0] || '';
  }

  /**
   * @method getAction
   * @description 获取权限动作
   * @returns {string} 权限动作
   */
  getAction(): string {
    const parts = this._value.split(':');
    return parts[1] || '';
  }

  /**
   * @method getScope
   * @description 获取权限作用域
   * @returns {string} 权限作用域
   */
  getScope(): string {
    const parts = this._value.split(':');
    return parts[2] || '';
  }

  /**
   * @private
   * @method validatePermissionCode
   * @description 验证权限代码格式
   * @param value 权限代码字符串
   * @throws {Error} 当权限代码格式不正确时抛出错误
   */
  private validatePermissionCode(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('权限代码不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('权限代码不能为空');
    }

    // 检查长度
    if (trimmedValue.length < 3) {
      throw new Error('权限代码长度不能少于3个字符');
    }

    if (trimmedValue.length > 50) {
      throw new Error('权限代码长度不能超过50个字符');
    }

    // 检查字符类型
    const validPattern = /^[a-zA-Z0-9_:]+$/;
    if (!validPattern.test(trimmedValue)) {
      throw new Error('权限代码只能包含字母、数字、连字符、下划线和冒号');
    }

    // 检查是否以连字符、下划线或冒号开头或结尾
    if (
      trimmedValue.startsWith('-') ||
      trimmedValue.startsWith('_') ||
      trimmedValue.startsWith(':') ||
      trimmedValue.endsWith('-') ||
      trimmedValue.endsWith('_') ||
      trimmedValue.endsWith(':')
    ) {
      throw new Error('权限代码不能以连字符、下划线或冒号开头或结尾');
    }

    // 检查是否包含连续的两个连字符、下划线或冒号
    if (
      trimmedValue.includes('--') ||
      trimmedValue.includes('__') ||
      trimmedValue.includes('::') ||
      trimmedValue.includes('-_') ||
      trimmedValue.includes('_-') ||
      trimmedValue.includes(':-') ||
      trimmedValue.includes('-:') ||
      trimmedValue.includes('_:') ||
      trimmedValue.includes(':_')
    ) {
      throw new Error('权限代码不能包含连续的连字符、下划线或冒号');
    }

    // 检查是否为纯数字
    if (/^\d+$/.test(trimmedValue)) {
      throw new Error('权限代码不能是纯数字');
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
      'permission',
      'access',
      'control',
      'auth',
      'security',
      'user',
      'role',
      'group',
      'team',
      'member',
      'owner',
      'super',
      'master',
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
      throw new Error('权限代码不能使用系统保留字');
    }

    // 检查格式：resource:action:scope
    const parts = trimmedValue.split(':');
    if (parts.length > 3) {
      throw new Error('权限代码格式应为 resource:action:scope');
    }

    // 检查每个部分不能为空
    for (const part of parts) {
      if (part.length === 0) {
        throw new Error('权限代码的每个部分不能为空');
      }
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建权限代码值对象
   * @param value 权限代码字符串
   * @returns {PermissionCode} 权限代码值对象
   */
  static fromString(value: string): PermissionCode {
    return new PermissionCode(value);
  }

  /**
   * @static
   * @method generateFromResource
   * @description 从资源生成权限代码
   * @param resource 资源名称
   * @param action 动作
   * @param scope 作用域
   * @returns {PermissionCode} 权限代码值对象
   */
  static generateFromResource(
    resource: string,
    action: string,
    scope: string = 'default',
  ): PermissionCode {
    if (!resource || typeof resource !== 'string') {
      throw new Error('资源名称不能为空');
    }

    if (!action || typeof action !== 'string') {
      throw new Error('动作不能为空');
    }

    // 清理资源名称
    let cleanResource = resource.replace(/[^a-zA-Z0-9_-]/g, '');
    cleanResource = cleanResource.replace(/[-_]+/g, '-');
    cleanResource = cleanResource.replace(/^-|-$/g, '');

    // 清理动作
    let cleanAction = action.replace(/[^a-zA-Z0-9_-]/g, '');
    cleanAction = cleanAction.replace(/[-_]+/g, '-');
    cleanAction = cleanAction.replace(/^-|-$/g, '');

    // 清理作用域
    let cleanScope = scope.replace(/[^a-zA-Z0-9_-]/g, '');
    cleanScope = cleanScope.replace(/[-_]+/g, '-');
    cleanScope = cleanScope.replace(/^-|-$/g, '');

    // 确保每个部分不为空
    if (cleanResource.length === 0) {
      cleanResource = 'resource';
    }
    if (cleanAction.length === 0) {
      cleanAction = 'action';
    }
    if (cleanScope.length === 0) {
      cleanScope = 'default';
    }

    const code = `${cleanResource}:${cleanAction}:${cleanScope}`;
    return new PermissionCode(code);
  }

  /**
   * @static
   * @method generate
   * @description 生成随机权限代码
   * @param resource 资源名称
   * @param action 动作
   * @param scope 作用域
   * @returns {PermissionCode} 权限代码值对象
   */
  static generate(
    resource: string = 'resource',
    action: string = 'action',
    scope: string = 'default',
  ): PermissionCode {
    // 生成随机后缀
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    for (let i = 0; i < 4; i++) {
      randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const code = `${resource}-${randomSuffix}:${action}-${randomSuffix}:${scope}-${randomSuffix}`;
    return new PermissionCode(code);
  }

  /**
   * @static
   * @method createReadPermission
   * @description 创建读取权限
   * @param resource 资源名称
   * @param scope 作用域
   * @returns {PermissionCode} 权限代码值对象
   */
  static createReadPermission(
    resource: string,
    scope: string = 'default',
  ): PermissionCode {
    return PermissionCode.generateFromResource(resource, 'read', scope);
  }

  /**
   * @static
   * @method createWritePermission
   * @description 创建写入权限
   * @param resource 资源名称
   * @param scope 作用域
   * @returns {PermissionCode} 权限代码值对象
   */
  static createWritePermission(
    resource: string,
    scope: string = 'default',
  ): PermissionCode {
    return PermissionCode.generateFromResource(resource, 'write', scope);
  }

  /**
   * @static
   * @method createDeletePermission
   * @description 创建删除权限
   * @param resource 资源名称
   * @param scope 作用域
   * @returns {PermissionCode} 权限代码值对象
   */
  static createDeletePermission(
    resource: string,
    scope: string = 'default',
  ): PermissionCode {
    return PermissionCode.generateFromResource(resource, 'delete', scope);
  }

  /**
   * @static
   * @method createExecutePermission
   * @description 创建执行权限
   * @param resource 资源名称
   * @param scope 作用域
   * @returns {PermissionCode} 权限代码值对象
   */
  static createExecutePermission(
    resource: string,
    scope: string = 'default',
  ): PermissionCode {
    return PermissionCode.generateFromResource(resource, 'execute', scope);
  }
}
