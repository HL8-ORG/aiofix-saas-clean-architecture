/**
 * @file organization-updated.event.ts
 * @description 组织更新事件
 *
 * 该文件定义了组织更新事件，当组织信息被更新时触发。
 * 该事件包含更新前后的数据对比和更新上下文。
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';

/**
 * @interface OrganizationUpdatedEventData
 * @description 组织更新事件数据
 */
export interface OrganizationUpdatedEventData {
  organizationId: string;
  organizationCode: string;
  name: string;
  description?: string;
  tenantId: string;
  parentOrganizationId?: string;
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
 * @class OrganizationUpdatedEvent
 * @description 组织更新事件
 */
export class OrganizationUpdatedEvent extends BaseEvent {
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
    data?: OrganizationUpdatedEventData,
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
   * @returns {OrganizationUpdatedEvent} 组织更新事件实例
   */
  static deserialize(data: SerializedEventData): OrganizationUpdatedEvent {
    const eventData = data.metadata.data as OrganizationUpdatedEventData;
    return new OrganizationUpdatedEvent(
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
