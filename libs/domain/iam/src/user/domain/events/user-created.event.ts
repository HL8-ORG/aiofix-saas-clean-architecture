/**
 * @file user-created.event.ts
 * @description 用户创建事件
 *
 * 该文件定义了用户创建事件，当用户被创建时触发。
 * 该事件包含用户创建时的所有相关信息。
 *
 * 主要功能：
 * 1. 记录用户创建事件
 * 2. 包含用户创建时的完整信息
 * 3. 支持事件溯源和审计
 * 4. 支持多租户数据隔离
 *
 * 业务规则：
 * 1. 用户创建事件必须包含用户的基本信息
 * 2. 用户创建事件必须包含租户信息
 * 3. 用户创建事件必须包含创建者信息
 * 4. 用户创建事件必须记录创建时间
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';
import { User } from '../entities/user.entity';

/**
 * @interface UserCreatedEventData
 * @description 用户创建事件数据接口
 */
export interface UserCreatedEventData {
  userId: string; // 用户ID
  username: string; // 用户名
  email: string; // 邮箱
  firstName?: string; // 名
  lastName?: string; // 姓
  displayName?: string; // 显示名称
  tenantId: string; // 租户ID
  organizationId: string; // 组织ID
  departmentId?: string; // 部门ID
  userType: string; // 用户类型
  status: string; // 用户状态
  createdBy?: string; // 创建者ID
  profile?: Record<string, any>; // 用户档案
  settings?: Record<string, any>; // 用户设置
}

/**
 * @class UserCreatedEvent
 * @description 用户创建事件
 */
export class UserCreatedEvent extends BaseEvent {
  /**
   * @property eventData
   * @description 事件数据
   */
  public readonly eventData: UserCreatedEventData;

  /**
   * @constructor
   * @description 构造函数
   * @param user 用户实体
   * @param createdBy 创建者ID（可选）
   * @param correlationId 关联ID（可选）
   * @param causationId 因果ID（可选）
   */
  constructor(
    user: User,
    createdBy?: string,
    correlationId?: string,
    causationId?: string,
  ) {
    const eventData: UserCreatedEventData = {
      userId: user.id.value,
      username: user.username.value,
      email: user.email.value,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      displayName: user.profile?.displayName,
      tenantId: user.tenantId.value,
      organizationId: user.organizationId?.value || '',
      departmentId:
        user.departmentIds.length > 0 ? user.departmentIds[0].value : undefined,
      userType: user.type,
      status: user.status,
      createdBy,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            displayName: user.profile.displayName,
            avatar: user.profile.avatar,
            phone: user.profile.phone,
            address: user.profile.address,
            timezone: user.profile.timezone,
            locale: user.profile.locale,
            bio: user.profile.bio,
            website: user.profile.website,
            socialLinks: user.profile.socialLinks,
          }
        : undefined,
      settings: user.settings
        ? {
            emailNotifications: user.settings.emailNotifications,
            smsNotifications: user.settings.smsNotifications,
            pushNotifications: user.settings.pushNotifications,
            twoFactorEnabled: user.settings.twoFactorEnabled,
            language: user.settings.language,
            theme: user.settings.theme,
            timezone: user.settings.timezone,
            dateFormat: user.settings.dateFormat,
            timeFormat: user.settings.timeFormat,
            currency: user.settings.currency,
            privacyLevel: user.settings.privacyLevel,
          }
        : undefined,
    };

    super(
      user.id.value,
      'User',
      'UserCreated',
      1,
      user.tenantId.value,
      createdBy,
      correlationId,
      causationId,
      'IAM.Domain.User',
      eventData,
    );

    this.eventData = eventData;
  }

  /**
   * @method serializeEventData
   * @description 序列化事件数据
   * @returns 序列化后的事件数据
   */
  protected serializeEventData(): Record<string, any> {
    return this.eventData;
  }

  /**
   * @method deserialize
   * @description 反序列化事件
   * @param data 序列化的事件数据
   * @returns 事件实例
   */
  static deserialize(data: Record<string, unknown>): UserCreatedEvent {
    const eventData = data.data as UserCreatedEventData;
    const metadata = data.metadata as Record<string, unknown>;

    // 创建一个临时事件实例并设置属性
    const event = Object.create(
      UserCreatedEvent.prototype,
    ) as UserCreatedEvent & {
      metadata: EventMetadata;
      eventData: UserCreatedEventData;
    };

    // 设置元数据和事件数据
    event.metadata = metadata as unknown as EventMetadata;
    event.eventData = eventData;

    return event as UserCreatedEvent;
  }

  /**
   * @method getUserId
   * @description 获取用户ID
   * @returns 用户ID
   */
  getUserId(): string {
    return this.eventData.userId;
  }

  /**
   * @method getUsername
   * @description 获取用户名
   * @returns 用户名
   */
  getUsername(): string {
    return this.eventData.username;
  }

  /**
   * @method getEmail
   * @description 获取邮箱
   * @returns 邮箱
   */
  getEmail(): string {
    return this.eventData.email;
  }

  /**
   * @method getTenantId
   * @description 获取租户ID
   * @returns 租户ID
   */
  getTenantId(): string {
    return this.eventData.tenantId;
  }

  /**
   * @method getOrganizationId
   * @description 获取组织ID
   * @returns 组织ID
   */
  getOrganizationId(): string {
    return this.eventData.organizationId;
  }

  /**
   * @method getDepartmentId
   * @description 获取部门ID
   * @returns 部门ID
   */
  getDepartmentId(): string | undefined {
    return this.eventData.departmentId;
  }

  /**
   * @method getUserType
   * @description 获取用户类型
   * @returns 用户类型
   */
  getUserType(): string {
    return this.eventData.userType;
  }

  /**
   * @method getStatus
   * @description 获取用户状态
   * @returns 用户状态
   */
  getStatus(): string {
    return this.eventData.status;
  }

  /**
   * @method getCreatedBy
   * @description 获取创建者ID
   * @returns 创建者ID
   */
  getCreatedBy(): string | undefined {
    return this.eventData.createdBy;
  }

  /**
   * @method getProfile
   * @description 获取用户档案
   * @returns 用户档案
   */
  getProfile(): Record<string, unknown> | undefined {
    return this.eventData.profile;
  }

  /**
   * @method getSettings
   * @description 获取用户设置
   * @returns 用户设置
   */
  getSettings(): Record<string, unknown> | undefined {
    return this.eventData.settings;
  }
}
