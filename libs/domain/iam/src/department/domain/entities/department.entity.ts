/**
 * @file department.entity.ts
 * @description 部门实体
 *
 * 该文件定义了部门实体，包含部门的核心业务逻辑和状态管理。
 * 部门是IAM系统中的重要实体，负责部门架构管理和数据隔离。
 *
 * 主要功能：
 * 1. 部门信息管理（基本信息、联系方式、设置等）
 * 2. 部门状态管理（激活、暂停、禁用等）
 * 3. 部门层级关系管理（父子部门）
 * 4. 部门成员管理
 * 5. 部门权限和设置管理
 *
 * 业务规则：
 * 1. 部门必须归属于某个组织
 * 2. 部门代码在组织内必须唯一
 * 3. 部门可以形成层级关系（父子部门）
 * 4. 部门状态变更需要记录历史
 * 5. 删除部门前必须确保没有子部门和成员
 */

import { BaseEntity, Uuid } from '@aiofix/domain-shared';
import { DepartmentCode } from '../value-objects/department-code.vo';

/**
 * @enum DepartmentStatus
 * @description 部门状态枚举
 */
export enum DepartmentStatus {
  ACTIVE = 'active', // 活跃
  SUSPENDED = 'suspended', // 暂停
  DISABLED = 'disabled', // 禁用
}

/**
 * @enum DepartmentType
 * @description 部门类型枚举
 */
export enum DepartmentType {
  FUNCTIONAL = 'functional', // 职能部门
  BUSINESS = 'business', // 业务部门
  PROJECT = 'project', // 项目部门
  TEAM = 'team', // 团队
  GROUP = 'group', // 小组
  UNIT = 'unit', // 单元
  SECTION = 'section', // 科室
  DIVISION = 'division', // 分部
}

/**
 * @interface DepartmentContact
 * @description 部门联系信息
 */
export interface DepartmentContact {
  email?: string; // 邮箱
  phone?: string; // 电话
  address?: string; // 地址
  office?: string; // 办公室
  contactPerson?: string; // 联系人
  contactPhone?: string; // 联系电话
}

/**
 * @interface DepartmentSettings
 * @description 部门设置
 */
export interface DepartmentSettings {
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
  workflowSettings: {
    // 工作流设置
    requireApprovalForLeave: boolean;
    requireApprovalForExpense: boolean;
    requireApprovalForProject: boolean;
  };
}

/**
 * @interface DepartmentLimits
 * @description 部门限制
 */
export interface DepartmentLimits {
  maxMembers: number; // 最大成员数
  maxSubDepartments: number; // 最大子部门数
  maxProjects: number; // 最大项目数
  budgetLimit: number; // 预算限制
  storageLimit: number; // 存储限制（GB）
  apiRateLimit: number; // API速率限制
}

/**
 * @class Department
 * @description 部门实体，负责维护部门状态和业务规则
 * @extends BaseEntity
 * @rule 部门名称在同一组织内必须唯一
 * @event DepartmentCreatedEvent
 */
export class Department extends BaseEntity {
  private readonly _code: DepartmentCode;
  private _name: string;
  private _description?: string;
  private _status: DepartmentStatus;
  private _type: DepartmentType;
  private readonly _organizationId: Uuid;
  private _parentId?: Uuid;
  private _children: Uuid[] = [];
  private _managerId?: Uuid;
  private _members: Uuid[] = [];
  private _contact: DepartmentContact = {};
  private _settings: DepartmentSettings = {
    allowUserRegistration: true,
    requireApproval: false,
    autoAssignRoles: false,
    dataIsolationLevel: 'department',
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    workflowSettings: {
      requireApprovalForLeave: true,
      requireApprovalForExpense: true,
      requireApprovalForProject: false,
    },
  };
  private _limits: DepartmentLimits = {
    maxMembers: 100,
    maxSubDepartments: 20,
    maxProjects: 50,
    budgetLimit: 1000000,
    storageLimit: 50,
    apiRateLimit: 500,
  };
  private _metadata: Record<string, any> = {};

  /**
   * @constructor
   * @param id 部门ID
   * @param code 部门代码
   * @param name 部门名称
   * @param organizationId 组织ID
   * @param type 部门类型
   * @param parentId 父部门ID
   */
  constructor(
    id: Uuid,
    code: DepartmentCode,
    name: string,
    organizationId: Uuid,
    type: DepartmentType = DepartmentType.FUNCTIONAL,
    parentId?: Uuid,
  ) {
    super(id);
    this._code = code;
    this._name = name;
    this._organizationId = organizationId;
    this._type = type;
    this._parentId = parentId;
    this._status = DepartmentStatus.ACTIVE;
  }

  /**
   * @getter code
   * @description 获取部门代码
   * @returns {DepartmentCode} 部门代码
   */
  get code(): DepartmentCode {
    return this._code;
  }

  /**
   * @getter name
   * @description 获取部门名称
   * @returns {string} 部门名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * @getter description
   * @description 获取部门描述
   * @returns {string|undefined} 部门描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * @getter status
   * @description 获取部门状态
   * @returns {DepartmentStatus} 部门状态
   */
  get status(): DepartmentStatus {
    return this._status;
  }

  /**
   * @getter type
   * @description 获取部门类型
   * @returns {DepartmentType} 部门类型
   */
  get type(): DepartmentType {
    return this._type;
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
   * @description 获取父部门ID
   * @returns {Uuid|undefined} 父部门ID
   */
  get parentId(): Uuid | undefined {
    return this._parentId;
  }

  /**
   * @getter children
   * @description 获取子部门ID列表
   * @returns {Uuid[]} 子部门ID列表
   */
  get children(): Uuid[] {
    return [...this._children];
  }

  /**
   * @getter managerId
   * @description 获取部门管理者ID
   * @returns {Uuid|undefined} 部门管理者ID
   */
  get managerId(): Uuid | undefined {
    return this._managerId;
  }

  /**
   * @getter members
   * @description 获取部门成员ID列表
   * @returns {Uuid[]} 部门成员ID列表
   */
  get members(): Uuid[] {
    return [...this._members];
  }

  /**
   * @getter contact
   * @description 获取部门联系信息
   * @returns {DepartmentContact} 部门联系信息
   */
  get contact(): DepartmentContact {
    return { ...this._contact };
  }

  /**
   * @getter settings
   * @description 获取部门设置
   * @returns {DepartmentSettings} 部门设置
   */
  get settings(): DepartmentSettings {
    return { ...this._settings };
  }

  /**
   * @getter limits
   * @description 获取部门限制
   * @returns {DepartmentLimits} 部门限制
   */
  get limits(): DepartmentLimits {
    return { ...this._limits };
  }

  /**
   * @getter isActive
   * @description 判断部门是否活跃
   * @returns {boolean} 是否活跃
   */
  get isActive(): boolean {
    return this._status === DepartmentStatus.ACTIVE;
  }

  /**
   * @getter isRoot
   * @description 判断是否为根部门
   * @returns {boolean} 是否为根部门
   */
  get isRoot(): boolean {
    return !this._parentId;
  }

  /**
   * @getter hasChildren
   * @description 判断是否有子部门
   * @returns {boolean} 是否有子部门
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
   * @description 激活部门
   */
  activate(): void {
    this._status = DepartmentStatus.ACTIVE;
  }

  /**
   * @method suspend
   * @description 暂停部门
   */
  suspend(): void {
    if (this._status === DepartmentStatus.ACTIVE) {
      this._status = DepartmentStatus.SUSPENDED;
    }
  }

  /**
   * @method disable
   * @description 禁用部门
   */
  disable(): void {
    this._status = DepartmentStatus.DISABLED;
  }

  /**
   * @method updateName
   * @description 更新部门名称
   * @param name 新名称
   */
  updateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('部门名称不能为空');
    }
    this._name = name.trim();
  }

  /**
   * @method updateDescription
   * @description 更新部门描述
   * @param description 新描述
   */
  updateDescription(description?: string): void {
    this._description = description?.trim();
  }

  /**
   * @method updateType
   * @description 更新部门类型
   * @param type 新类型
   */
  updateType(type: DepartmentType): void {
    this._type = type;
  }

  /**
   * @method setParent
   * @description 设置父部门
   * @param parentId 父部门ID
   */
  setParent(parentId?: Uuid): void {
    // 防止循环引用
    if (parentId && parentId.equals(this.id)) {
      throw new Error('部门不能将自己设为父部门');
    }
    this._parentId = parentId;
  }

  /**
   * @method addChild
   * @description 添加子部门
   * @param childId 子部门ID
   */
  addChild(childId: Uuid): void {
    if (!this._children.some(id => id.equals(childId))) {
      this._children.push(childId);
    }
  }

  /**
   * @method removeChild
   * @description 移除子部门
   * @param childId 子部门ID
   */
  removeChild(childId: Uuid): void {
    this._children = this._children.filter(id => !id.equals(childId));
  }

  /**
   * @method setManager
   * @description 设置部门管理者
   * @param managerId 管理者ID
   */
  setManager(managerId?: Uuid): void {
    this._managerId = managerId;
  }

  /**
   * @method addMember
   * @description 添加部门成员
   * @param memberId 成员ID
   */
  addMember(memberId: Uuid): void {
    if (!this._members.some(id => id.equals(memberId))) {
      this._members.push(memberId);
    }
  }

  /**
   * @method removeMember
   * @description 移除部门成员
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
   * @description 更新部门联系信息
   * @param contact 联系信息
   */
  updateContact(contact: Partial<DepartmentContact>): void {
    this._contact = { ...this._contact, ...contact };
  }

  /**
   * @method updateSettings
   * @description 更新部门设置
   * @param settings 部门设置
   */
  updateSettings(settings: Partial<DepartmentSettings>): void {
    this._settings = { ...this._settings, ...settings };
  }

  /**
   * @method updateLimits
   * @description 更新部门限制
   * @param limits 部门限制
   */
  updateLimits(limits: Partial<DepartmentLimits>): void {
    this._limits = { ...this._limits, ...limits };
  }

  /**
   * @method getSetting
   * @description 获取部门设置
   * @param key 设置键
   * @returns {DepartmentSettings[K]} 设置值
   */
  getSetting<K extends keyof DepartmentSettings>(
    key: K,
  ): DepartmentSettings[K] {
    return this._settings[key];
  }

  /**
   * @method setSetting
   * @description 设置部门设置
   * @param key 设置键
   * @param value 设置值
   */
  setSetting<K extends keyof DepartmentSettings>(
    key: K,
    value: DepartmentSettings[K],
  ): void {
    this._settings[key] = value;
  }

  /**
   * @method getLimit
   * @description 获取部门限制
   * @param key 限制键
   * @returns {DepartmentLimits[K]} 限制值
   */
  getLimit<K extends keyof DepartmentLimits>(key: K): DepartmentLimits[K] {
    return this._limits[key];
  }

  /**
   * @method setLimit
   * @description 设置部门限制
   * @param key 限制键
   * @param value 限制值
   */
  setLimit<K extends keyof DepartmentLimits>(
    key: K,
    value: DepartmentLimits[K],
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
    return this._members.length < this._limits.maxMembers;
  }

  /**
   * @method canAddChild
   * @description 检查是否可以添加子部门
   * @returns {boolean} 是否可以添加子部门
   */
  canAddChild(): boolean {
    return this._children.length < this._limits.maxSubDepartments;
  }

  /**
   * @static
   * @method create
   * @description 创建部门
   * @param code 部门代码
   * @param name 部门名称
   * @param organizationId 组织ID
   * @param type 部门类型
   * @param parentId 父部门ID
   * @returns {Department} 部门实体
   */
  static create(
    code: DepartmentCode,
    name: string,
    organizationId: Uuid,
    type: DepartmentType = DepartmentType.FUNCTIONAL,
    parentId?: Uuid,
  ): Department {
    const id = Uuid.generate();
    return new Department(id, code, name, organizationId, type, parentId);
  }
}
