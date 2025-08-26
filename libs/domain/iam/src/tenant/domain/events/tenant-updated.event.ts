/**
 * @file tenant-updated.event.ts
 * @description 租户更新事件
 *
 * 该文件定义了租户更新事件，当租户信息被更新时触发。
 * 该事件包含更新前后的数据对比和更新上下文。
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';

/**
 * @interface TenantUpdatedEventData
 * @description 租户更新事件数据
 */
export interface TenantUpdatedEventData {
  tenantId: string;
  tenantCode: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  updatedBy?: string;
  updatedAt: Date;
}

/**
 * @interface SerializedEventData
 * @description 序列化的事件数据接口
 */
interface SerializedEventData {
  metadata: EventMetadata;
}

/**
 * @class TenantUpdatedEvent
 * @description 租户更新事件
 */
export class TenantUpdatedEvent extends BaseEvent {
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
    data?: TenantUpdatedEventData,
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
   * @returns {TenantUpdatedEvent} 租户更新事件实例
   */
  static deserialize(data: SerializedEventData): TenantUpdatedEvent {
    const eventData = data.metadata.data as TenantUpdatedEventData;
    return new TenantUpdatedEvent(
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
