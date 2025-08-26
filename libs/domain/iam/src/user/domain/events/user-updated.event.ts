/**
 * @file user-updated.event.ts
 * @description 用户更新事件
 *
 * 该文件定义了用户更新事件，当用户信息被更新时触发。
 * 该事件包含用户更新前后的变化信息。
 *
 * 主要功能：
 * 1. 记录用户更新事件
 * 2. 包含用户更新的变化信息
 * 3. 支持事件溯源和审计
 * 4. 支持多租户数据隔离
 *
 * 业务规则：
 * 1. 用户更新事件必须包含更新的字段信息
 * 2. 用户更新事件必须包含更新者信息
 * 3. 用户更新事件必须记录更新时间
 * 4. 用户更新事件必须包含更新原因
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';
import { User } from '../entities/user.entity';

/**
 * @interface UserUpdatedEventData
 * @description 用户更新事件数据接口
 */
export interface UserUpdatedEventData {
  userId: string; // 用户ID
  updatedFields: string[]; // 更新的字段列表
  oldValues: Record<string, any>; // 更新前的值
  newValues: Record<string, any>; // 更新后的值
  updatedBy?: string; // 更新者ID
  updateReason?: string; // 更新原因
  tenantId: string; // 租户ID
}

/**
 * @class UserUpdatedEvent
 * @description 用户更新事件
 */
export class UserUpdatedEvent extends BaseEvent {
  /**
   * @property eventData
   * @description 事件数据
   */
  public readonly eventData: UserUpdatedEventData;

  /**
   * @constructor
   * @description 构造函数
   * @param user 用户实体
   * @param updatedFields 更新的字段列表
   * @param oldValues 更新前的值
   * @param newValues 更新后的值
   * @param updatedBy 更新者ID（可选）
   * @param updateReason 更新原因（可选）
   * @param correlationId 关联ID（可选）
   * @param causationId 因果ID（可选）
   */
  constructor(
    user: User,
    updatedFields: string[],
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    updatedBy?: string,
    updateReason?: string,
    correlationId?: string,
    causationId?: string,
  ) {
    const eventData: UserUpdatedEventData = {
      userId: user.id.value,
      updatedFields,
      oldValues,
      newValues,
      updatedBy,
      updateReason,
      tenantId: user.tenantId.value,
    };

    super(
      user.id.value,
      'User',
      'UserUpdated',
      1,
      user.tenantId.value,
      updatedBy,
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
  static deserialize(data: Record<string, unknown>): UserUpdatedEvent {
    const eventData = data.data as UserUpdatedEventData;
    const metadata = data.metadata as Record<string, unknown>;

    // 创建一个临时事件实例并设置属性
    const event = Object.create(
      UserUpdatedEvent.prototype,
    ) as UserUpdatedEvent & {
      metadata: EventMetadata;
      eventData: UserUpdatedEventData;
    };

    // 设置元数据和事件数据
    event.metadata = metadata as unknown as EventMetadata;
    event.eventData = eventData;

    return event as UserUpdatedEvent;
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
   * @method getUpdatedFields
   * @description 获取更新的字段列表
   * @returns 更新的字段列表
   */
  getUpdatedFields(): string[] {
    return this.eventData.updatedFields;
  }

  /**
   * @method getOldValues
   * @description 获取更新前的值
   * @returns 更新前的值
   */
  getOldValues(): Record<string, unknown> {
    return this.eventData.oldValues;
  }

  /**
   * @method getNewValues
   * @description 获取更新后的值
   * @returns 更新后的值
   */
  getNewValues(): Record<string, unknown> {
    return this.eventData.newValues;
  }

  /**
   * @method getUpdatedBy
   * @description 获取更新者ID
   * @returns 更新者ID
   */
  getUpdatedBy(): string | undefined {
    return this.eventData.updatedBy;
  }

  /**
   * @method getUpdateReason
   * @description 获取更新原因
   * @returns 更新原因
   */
  getUpdateReason(): string | undefined {
    return this.eventData.updateReason;
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
   * @method hasFieldChanged
   * @description 检查指定字段是否发生变化
   * @param fieldName 字段名
   * @returns 是否发生变化
   */
  hasFieldChanged(fieldName: string): boolean {
    return this.eventData.updatedFields.includes(fieldName);
  }

  /**
   * @method getFieldChange
   * @description 获取指定字段的变化
   * @param fieldName 字段名
   * @returns 字段变化信息
   */
  getFieldChange(
    fieldName: string,
  ): { oldValue: unknown; newValue: unknown } | null {
    if (!this.hasFieldChanged(fieldName)) {
      return null;
    }
    return {
      oldValue: this.eventData.oldValues[fieldName],
      newValue: this.eventData.newValues[fieldName],
    };
  }
}
