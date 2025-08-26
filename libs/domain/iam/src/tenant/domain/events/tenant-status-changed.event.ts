/**
 * @file tenant-status-changed.event.ts
 * @description 租户状态变更事件
 *
 * 该文件定义了租户状态变更事件，当租户状态发生变化时触发。
 * 该事件包含状态变更的详细信息和管理上下文。
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';

/**
 * @interface TenantStatusChangedEventData
 * @description 租户状态变更事件数据
 */
export interface TenantStatusChangedEventData {
  tenantId: string;
  tenantCode: string;
  oldStatus: string;
  newStatus: string;
  reason?: string;
  changedBy?: string;
  changedAt: Date;
}

/**
 * @interface SerializedEventData
 * @description 序列化的事件数据接口
 */
interface SerializedEventData {
  metadata: EventMetadata;
}

/**
 * @class TenantStatusChangedEvent
 * @description 租户状态变更事件
 */
export class TenantStatusChangedEvent extends BaseEvent {
  constructor(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    eventVersion: number = 1,
    tenantId?: string,
    userId?: string,
    correlationId?: string,
    causationId?: string,
    source?: string,
    data?: TenantStatusChangedEventData,
  ) {
    super(
      aggregateId,
      aggregateType,
      eventType,
      eventVersion,
      tenantId,
      userId,
      correlationId,
      causationId,
      source,
      data,
    );
  }

  /**
   * @method serializeEventData
   * @description 序列化事件数据
   * @returns {Record<string, unknown>} 序列化后的事件数据
   */
  serializeEventData(): Record<string, unknown> {
    return this.metadata.data || {};
  }

  /**
   * @static
   * @method deserialize
   * @description 反序列化事件
   * @param data 事件数据
   * @returns {TenantStatusChangedEvent} 租户状态变更事件实例
   */
  static deserialize(data: SerializedEventData): TenantStatusChangedEvent {
    const eventData = data.metadata.data as TenantStatusChangedEventData;
    return new TenantStatusChangedEvent(
      data.metadata.aggregateId,
      data.metadata.aggregateType,
      data.metadata.eventType,
      data.metadata.eventVersion,
      data.metadata.tenantId,
      data.metadata.userId,
      data.metadata.correlationId,
      data.metadata.causationId,
      data.metadata.source,
      eventData,
    );
  }
}
