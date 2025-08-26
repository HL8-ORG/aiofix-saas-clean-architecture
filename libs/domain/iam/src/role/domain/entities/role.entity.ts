/**
 * @file role.entity.ts
 * @description 角色实体
 *
 * 该文件定义了角色实体，包含角色的核心业务逻辑和状态管理。
 * 角色是IAM系统中的重要实体，负责权限分配和访问控制。
 *
 * 主要功能：
 * 1. 角色信息管理（基本信息、描述、设置等）
 * 2. 角色状态管理（激活、暂停、禁用等）
 * 3. 角色权限管理
 * 4. 角色成员管理
 * 5. 角色继承关系管理
 *
 * 业务规则：
 * 1. 角色必须归属于某个组织
 * 2. 角色代码在组织内必须唯一
 * 3. 角色可以形成继承关系（父子角色）
 * 4. 角色状态变更需要记录历史
 * 5. 删除角色前必须确保没有用户使用
 */

import { BaseEntity, Uuid } from '@aiofix/domain-shared';
import { RoleCode } from '../value-objects/role-code.vo';

/**
 * @enum RoleStatus
 * @description 角色状态枚举
 */
export enum RoleStatus {
  ACTIVE = 'active', // 活跃
  SUSPENDED = 'suspended', // 暂停
  DISABLED = 'disabled', // 禁用
}

/**
 * @enum RoleType
 * @description 角色类型枚举
 */
export enum RoleType {
  SYSTEM = 'system', // 系统角色
  CUSTOM = 'custom', // 自定义角色
  FUNCTIONAL = 'functional', // 功能角色
  BUSINESS = 'business', // 业务角色
  PROJECT = 'project', // 项目角色
  TEMPORARY = 'temporary', // 临时角色
}

/**
 * @enum RoleScope
 * @description 角色作用域枚举
 */
export enum RoleScope {
  GLOBAL = 'global', // 全局
  ORGANIZATION = 'organization', // 组织级
  DEPARTMENT = 'department', // 部门级
  PROJECT = 'project', // 项目级
  USER = 'user', // 用户级
}

/**
 * @interface RolePermissions
 * @description 角色权限
 */
export interface RolePermissions {
  resourcePermissions: {
    // 资源权限
    [resource: string]: {
      read: boolean;
      write: boolean;
      delete: boolean;
      execute: boolean;
    };
  };
  apiPermissions: {
    // API权限
    [endpoint: string]: {
      get: boolean;
      post: boolean;
      put: boolean;
      delete: boolean;
      patch: boolean;
    };
  };
  dataPermissions: {
    // 数据权限
    [dataType: string]: {
      view: boolean;
      edit: boolean;
      delete: boolean;
      export: boolean;
      import: boolean;
    };
  };
}

/**
 * @interface RoleSettings
 * @description 角色设置
 */
export interface RoleSettings {
  allowDelegation: boolean; // 允许委派
  requireApproval: boolean; // 需要审批
  autoExpire: boolean; // 自动过期
  expirationDays: number; // 过期天数
  maxDelegations: number; // 最大委派数
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
    logDelegations: boolean;
  };
}

/**
 * @interface RoleLimits
 * @description 角色限制
 */
export interface RoleLimits {
  maxMembers: number; // 最大成员数
  maxSubRoles: number; // 最大子角色数
  maxPermissions: number; // 最大权限数
  maxDelegations: number; // 最大委派数
  sessionTimeout: number; // 会话超时时间（分钟）
  concurrentSessions: number; // 并发会话数
}

/**
 * @class Role
 * @description 角色实体，负责维护角色状态和业务规则
 * @extends BaseEntity
 * @rule 角色名称在同一租户内必须唯一
 * @event RoleCreatedEvent
 */
export class Role extends BaseEntity {
  private readonly _code: RoleCode;
  private _name: string;
  private _description?: string;
  private _status: RoleStatus;
  private _type: RoleType;
  private _scope: RoleScope;
  private readonly _organizationId: Uuid;
  private _parentId?: Uuid;
  private _children: Uuid[] = [];
  private _members: Uuid[] = [];
  private _permissions: RolePermissions = {
    resourcePermissions: {},
    apiPermissions: {},
    dataPermissions: {},
  };
  private _settings: RoleSettings = {
    allowDelegation: false,
    requireApproval: false,
    autoExpire: false,
    expirationDays: 365,
    maxDelegations: 5,
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    auditSettings: {
      logAccess: true,
      logChanges: true,
      logDelegations: true,
    },
  };
  private _limits: RoleLimits = {
    maxMembers: 1000,
    maxSubRoles: 10,
    maxPermissions: 100,
    maxDelegations: 5,
    sessionTimeout: 480,
    concurrentSessions: 3,
  };
  private _metadata: Record<string, any> = {};

  /**
   * @constructor
   * @param id 角色ID
   * @param code 角色代码
   * @param name 角色名称
   * @param organizationId 组织ID
   * @param type 角色类型
   * @param scope 角色作用域
   * @param parentId 父角色ID
   */
  constructor(
    id: Uuid,
    code: RoleCode,
    name: string,
    organizationId: Uuid,
    type: RoleType = RoleType.CUSTOM,
    scope: RoleScope = RoleScope.ORGANIZATION,
    parentId?: Uuid,
  ) {
    super(id);
    this._code = code;
    this._name = name;
    this._organizationId = organizationId;
    this._type = type;
    this._scope = scope;
    this._parentId = parentId;
    this._status = RoleStatus.ACTIVE;
  }

  /**
   * @getter code
   * @description 获取角色代码
   * @returns {RoleCode} 角色代码
   */
  get code(): RoleCode {
    return this._code;
  }

  /**
   * @getter name
   * @description 获取角色名称
   * @returns {string} 角色名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * @getter description
   * @description 获取角色描述
   * @returns {string|undefined} 角色描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * @getter status
   * @description 获取角色状态
   * @returns {RoleStatus} 角色状态
   */
  get status(): RoleStatus {
    return this._status;
  }

  /**
   * @getter type
   * @description 获取角色类型
   * @returns {RoleType} 角色类型
   */
  get type(): RoleType {
    return this._type;
  }

  /**
   * @getter scope
   * @description 获取角色作用域
   * @returns {RoleScope} 角色作用域
   */
  get scope(): RoleScope {
    return this._scope;
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
   * @description 获取父角色ID
   * @returns {Uuid|undefined} 父角色ID
   */
  get parentId(): Uuid | undefined {
    return this._parentId;
  }

  /**
   * @getter children
   * @description 获取子角色ID列表
   * @returns {Uuid[]} 子角色ID列表
   */
  get children(): Uuid[] {
    return [...this._children];
  }

  /**
   * @getter members
   * @description 获取角色成员ID列表
   * @returns {Uuid[]} 角色成员ID列表
   */
  get members(): Uuid[] {
    return [...this._members];
  }

  /**
   * @getter permissions
   * @description 获取角色权限
   * @returns {RolePermissions} 角色权限
   */
  get permissions(): RolePermissions {
    return JSON.parse(JSON.stringify(this._permissions)) as RolePermissions;
  }

  /**
   * @getter settings
   * @description 获取角色设置
   * @returns {RoleSettings} 角色设置
   */
  get settings(): RoleSettings {
    return { ...this._settings };
  }

  /**
   * @getter limits
   * @description 获取角色限制
   * @returns {RoleLimits} 角色限制
   */
  get limits(): RoleLimits {
    return { ...this._limits };
  }

  /**
   * @getter isActive
   * @description 判断角色是否活跃
   * @returns {boolean} 是否活跃
   */
  get isActive(): boolean {
    return this._status === RoleStatus.ACTIVE;
  }

  /**
   * @getter isSystem
   * @description 判断是否为系统角色
   * @returns {boolean} 是否为系统角色
   */
  get isSystem(): boolean {
    return this._type === RoleType.SYSTEM;
  }

  /**
   * @getter isRoot
   * @description 判断是否为根角色
   * @returns {boolean} 是否为根角色
   */
  get isRoot(): boolean {
    return !this._parentId;
  }

  /**
   * @getter hasChildren
   * @description 判断是否有子角色
   * @returns {boolean} 是否有子角色
   */
  get hasChildren(): boolean {
    return this._children.length > 0;
  }

  /**
   * @getter memberCount
   * @description 获取成员数量
   * @returns {number} 成员数量
   */
  get memberCount(): number {
    return this._members.length;
  }

  /**
   * @method activate
   * @description 激活角色
   */
  activate(): void {
    this._status = RoleStatus.ACTIVE;
  }

  /**
   * @method suspend
   * @description 暂停角色
   */
  suspend(): void {
    if (this._status === RoleStatus.ACTIVE) {
      this._status = RoleStatus.SUSPENDED;
    }
  }

  /**
   * @method disable
   * @description 禁用角色
   */
  disable(): void {
    this._status = RoleStatus.DISABLED;
  }

  /**
   * @method updateName
   * @description 更新角色名称
   * @param name 新名称
   */
  updateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('角色名称不能为空');
    }
    this._name = name.trim();
  }

  /**
   * @method updateDescription
   * @description 更新角色描述
   * @param description 新描述
   */
  updateDescription(description?: string): void {
    this._description = description?.trim();
  }

  /**
   * @method updateType
   * @description 更新角色类型
   * @param type 新类型
   */
  updateType(type: RoleType): void {
    this._type = type;
  }

  /**
   * @method updateScope
   * @description 更新角色作用域
   * @param scope 新作用域
   */
  updateScope(scope: RoleScope): void {
    this._scope = scope;
  }

  /**
   * @method setParent
   * @description 设置父角色
   * @param parentId 父角色ID
   */
  setParent(parentId?: Uuid): void {
    // 防止循环引用
    if (parentId && parentId.equals(this.id)) {
      throw new Error('角色不能将自己设为父角色');
    }
    this._parentId = parentId;
  }

  /**
   * @method addChild
   * @description 添加子角色
   * @param childId 子角色ID
   */
  addChild(childId: Uuid): void {
    if (!this._children.some(id => id.equals(childId))) {
      this._children.push(childId);
    }
  }

  /**
   * @method removeChild
   * @description 移除子角色
   * @param childId 子角色ID
   */
  removeChild(childId: Uuid): void {
    this._children = this._children.filter(id => !id.equals(childId));
  }

  /**
   * @method addMember
   * @description 添加角色成员
   * @param memberId 成员ID
   */
  addMember(memberId: Uuid): void {
    if (!this._members.some(id => id.equals(memberId))) {
      this._members.push(memberId);
    }
  }

  /**
   * @method removeMember
   * @description 移除角色成员
   * @param memberId 成员ID
   */
  removeMember(memberId: Uuid): void {
    this._members = this._members.filter(id => !id.equals(memberId));
  }

  /**
   * @method hasMember
   * @description 检查是否有指定成员
   * @param memberId 成员ID
   * @returns {boolean} 是否有成员
   */
  hasMember(memberId: Uuid): boolean {
    return this._members.some(id => id.equals(memberId));
  }

  /**
   * @method addPermission
   * @description 添加权限
   * @param resource 资源
   * @param permissions 权限
   */
  addPermission(
    resource: string,
    permissions: {
      read?: boolean;
      write?: boolean;
      delete?: boolean;
      execute?: boolean;
    },
  ): void {
    this._permissions.resourcePermissions[resource] = {
      read: permissions.read ?? false,
      write: permissions.write ?? false,
      delete: permissions.delete ?? false,
      execute: permissions.execute ?? false,
    };
  }

  /**
   * @method removePermission
   * @description 移除权限
   * @param resource 资源
   */
  removePermission(resource: string): void {
    delete this._permissions.resourcePermissions[resource];
  }

  /**
   * @method hasPermission
   * @description 检查是否有指定权限
   * @param resource 资源
   * @param permission 权限类型
   * @returns {boolean} 是否有权限
   */
  hasPermission(
    resource: string,
    permission: 'read' | 'write' | 'delete' | 'execute',
  ): boolean {
    const resourcePerms = this._permissions.resourcePermissions[resource];
    return resourcePerms ? resourcePerms[permission] : false;
  }

  /**
   * @method updateSettings
   * @description 更新角色设置
   * @param settings 角色设置
   */
  updateSettings(settings: Partial<RoleSettings>): void {
    this._settings = { ...this._settings, ...settings };
  }

  /**
   * @method updateLimits
   * @description 更新角色限制
   * @param limits 角色限制
   */
  updateLimits(limits: Partial<RoleLimits>): void {
    this._limits = { ...this._limits, ...limits };
  }

  /**
   * @method getSetting
   * @description 获取角色设置
   * @param key 设置键
   * @returns {any} 设置值
   */
  getSetting<K extends keyof RoleSettings>(key: K): RoleSettings[K] {
    return this._settings[key];
  }

  /**
   * @method setSetting
   * @description 设置角色设置
   * @param key 设置键
   * @param value 设置值
   */
  setSetting<K extends keyof RoleSettings>(
    key: K,
    value: RoleSettings[K],
  ): void {
    this._settings[key] = value;
  }

  /**
   * @method getLimit
   * @description 获取角色限制
   * @param key 限制键
   * @returns {any} 限制值
   */
  getLimit<K extends keyof RoleLimits>(key: K): RoleLimits[K] {
    return this._limits[key];
  }

  /**
   * @method setLimit
   * @description 设置角色限制
   * @param key 限制键
   * @param value 限制值
   */
  setLimit<K extends keyof RoleLimits>(key: K, value: RoleLimits[K]): void {
    this._limits[key] = value;
  }

  /**
   * @method getMetadata
   * @description 获取元数据
   * @param key 元数据键
   * @returns {any} 元数据值
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
   * @method canAddMember
   * @description 检查是否可以添加成员
   * @returns {boolean} 是否可以添加成员
   */
  canAddMember(): boolean {
    return this._members.length < this._limits.maxMembers;
  }

  /**
   * @method canAddChild
   * @description 检查是否可以添加子角色
   * @returns {boolean} 是否可以添加子角色
   */
  canAddChild(): boolean {
    return this._children.length < this._limits.maxSubRoles;
  }

  /**
   * @method canAddPermission
   * @description 检查是否可以添加权限
   * @returns {boolean} 是否可以添加权限
   */
  canAddPermission(): boolean {
    const currentPermissions =
      Object.keys(this._permissions.resourcePermissions).length +
      Object.keys(this._permissions.apiPermissions).length +
      Object.keys(this._permissions.dataPermissions).length;
    return currentPermissions < this._limits.maxPermissions;
  }

  /**
   * @static
   * @method create
   * @description 创建角色
   * @param code 角色代码
   * @param name 角色名称
   * @param organizationId 组织ID
   * @param type 角色类型
   * @param scope 角色作用域
   * @param parentId 父角色ID
   * @returns {Role} 角色实体
   */
  static create(
    code: RoleCode,
    name: string,
    organizationId: Uuid,
    type: RoleType = RoleType.CUSTOM,
    scope: RoleScope = RoleScope.ORGANIZATION,
    parentId?: Uuid,
  ): Role {
    const id = Uuid.generate();
    return new Role(id, code, name, organizationId, type, scope, parentId);
  }
}
