/**
 * @file organization-created.event.ts
 * @description 组织创建事件
 *
 * 该文件定义了组织创建事件，当组织被创建时触发。
 * 该事件包含组织的基本信息和创建上下文。
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';

/**
 * @interface OrganizationCreatedEventData
 * @description 组织创建事件数据
 */
export interface OrganizationCreatedEventData {
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
  createdBy?: string;
}

/**
 * @interface SerializedEventData
 * @description 序列化的事件数据接口
 */
interface SerializedEventData {
  metadata: EventMetadata;
}

/**
 * @class OrganizationCreatedEvent
 * @description 组织创建事件
 */
export class OrganizationCreatedEvent extends BaseEvent {
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
    data?: OrganizationCreatedEventData,
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
   * @returns {OrganizationCreatedEvent} 组织创建事件实例
   */
  static deserialize(data: SerializedEventData): OrganizationCreatedEvent {
    const eventData = data.metadata.data as OrganizationCreatedEventData;
    return new OrganizationCreatedEvent(
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
