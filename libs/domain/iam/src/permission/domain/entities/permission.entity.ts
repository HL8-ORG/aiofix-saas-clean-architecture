/**
 * @file permission.entity.ts
 * @description 权限实体
 *
 * 该文件定义了权限实体，包含权限的核心业务逻辑和状态管理。
 * 权限是IAM系统中的重要实体，负责访问控制和权限管理。
 *
 * 主要功能：
 * 1. 权限信息管理（基本信息、描述、设置等）
 * 2. 权限状态管理（激活、暂停、禁用等）
 * 3. 权限资源管理
 * 4. 权限动作管理
 * 5. 权限作用域管理
 *
 * 业务规则：
 * 1. 权限必须归属于某个组织
 * 2. 权限代码在系统内必须唯一
 * 3. 权限可以形成层级关系（父子权限）
 * 4. 权限状态变更需要记录历史
 * 5. 删除权限前必须确保没有角色使用
 */

import { BaseEntity, Uuid } from '@aiofix/domain-shared';
import { PermissionCode } from '../value-objects/permission-code.vo';

/**
 * @enum PermissionStatus
 * @description 权限状态枚举
 */
export enum PermissionStatus {
  ACTIVE = 'active', // 活跃
  SUSPENDED = 'suspended', // 暂停
  DISABLED = 'disabled', // 禁用
}

/**
 * @enum PermissionType
 * @description 权限类型枚举
 */
export enum PermissionType {
  SYSTEM = 'system', // 系统权限
  CUSTOM = 'custom', // 自定义权限
  RESOURCE = 'resource', // 资源权限
  API = 'api', // API权限
  DATA = 'data', // 数据权限
  FUNCTION = 'function', // 功能权限
}

/**
 * @enum PermissionScope
 * @description 权限作用域枚举
 */
export enum PermissionScope {
  GLOBAL = 'global', // 全局
  ORGANIZATION = 'organization', // 组织级
  DEPARTMENT = 'department', // 部门级
  PROJECT = 'project', // 项目级
  USER = 'user', // 用户级
  RESOURCE = 'resource', // 资源级
}

/**
 * @enum PermissionAction
 * @description 权限动作枚举
 */
export enum PermissionAction {
  READ = 'read', // 读取
  WRITE = 'write', // 写入
  DELETE = 'delete', // 删除
  EXECUTE = 'execute', // 执行
  CREATE = 'create', // 创建
  UPDATE = 'update', // 更新
  VIEW = 'view', // 查看
  EDIT = 'edit', // 编辑
  MANAGE = 'manage', // 管理
  CONTROL = 'control', // 控制
  ACCESS = 'access', // 访问
}

/**
 * @interface PermissionResource
 * @description 权限资源
 */
export interface PermissionResource {
  type: string; // 资源类型
  name: string; // 资源名称
  path: string; // 资源路径
  description?: string; // 资源描述
  metadata?: Record<string, any>; // 资源元数据
}

/**
 * @interface PermissionConditions
 * @description 权限条件
 */
export interface PermissionConditions {
  timeRestrictions?: {
    // 时间限制
    startTime?: string; // 开始时间
    endTime?: string; // 结束时间
    daysOfWeek?: number[]; // 星期几
    hoursOfDay?: number[]; // 一天中的小时
  };
  ipRestrictions?: {
    // IP限制
    allowedIPs?: string[]; // 允许的IP
    blockedIPs?: string[]; // 阻止的IP
    ipRanges?: string[]; // IP范围
  };
  deviceRestrictions?: {
    // 设备限制
    allowedDevices?: string[]; // 允许的设备
    blockedDevices?: string[]; // 阻止的设备
    deviceTypes?: string[]; // 设备类型
  };
  locationRestrictions?: {
    // 位置限制
    allowedCountries?: string[]; // 允许的国家
    blockedCountries?: string[]; // 阻止的国家
    allowedRegions?: string[]; // 允许的地区
  };
}

/**
 * @interface PermissionSettings
 * @description 权限设置
 */
export interface PermissionSettings {
  requireApproval: boolean; // 需要审批
  autoExpire: boolean; // 自动过期
  expirationDays: number; // 过期天数
  maxUsage: number; // 最大使用次数
  allowDelegation: boolean; // 允许委派
  notificationSettings: {
    // 通知设置
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  auditSettings: {
    // 审计设置
    logAccess: boolean;
    logChanges: boolean;
    logViolations: boolean;
  };
}

/**
 * @interface PermissionLimits
 * @description 权限限制
 */
export interface PermissionLimits {
  maxRoles: number; // 最大角色数
  maxUsers: number; // 最大用户数
  maxSubPermissions: number; // 最大子权限数
  maxDelegations: number; // 最大委派数
  sessionTimeout: number; // 会话超时时间（分钟）
  concurrentAccess: number; // 并发访问数
}

/**
 * @class Permission
 * @description 权限实体，负责维护权限状态和业务规则
 * @extends BaseEntity
 * @rule 权限代码在同一租户内必须唯一
 * @event PermissionCreatedEvent
 */
export class Permission extends BaseEntity {
  private readonly _code: PermissionCode;
  private _name: string;
  private _description?: string;
  private _status: PermissionStatus;
  private _type: PermissionType;
  private _scope: PermissionScope;
  private _action: PermissionAction;
  private readonly _organizationId: Uuid;
  private _parentId?: Uuid;
  private _children: Uuid[] = [];
  private _roles: Uuid[] = [];
  private _users: Uuid[] = [];
  private _resource: PermissionResource;
  private _conditions: PermissionConditions = {};
  private _settings: PermissionSettings = {
    requireApproval: false,
    autoExpire: false,
    expirationDays: 365,
    maxUsage: -1,
    allowDelegation: false,
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    auditSettings: {
      logAccess: true,
      logChanges: true,
      logViolations: true,
    },
  };
  private _limits: PermissionLimits = {
    maxRoles: 100,
    maxUsers: 1000,
    maxSubPermissions: 10,
    maxDelegations: 5,
    sessionTimeout: 480,
    concurrentAccess: 10,
  };
  private _metadata: Record<string, any> = {};

  /**
   * @constructor
   * @param id 权限ID
   * @param code 权限代码
   * @param name 权限名称
   * @param organizationId 组织ID
   * @param type 权限类型
   * @param scope 权限作用域
   * @param action 权限动作
   * @param resource 权限资源
   * @param parentId 父权限ID
   */
  constructor(
    id: Uuid,
    code: PermissionCode,
    name: string,
    organizationId: Uuid,
    type: PermissionType = PermissionType.CUSTOM,
    scope: PermissionScope = PermissionScope.ORGANIZATION,
    action: PermissionAction = PermissionAction.READ,
    resource: PermissionResource,
    parentId?: Uuid,
  ) {
    super(id);
    this._code = code;
    this._name = name;
    this._organizationId = organizationId;
    this._type = type;
    this._scope = scope;
    this._action = action;
    this._resource = resource;
    this._parentId = parentId;
    this._status = PermissionStatus.ACTIVE;
  }

  /**
   * @getter code
   * @description 获取权限代码
   * @returns {PermissionCode} 权限代码
   */
  get code(): PermissionCode {
    return this._code;
  }

  /**
   * @getter name
   * @description 获取权限名称
   * @returns {string} 权限名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * @getter description
   * @description 获取权限描述
   * @returns {string|undefined} 权限描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * @getter status
   * @description 获取权限状态
   * @returns {PermissionStatus} 权限状态
   */
  get status(): PermissionStatus {
    return this._status;
  }

  /**
   * @getter type
   * @description 获取权限类型
   * @returns {PermissionType} 权限类型
   */
  get type(): PermissionType {
    return this._type;
  }

  /**
   * @getter scope
   * @description 获取权限作用域
   * @returns {PermissionScope} 权限作用域
   */
  get scope(): PermissionScope {
    return this._scope;
  }

  /**
   * @getter action
   * @description 获取权限动作
   * @returns {PermissionAction} 权限动作
   */
  get action(): PermissionAction {
    return this._action;
  }

  /**
   * @getter organizationId
   * @description 获取组织ID
   * @returns {Uuid} 组织ID
   */
  get organizationId(): Uuid {
    return this._organizationId;
  }

  /**
   * @getter parentId
   * @description 获取父权限ID
   * @returns {Uuid|undefined} 父权限ID
   */
  get parentId(): Uuid | undefined {
    return this._parentId;
  }

  /**
   * @getter children
   * @description 获取子权限ID列表
   * @returns {Uuid[]} 子权限ID列表
   */
  get children(): Uuid[] {
    return [...this._children];
  }

  /**
   * @getter roles
   * @description 获取角色ID列表
   * @returns {Uuid[]} 角色ID列表
   */
  get roles(): Uuid[] {
    return [...this._roles];
  }

  /**
   * @getter users
   * @description 获取用户ID列表
   * @returns {Uuid[]} 用户ID列表
   */
  get users(): Uuid[] {
    return [...this._users];
  }

  /**
   * @getter resource
   * @description 获取权限资源
   * @returns {PermissionResource} 权限资源
   */
  get resource(): PermissionResource {
    return { ...this._resource };
  }

  /**
   * @getter conditions
   * @description 获取权限条件
   * @returns {PermissionConditions} 权限条件
   */
  get conditions(): PermissionConditions {
    return JSON.parse(JSON.stringify(this._conditions)) as PermissionConditions;
  }

  /**
   * @getter settings
   * @description 获取权限设置
   * @returns {PermissionSettings} 权限设置
   */
  get settings(): PermissionSettings {
    return { ...this._settings };
  }

  /**
   * @getter limits
   * @description 获取权限限制
   * @returns {PermissionLimits} 权限限制
   */
  get limits(): PermissionLimits {
    return { ...this._limits };
  }

  /**
   * @getter isActive
   * @description 判断权限是否活跃
   * @returns {boolean} 是否活跃
   */
  get isActive(): boolean {
    return this._status === PermissionStatus.ACTIVE;
  }

  /**
   * @getter isSystem
   * @description 判断是否为系统权限
   * @returns {boolean} 是否为系统权限
   */
  get isSystem(): boolean {
    return this._type === PermissionType.SYSTEM;
  }

  /**
   * @getter isRoot
   * @description 判断是否为根权限
   * @returns {boolean} 是否为根权限
   */
  get isRoot(): boolean {
    return !this._parentId;
  }

  /**
   * @getter hasChildren
   * @description 判断是否有子权限
   * @returns {boolean} 是否有子权限
   */
  get hasChildren(): boolean {
    return this._children.length > 0;
  }

  /**
   * @getter roleCount
   * @description 获取角色数量
   * @returns {number} 角色数量
   */
  get roleCount(): number {
    return this._roles.length;
  }

  /**
   * @getter userCount
   * @description 获取用户数量
   * @returns {number} 用户数量
   */
  get userCount(): number {
    return this._users.length;
  }

  /**
   * @method activate
   * @description 激活权限
   */
  activate(): void {
    this._status = PermissionStatus.ACTIVE;
  }

  /**
   * @method suspend
   * @description 暂停权限
   */
  suspend(): void {
    if (this._status === PermissionStatus.ACTIVE) {
      this._status = PermissionStatus.SUSPENDED;
    }
  }

  /**
   * @method disable
   * @description 禁用权限
   */
  disable(): void {
    this._status = PermissionStatus.DISABLED;
  }

  /**
   * @method updateName
   * @description 更新权限名称
   * @param name 新名称
   */
  updateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('权限名称不能为空');
    }
    this._name = name.trim();
  }

  /**
   * @method updateDescription
   * @description 更新权限描述
   * @param description 新描述
   */
  updateDescription(description?: string): void {
    this._description = description?.trim();
  }

  /**
   * @method updateType
   * @description 更新权限类型
   * @param type 新类型
   */
  updateType(type: PermissionType): void {
    this._type = type;
  }

  /**
   * @method updateScope
   * @description 更新权限作用域
   * @param scope 新作用域
   */
  updateScope(scope: PermissionScope): void {
    this._scope = scope;
  }

  /**
   * @method updateAction
   * @description 更新权限动作
   * @param action 新动作
   */
  updateAction(action: PermissionAction): void {
    this._action = action;
  }

  /**
   * @method setParent
   * @description 设置父权限
   * @param parentId 父权限ID
   */
  setParent(parentId?: Uuid): void {
    // 防止循环引用
    if (parentId && parentId.equals(this.id)) {
      throw new Error('权限不能将自己设为父权限');
    }
    this._parentId = parentId;
  }

  /**
   * @method addChild
   * @description 添加子权限
   * @param childId 子权限ID
   */
  addChild(childId: Uuid): void {
    if (!this._children.some(id => id.equals(childId))) {
      this._children.push(childId);
    }
  }

  /**
   * @method removeChild
   * @description 移除子权限
   * @param childId 子权限ID
   */
  removeChild(childId: Uuid): void {
    this._children = this._children.filter(id => !id.equals(childId));
  }

  /**
   * @method addRole
   * @description 添加角色
   * @param roleId 角色ID
   */
  addRole(roleId: Uuid): void {
    if (!this._roles.some(id => id.equals(roleId))) {
      this._roles.push(roleId);
    }
  }

  /**
   * @method removeRole
   * @description 移除角色
   * @param roleId 角色ID
   */
  removeRole(roleId: Uuid): void {
    this._roles = this._roles.filter(id => !id.equals(roleId));
  }

  /**
   * @method hasRole
   * @description 检查是否有指定角色
   * @param roleId 角色ID
   * @returns {boolean} 是否有角色
   */
  hasRole(roleId: Uuid): boolean {
    return this._roles.some(id => id.equals(roleId));
  }

  /**
   * @method addUser
   * @description 添加用户
   * @param userId 用户ID
   */
  addUser(userId: Uuid): void {
    if (!this._users.some(id => id.equals(userId))) {
      this._users.push(userId);
    }
  }

  /**
   * @method removeUser
   * @description 移除用户
   * @param userId 用户ID
   */
  removeUser(userId: Uuid): void {
    this._users = this._users.filter(id => !id.equals(userId));
  }

  /**
   * @method hasUser
   * @description 检查是否有指定用户
   * @param userId 用户ID
   * @returns {boolean} 是否有用户
   */
  hasUser(userId: Uuid): boolean {
    return this._users.some(id => id.equals(userId));
  }

  /**
   * @method updateResource
   * @description 更新权限资源
   * @param resource 权限资源
   */
  updateResource(resource: Partial<PermissionResource>): void {
    this._resource = { ...this._resource, ...resource };
  }

  /**
   * @method updateConditions
   * @description 更新权限条件
   * @param conditions 权限条件
   */
  updateConditions(conditions: Partial<PermissionConditions>): void {
    this._conditions = { ...this._conditions, ...conditions };
  }

  /**
   * @method updateSettings
   * @description 更新权限设置
   * @param settings 权限设置
   */
  updateSettings(settings: Partial<PermissionSettings>): void {
    this._settings = { ...this._settings, ...settings };
  }

  /**
   * @method updateLimits
   * @description 更新权限限制
   * @param limits 权限限制
   */
  updateLimits(limits: Partial<PermissionLimits>): void {
    this._limits = { ...this._limits, ...limits };
  }

  /**
   * @method getSetting
   * @description 获取权限设置
   * @param key 设置键
   * @returns {any} 设置值
   */
  getSetting(key: keyof PermissionSettings): any {
    return this._settings[key];
  }

  /**
   * @method setSetting
   * @description 设置权限设置
   * @param key 设置键
   * @param value 设置值
   */
  setSetting<K extends keyof PermissionSettings>(
    key: K,
    value: PermissionSettings[K],
  ): void {
    this._settings[key] = value;
  }

  /**
   * @method getLimit
   * @description 获取权限限制
   * @param key 限制键
   * @returns {any} 限制值
   */
  getLimit(
    key: keyof PermissionLimits,
  ): PermissionLimits[keyof PermissionLimits] {
    return this._limits[key];
  }

  /**
   * @method setLimit
   * @description 设置权限限制
   * @param key 限制键
   * @param value 限制值
   */
  setLimit<K extends keyof PermissionLimits>(
    key: K,
    value: PermissionLimits[K],
  ): void {
    this._limits[key] = value;
  }

  /**
   * @method getMetadata
   * @description 获取元数据
   * @param key 元数据键
   * @returns {unknown} 元数据值
   */
  getMetadata(key: string): unknown {
    return this._metadata[key];
  }

  /**
   * @method setMetadata
   * @description 设置元数据
   * @param key 元数据键
   * @param value 元数据值
   */
  setMetadata(key: string, value: unknown): void {
    this._metadata[key] = value;
  }

  /**
   * @method canAddRole
   * @description 检查是否可以添加角色
   * @returns {boolean} 是否可以添加角色
   */
  canAddRole(): boolean {
    return this._roles.length < this._limits.maxRoles;
  }

  /**
   * @method canAddUser
   * @description 检查是否可以添加用户
   * @returns {boolean} 是否可以添加用户
   */
  canAddUser(): boolean {
    return this._users.length < this._limits.maxUsers;
  }

  /**
   * @method canAddChild
   * @description 检查是否可以添加子权限
   * @returns {boolean} 是否可以添加子权限
   */
  canAddChild(): boolean {
    return this._children.length < this._limits.maxSubPermissions;
  }

  /**
   * @static
   * @method create
   * @description 创建权限
   * @param code 权限代码
   * @param name 权限名称
   * @param organizationId 组织ID
   * @param type 权限类型
   * @param scope 权限作用域
   * @param action 权限动作
   * @param resource 权限资源
   * @param parentId 父权限ID
   * @returns {Permission} 权限实体
   */
  static create(
    code: PermissionCode,
    name: string,
    organizationId: Uuid,
    type: PermissionType = PermissionType.CUSTOM,
    scope: PermissionScope = PermissionScope.ORGANIZATION,
    action: PermissionAction = PermissionAction.READ,
    resource: PermissionResource,
    parentId?: Uuid,
  ): Permission {
    const id = Uuid.generate();
    return new Permission(
      id,
      code,
      name,
      organizationId,
      type,
      scope,
      action,
      resource,
      parentId,
    );
  }
}
