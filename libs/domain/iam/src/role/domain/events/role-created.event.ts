/**
 * @file role-created.event.ts
 * @description 角色创建事件
 *
 * 该文件定义了角色创建事件，当角色被创建时触发。
 * 该事件包含角色的基本信息和创建上下文。
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';

/**
 * @interface RoleCreatedEventData
 * @description 角色创建事件数据
 */
export interface RoleCreatedEventData {
  roleId: string;
  roleCode: string;
  name: string;
  description?: string;
  tenantId: string;
  organizationId?: string;
  departmentId?: string;
  status: string;
  type: string;
  permissions: string[];
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
 * @class RoleCreatedEvent
 * @description 角色创建事件
 */
export class RoleCreatedEvent extends BaseEvent {
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
    data?: RoleCreatedEventData,
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
   * @returns {RoleCreatedEvent} 角色创建事件实例
   */
  static deserialize(data: SerializedEventData): RoleCreatedEvent {
    const eventData = data.metadata.data as RoleCreatedEventData;
    return new RoleCreatedEvent(
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
