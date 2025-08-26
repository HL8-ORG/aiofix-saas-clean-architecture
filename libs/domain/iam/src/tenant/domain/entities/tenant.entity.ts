/**
 * @file tenant.entity.ts
 * @description 租户实体
 *
 * 该文件定义了租户实体，表示系统中的租户。
 * 租户是IAM系统的核心概念，代表一个独立的企业或组织。
 *
 * 遵循DDD和Clean Architecture原则，提供纯领域对象。
 */

import { BaseEntity, Uuid } from '@aiofix/domain-shared';
import { TenantCode } from '../value-objects/tenant-code.vo';

/**
 * @enum TenantStatus
 * @description 租户状态枚举
 */
export enum TenantStatus {
  /** 待激活 */
  PENDING = 'pending',
  /** 激活 */
  ACTIVE = 'active',
  /** 暂停 */
  SUSPENDED = 'suspended',
  /** 停用 */
  DISABLED = 'disabled',
}

/**
 * @class Tenant
 * @description 租户实体，负责维护租户状态和业务规则
 * @extends BaseEntity
 * @rule 租户名称必须唯一
 * @event TenantCreatedEvent
 */
export class Tenant extends BaseEntity {
  private readonly _code: TenantCode;
  private _name: string;
  private _description?: string;
  private _status: TenantStatus;
  private _contactEmail?: string;
  private _contactPhone?: string;
  private _maxUsers: number;
  private _maxOrganizations: number;
  private _settings: Record<string, unknown>;

  /**
   * @constructor
   * @description 创建租户实体
   * @param id 租户唯一标识符
   * @param code 租户代码
   * @param name 租户名称
   * @param status 租户状态
   * @param maxUsers 最大用户数
   * @param maxOrganizations 最大组织数
   * @param description 租户描述
   * @param contactEmail 联系邮箱
   * @param contactPhone 联系电话
   * @param settings 租户设置
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   * @param version 版本号
   */
  constructor(
    id: Uuid,
    code: TenantCode,
    name: string,
    status: TenantStatus = TenantStatus.PENDING,
    maxUsers: number = 100,
    maxOrganizations: number = 10,
    description?: string,
    contactEmail?: string,
    contactPhone?: string,
    settings: Record<string, unknown> = {},
    createdAt?: Date,
    updatedAt?: Date,
    version?: number,
  ) {
    super(id, createdAt, updatedAt, version);
    this._code = code;
    this._name = name;
    this._status = status;
    this._maxUsers = maxUsers;
    this._maxOrganizations = maxOrganizations;
    this._description = description;
    this._contactEmail = contactEmail;
    this._contactPhone = contactPhone;
    this._settings = { ...settings };
  }

  /**
   * @getter code
   * @description 获取租户代码
   * @returns {TenantCode} 租户代码
   */
  get code(): TenantCode {
    return this._code;
  }

  /**
   * @getter name
   * @description 获取租户名称
   * @returns {string} 租户名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * @getter description
   * @description 获取租户描述
   * @returns {string | undefined} 租户描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * @getter status
   * @description 获取租户状态
   * @returns {TenantStatus} 租户状态
   */
  get status(): TenantStatus {
    return this._status;
  }

  /**
   * @getter contactEmail
   * @description 获取联系邮箱
   * @returns {string | undefined} 联系邮箱
   */
  get contactEmail(): string | undefined {
    return this._contactEmail;
  }

  /**
   * @getter contactPhone
   * @description 获取联系电话
   * @returns {string | undefined} 联系电话
   */
  get contactPhone(): string | undefined {
    return this._contactPhone;
  }

  /**
   * @getter maxUsers
   * @description 获取最大用户数
   * @returns {number} 最大用户数
   */
  get maxUsers(): number {
    return this._maxUsers;
  }

  /**
   * @getter maxOrganizations
   * @description 获取最大组织数
   * @returns {number} 最大组织数
   */
  get maxOrganizations(): number {
    return this._maxOrganizations;
  }

  /**
   * @getter settings
   * @description 获取租户设置
   * @returns {Record<string, unknown>} 租户设置
   */
  get settings(): Record<string, unknown> {
    return { ...this._settings };
  }

  /**
   * @method isActive
   * @description 判断租户是否激活
   * @returns {boolean} 是否激活
   */
  isActive(): boolean {
    return this._status === TenantStatus.ACTIVE;
  }

  /**
   * @method isSuspended
   * @description 判断租户是否暂停
   * @returns {boolean} 是否暂停
   */
  isSuspended(): boolean {
    return this._status === TenantStatus.SUSPENDED;
  }

  /**
   * @method isDisabled
   * @description 判断租户是否停用
   * @returns {boolean} 是否停用
   */
  isDisabled(): boolean {
    return this._status === TenantStatus.DISABLED;
  }

  /**
   * @method activate
   * @description 激活租户
   */
  activate(): void {
    if (this._status === TenantStatus.DISABLED) {
      throw new Error('Cannot activate a disabled tenant');
    }
    this._status = TenantStatus.ACTIVE;
    this.updateTimestamp();
  }

  /**
   * @method suspend
   * @description 暂停租户
   */
  suspend(): void {
    if (this._status === TenantStatus.DISABLED) {
      throw new Error('Cannot suspend a disabled tenant');
    }
    this._status = TenantStatus.SUSPENDED;
    this.updateTimestamp();
  }

  /**
   * @method disable
   * @description 停用租户
   */
  disable(): void {
    this._status = TenantStatus.DISABLED;
    this.updateTimestamp();
  }

  /**
   * @method updateName
   * @description 更新租户名称
   * @param name 新的租户名称
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Tenant name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Tenant name cannot exceed 100 characters');
    }
    this._name = name.trim();
    this.updateTimestamp();
  }

  /**
   * @method updateDescription
   * @description 更新租户描述
   * @param description 新的租户描述
   */
  updateDescription(description?: string): void {
    if (description && description.length > 500) {
      throw new Error('Tenant description cannot exceed 500 characters');
    }
    this._description = description;
    this.updateTimestamp();
  }

  /**
   * @method updateContactInfo
   * @description 更新联系信息
   * @param email 联系邮箱
   * @param phone 联系电话
   */
  updateContactInfo(email?: string, phone?: string): void {
    this._contactEmail = email;
    this._contactPhone = phone;
    this.updateTimestamp();
  }

  /**
   * @method updateLimits
   * @description 更新租户限制
   * @param maxUsers 最大用户数
   * @param maxOrganizations 最大组织数
   */
  updateLimits(maxUsers: number, maxOrganizations: number): void {
    if (maxUsers < 1) {
      throw new Error('Max users must be at least 1');
    }
    if (maxOrganizations < 1) {
      throw new Error('Max organizations must be at least 1');
    }
    this._maxUsers = maxUsers;
    this._maxOrganizations = maxOrganizations;
    this.updateTimestamp();
  }

  /**
   * @method updateSettings
   * @description 更新租户设置
   * @param settings 新的设置
   */
  updateSettings(settings: Record<string, unknown>): void {
    this._settings = { ...settings };
    this.updateTimestamp();
  }

  /**
   * @method getSetting
   * @description 获取特定设置
   * @param key 设置键
   * @returns {unknown} 设置值
   */
  getSetting(key: string): unknown {
    return this._settings[key];
  }

  /**
   * @method setSetting
   * @description 设置特定配置
   * @param key 设置键
   * @param value 设置值
   */
  setSetting(key: string, value: unknown): void {
    this._settings[key] = value;
    this.updateTimestamp();
  }

  /**
   * @static
   * @method create
   * @description 创建新租户
   * @param code 租户代码
   * @param name 租户名称
   * @param description 租户描述
   * @param contactEmail 联系邮箱
   * @param contactPhone 联系电话
   * @returns {Tenant} 新租户实体
   */
  static create(
    code: TenantCode,
    name: string,
    description?: string,
    contactEmail?: string,
    contactPhone?: string,
  ): Tenant {
    return new Tenant(
      Uuid.generate(),
      code,
      name,
      TenantStatus.PENDING,
      100,
      10,
      description,
      contactEmail,
      contactPhone,
    );
  }
}
