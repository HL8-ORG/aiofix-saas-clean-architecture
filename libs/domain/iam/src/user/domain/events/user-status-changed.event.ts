/**
 * @file user-status-changed.event.ts
 * @description 用户状态变更事件
 *
 * 该文件定义了用户状态变更事件，当用户状态发生变化时触发。
 * 该事件包含状态变更的详细信息。
 *
 * 主要功能：
 * 1. 记录用户状态变更事件
 * 2. 包含状态变更的原因和操作者
 * 3. 支持事件溯源和审计
 * 4. 支持多租户数据隔离
 *
 * 业务规则：
 * 1. 状态变更事件必须包含变更前后的状态
 * 2. 状态变更事件必须包含变更原因
 * 3. 状态变更事件必须包含操作者信息
 * 4. 状态变更事件必须记录变更时间
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';
import { User, UserStatus } from '../entities/user.entity';

/**
 * @interface UserStatusChangedEventData
 * @description 用户状态变更事件数据接口
 */
export interface UserStatusChangedEventData {
  userId: string; // 用户ID
  oldStatus: UserStatus; // 变更前的状态
  newStatus: UserStatus; // 变更后的状态
  changedBy?: string; // 变更操作者ID
  changeReason?: string; // 变更原因
  effectiveDate?: Date; // 生效时间
  expiryDate?: Date; // 过期时间（如果适用）
  tenantId: string; // 租户ID
  metadata?: Record<string, any>; // 额外元数据
}

/**
 * @class UserStatusChangedEvent
 * @description 用户状态变更事件
 */
export class UserStatusChangedEvent extends BaseEvent {
  /**
   * @property eventData
   * @description 事件数据
   */
  public readonly eventData: UserStatusChangedEventData;

  /**
   * @constructor
   * @description 构造函数
   * @param user 用户实体
   * @param oldStatus 变更前的状态
   * @param newStatus 变更后的状态
   * @param changedBy 变更操作者ID（可选）
   * @param changeReason 变更原因（可选）
   * @param effectiveDate 生效时间（可选）
   * @param expiryDate 过期时间（可选）
   * @param metadata 额外元数据（可选）
   * @param correlationId 关联ID（可选）
   * @param causationId 因果ID（可选）
   */
  constructor(
    user: User,
    oldStatus: UserStatus,
    newStatus: UserStatus,
    changedBy?: string,
    changeReason?: string,
    effectiveDate?: Date,
    expiryDate?: Date,
    metadata?: Record<string, any>,
    correlationId?: string,
    causationId?: string,
  ) {
    const eventData: UserStatusChangedEventData = {
      userId: user.id.value,
      oldStatus,
      newStatus,
      changedBy,
      changeReason,
      effectiveDate: effectiveDate || new Date(),
      expiryDate,
      tenantId: user.tenantId.value,
      metadata,
    };

    super(
      user.id.value,
      'User',
      'UserStatusChanged',
      1,
      user.tenantId.value,
      changedBy,
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
  static deserialize(data: Record<string, unknown>): UserStatusChangedEvent {
    const eventData = data.data as UserStatusChangedEventData;
    const metadata = data.metadata as Record<string, unknown>;

    // 创建一个临时事件实例并设置属性
    const event = Object.create(
      UserStatusChangedEvent.prototype,
    ) as UserStatusChangedEvent & {
      metadata: EventMetadata;
      eventData: UserStatusChangedEventData;
    };

    // 设置元数据和事件数据
    event.metadata = metadata as unknown as EventMetadata;
    event.eventData = eventData;

    return event as UserStatusChangedEvent;
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
   * @method getOldStatus
   * @description 获取变更前的状态
   * @returns 变更前的状态
   */
  getOldStatus(): UserStatus {
    return this.eventData.oldStatus;
  }

  /**
   * @method getNewStatus
   * @description 获取变更后的状态
   * @returns 变更后的状态
   */
  getNewStatus(): UserStatus {
    return this.eventData.newStatus;
  }

  /**
   * @method getChangedBy
   * @description 获取变更操作者ID
   * @returns 变更操作者ID
   */
  getChangedBy(): string | undefined {
    return this.eventData.changedBy;
  }

  /**
   * @method getChangeReason
   * @description 获取变更原因
   * @returns 变更原因
   */
  getChangeReason(): string | undefined {
    return this.eventData.changeReason;
  }

  /**
   * @method getEffectiveDate
   * @description 获取生效时间
   * @returns 生效时间
   */
  getEffectiveDate(): Date {
    return this.eventData.effectiveDate || new Date();
  }

  /**
   * @method getExpiryDate
   * @description 获取过期时间
   * @returns 过期时间
   */
  getExpiryDate(): Date | undefined {
    return this.eventData.expiryDate;
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
   * @method getMetadata
   * @description 获取额外元数据
   * @returns 额外元数据
   */
  getMetadata(): Record<string, unknown> | undefined {
    return this.eventData.metadata;
  }

  /**
   * @method isStatusUpgrade
   * @description 判断是否为状态升级
   * @returns 是否为状态升级
   */
  isStatusUpgrade(): boolean {
    const statusHierarchy = {
      [UserStatus.DISABLED]: 0,
      [UserStatus.LOCKED]: 1,
      [UserStatus.SUSPENDED]: 2,
      [UserStatus.PENDING]: 3,
      [UserStatus.ACTIVE]: 4,
    };

    const oldLevel = statusHierarchy[this.eventData.oldStatus] || 0;
    const newLevel = statusHierarchy[this.eventData.newStatus] || 0;

    return newLevel > oldLevel;
  }

  /**
   * @method isStatusDowngrade
   * @description 判断是否为状态降级
   * @returns 是否为状态降级
   */
  isStatusDowngrade(): boolean {
    return (
      !this.isStatusUpgrade() &&
      this.eventData.oldStatus !== this.eventData.newStatus
    );
  }

  /**
   * @method isTemporaryStatus
   * @description 判断是否为临时状态
   * @returns 是否为临时状态
   */
  isTemporaryStatus(): boolean {
    return (
      this.eventData.newStatus === UserStatus.SUSPENDED ||
      this.eventData.newStatus === UserStatus.LOCKED
    );
  }

  /**
   * @method getStatusChangeType
   * @description 获取状态变更类型
   * @returns 状态变更类型
   */
  getStatusChangeType(): 'upgrade' | 'downgrade' | 'same' {
    if (this.eventData.oldStatus === this.eventData.newStatus) {
      return 'same';
    }
    return this.isStatusUpgrade() ? 'upgrade' : 'downgrade';
  }
}
