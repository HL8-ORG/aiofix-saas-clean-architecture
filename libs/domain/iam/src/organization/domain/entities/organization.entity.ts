/**
 * @file organization.entity.ts
 * @description 组织实体
 *
 * 该文件定义了组织实体，包含组织的核心业务逻辑和状态管理。
 * 组织是IAM系统中的重要实体，负责组织架构管理和数据隔离。
 *
 * 主要功能：
 * 1. 组织信息管理（基本信息、联系方式、设置等）
 * 2. 组织状态管理（激活、暂停、禁用等）
 * 3. 组织层级关系管理（父子组织）
 * 4. 组织成员管理
 * 5. 组织权限和设置管理
 *
 * 业务规则：
 * 1. 组织必须归属于某个租户
 * 2. 组织代码在租户内必须唯一
 * 3. 组织可以形成层级关系（父子组织）
 * 4. 组织状态变更需要记录历史
 * 5. 删除组织前必须确保没有子组织和成员
 */

import { BaseEntity, Uuid } from '@aiofix/domain-shared';
import { OrganizationCode } from '../value-objects/organization-code.vo';

/**
 * @enum OrganizationStatus
 * @description 组织状态枚举
 */
export enum OrganizationStatus {
  ACTIVE = 'active', // 活跃
  SUSPENDED = 'suspended', // 暂停
  DISABLED = 'disabled', // 禁用
}

/**
 * @enum OrganizationType
 * @description 组织类型枚举
 */
export enum OrganizationType {
  COMPANY = 'company', // 公司
  DEPARTMENT = 'department', // 部门
  DIVISION = 'division', // 事业部
  BRANCH = 'branch', // 分支机构
  TEAM = 'team', // 团队
  PROJECT = 'project', // 项目组
  FUNCTIONAL = 'functional', // 职能部门
  BUSINESS_UNIT = 'business_unit', // 业务单元
}

/**
 * @interface OrganizationContact
 * @description 组织联系信息
 */
export interface OrganizationContact {
  email?: string; // 邮箱
  phone?: string; // 电话
  address?: string; // 地址
  website?: string; // 网站
  contactPerson?: string; // 联系人
  contactPhone?: string; // 联系电话
}

/**
 * @interface OrganizationSettings
 * @description 组织设置
 */
export interface OrganizationSettings {
  allowUserRegistration: boolean; // 允许用户注册
  requireApproval: boolean; // 需要审批
  autoAssignRoles: boolean; // 自动分配角色
  dataIsolationLevel: string; // 数据隔离级别
  notificationSettings: {
    // 通知设置
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  securitySettings: {
    // 安全设置
    requireTwoFactor: boolean;
    passwordPolicy: string;
    sessionTimeout: number;
  };
}

/**
 * @interface OrganizationLimits
 * @description 组织限制
 */
export interface OrganizationLimits {
  maxUsers: number; // 最大用户数
  maxDepartments: number; // 最大部门数
  maxRoles: number; // 最大角色数
  maxProjects: number; // 最大项目数
  storageLimit: number; // 存储限制（GB）
  apiRateLimit: number; // API速率限制
}

/**
 * @class Organization
 * @description 组织实体，负责维护组织状态和业务规则
 * @extends BaseEntity
 * @rule 组织名称在同一租户内必须唯一
 * @event OrganizationCreatedEvent
 */
export class Organization extends BaseEntity {
  private readonly _code: OrganizationCode;
  private _name: string;
  private _description?: string;
  private _status: OrganizationStatus;
  private _type: OrganizationType;
  private readonly _tenantId: Uuid;
  private _parentId?: Uuid;
  private _children: Uuid[] = [];
  private _managerId?: Uuid;
  private _members: Uuid[] = [];
  private _contact: OrganizationContact = {};
  private _settings: OrganizationSettings = {
    allowUserRegistration: true,
    requireApproval: false,
    autoAssignRoles: false,
    dataIsolationLevel: 'organization',
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    securitySettings: {
      requireTwoFactor: false,
      passwordPolicy: 'default',
      sessionTimeout: 3600,
    },
  };
  private _limits: OrganizationLimits = {
    maxUsers: 1000,
    maxDepartments: 100,
    maxRoles: 50,
    maxProjects: 100,
    storageLimit: 100,
    apiRateLimit: 1000,
  };
  private _metadata: Record<string, any> = {};

  /**
   * @constructor
   * @param id 组织ID
   * @param code 组织代码
   * @param name 组织名称
   * @param tenantId 租户ID
   * @param type 组织类型
   * @param parentId 父组织ID
   */
  constructor(
    id: Uuid,
    code: OrganizationCode,
    name: string,
    tenantId: Uuid,
    type: OrganizationType = OrganizationType.DEPARTMENT,
    parentId?: Uuid,
  ) {
    super(id);
    this._code = code;
    this._name = name;
    this._tenantId = tenantId;
    this._type = type;
    this._parentId = parentId;
    this._status = OrganizationStatus.ACTIVE;
  }

  /**
   * @getter code
   * @description 获取组织代码
   * @returns {OrganizationCode} 组织代码
   */
  get code(): OrganizationCode {
    return this._code;
  }

  /**
   * @getter name
   * @description 获取组织名称
   * @returns {string} 组织名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * @getter description
   * @description 获取组织描述
   * @returns {string|undefined} 组织描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * @getter status
   * @description 获取组织状态
   * @returns {OrganizationStatus} 组织状态
   */
  get status(): OrganizationStatus {
    return this._status;
  }

  /**
   * @getter type
   * @description 获取组织类型
   * @returns {OrganizationType} 组织类型
   */
  get type(): OrganizationType {
    return this._type;
  }

  /**
   * @getter tenantId
   * @description 获取租户ID
   * @returns {Uuid} 租户ID
   */
  get tenantId(): Uuid {
    return this._tenantId;
  }

  /**
   * @getter parentId
   * @description 获取父组织ID
   * @returns {Uuid|undefined} 父组织ID
   */
  get parentId(): Uuid | undefined {
    return this._parentId;
  }

  /**
   * @getter children
   * @description 获取子组织ID列表
   * @returns {Uuid[]} 子组织ID列表
   */
  get children(): Uuid[] {
    return [...this._children];
  }

  /**
   * @getter managerId
   * @description 获取组织管理者ID
   * @returns {Uuid|undefined} 组织管理者ID
   */
  get managerId(): Uuid | undefined {
    return this._managerId;
  }

  /**
   * @getter members
   * @description 获取组织成员ID列表
   * @returns {Uuid[]} 组织成员ID列表
   */
  get members(): Uuid[] {
    return [...this._members];
  }

  /**
   * @getter contact
   * @description 获取组织联系信息
   * @returns {OrganizationContact} 组织联系信息
   */
  get contact(): OrganizationContact {
    return { ...this._contact };
  }

  /**
   * @getter settings
   * @description 获取组织设置
   * @returns {OrganizationSettings} 组织设置
   */
  get settings(): OrganizationSettings {
    return { ...this._settings };
  }

  /**
   * @getter limits
   * @description 获取组织限制
   * @returns {OrganizationLimits} 组织限制
   */
  get limits(): OrganizationLimits {
    return { ...this._limits };
  }

  /**
   * @getter isActive
   * @description 判断组织是否活跃
   * @returns {boolean} 是否活跃
   */
  get isActive(): boolean {
    return this._status === OrganizationStatus.ACTIVE;
  }

  /**
   * @getter isRoot
   * @description 判断是否为根组织
   * @returns {boolean} 是否为根组织
   */
  get isRoot(): boolean {
    return !this._parentId;
  }

  /**
   * @getter hasChildren
   * @description 判断是否有子组织
   * @returns {boolean} 是否有子组织
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
   * @description 激活组织
   */
  activate(): void {
    this._status = OrganizationStatus.ACTIVE;
  }

  /**
   * @method suspend
   * @description 暂停组织
   */
  suspend(): void {
    if (this._status === OrganizationStatus.ACTIVE) {
      this._status = OrganizationStatus.SUSPENDED;
    }
  }

  /**
   * @method disable
   * @description 禁用组织
   */
  disable(): void {
    this._status = OrganizationStatus.DISABLED;
  }

  /**
   * @method updateName
   * @description 更新组织名称
   * @param name 新名称
   */
  updateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('组织名称不能为空');
    }
    this._name = name.trim();
  }

  /**
   * @method updateDescription
   * @description 更新组织描述
   * @param description 新描述
   */
  updateDescription(description?: string): void {
    this._description = description?.trim();
  }

  /**
   * @method updateType
   * @description 更新组织类型
   * @param type 新类型
   */
  updateType(type: OrganizationType): void {
    this._type = type;
  }

  /**
   * @method setParent
   * @description 设置父组织
   * @param parentId 父组织ID
   */
  setParent(parentId?: Uuid): void {
    // 防止循环引用
    if (parentId && parentId.equals(this.id)) {
      throw new Error('组织不能将自己设为父组织');
    }
    this._parentId = parentId;
  }

  /**
   * @method addChild
   * @description 添加子组织
   * @param childId 子组织ID
   */
  addChild(childId: Uuid): void {
    if (!this._children.some(id => id.equals(childId))) {
      this._children.push(childId);
    }
  }

  /**
   * @method removeChild
   * @description 移除子组织
   * @param childId 子组织ID
   */
  removeChild(childId: Uuid): void {
    this._children = this._children.filter(id => !id.equals(childId));
  }

  /**
   * @method setManager
   * @description 设置组织管理者
   * @param managerId 管理者ID
   */
  setManager(managerId?: Uuid): void {
    this._managerId = managerId;
  }

  /**
   * @method addMember
   * @description 添加组织成员
   * @param memberId 成员ID
   */
  addMember(memberId: Uuid): void {
    if (!this._members.some(id => id.equals(memberId))) {
      this._members.push(memberId);
    }
  }

  /**
   * @method removeMember
   * @description 移除组织成员
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
   * @method updateContact
   * @description 更新组织联系信息
   * @param contact 联系信息
   */
  updateContact(contact: Partial<OrganizationContact>): void {
    this._contact = { ...this._contact, ...contact };
  }

  /**
   * @method updateSettings
   * @description 更新组织设置
   * @param settings 组织设置
   */
  updateSettings(settings: Partial<OrganizationSettings>): void {
    this._settings = { ...this._settings, ...settings };
  }

  /**
   * @method updateLimits
   * @description 更新组织限制
   * @param limits 组织限制
   */
  updateLimits(limits: Partial<OrganizationLimits>): void {
    this._limits = { ...this._limits, ...limits };
  }

  /**
   * @method getSetting
   * @description 获取组织设置
   * @param key 设置键
   * @returns {OrganizationSettings[K]} 设置值
   */
  getSetting<K extends keyof OrganizationSettings>(
    key: K,
  ): OrganizationSettings[K] {
    return this._settings[key];
  }

  /**
   * @method setSetting
   * @description 设置组织设置
   * @param key 设置键
   * @param value 设置值
   */
  setSetting<K extends keyof OrganizationSettings>(
    key: K,
    value: OrganizationSettings[K],
  ): void {
    this._settings[key] = value;
  }

  /**
   * @method getLimit
   * @description 获取组织限制
   * @param key 限制键
   * @returns {OrganizationLimits[K]} 限制值
   */
  getLimit<K extends keyof OrganizationLimits>(key: K): OrganizationLimits[K] {
    return this._limits[key];
  }

  /**
   * @method setLimit
   * @description 设置组织限制
   * @param key 限制键
   * @param value 限制值
   */
  setLimit<K extends keyof OrganizationLimits>(
    key: K,
    value: OrganizationLimits[K],
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
   * @method canAddMember
   * @description 检查是否可以添加成员
   * @returns {boolean} 是否可以添加成员
   */
  canAddMember(): boolean {
    return this._members.length < this._limits.maxUsers;
  }

  /**
   * @method canAddChild
   * @description 检查是否可以添加子组织
   * @returns {boolean} 是否可以添加子组织
   */
  canAddChild(): boolean {
    return this._children.length < this._limits.maxDepartments;
  }

  /**
   * @static
   * @method create
   * @description 创建组织
   * @param code 组织代码
   * @param name 组织名称
   * @param tenantId 租户ID
   * @param type 组织类型
   * @param parentId 父组织ID
   * @returns {Organization} 组织实体
   */
  static create(
    code: OrganizationCode,
    name: string,
    tenantId: Uuid,
    type: OrganizationType = OrganizationType.DEPARTMENT,
    parentId?: Uuid,
  ): Organization {
    const id = Uuid.generate();
    const organization = new Organization(
      id,
      code,
      name,
      tenantId,
      type,
      parentId,
    );
    return organization;
  }
}
