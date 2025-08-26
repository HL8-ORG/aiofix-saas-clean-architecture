/**
 * @file department-created.event.ts
 * @description 部门创建事件
 *
 * 该文件定义了部门创建事件，当部门被创建时触发。
 * 该事件包含部门的基本信息和创建上下文。
 */

import { BaseEvent, EventMetadata } from '@aiofix/domain-shared';

/**
 * @interface DepartmentCreatedEventData
 * @description 部门创建事件数据
 */
export interface DepartmentCreatedEventData {
  departmentId: string;
  departmentCode: string;
  name: string;
  description?: string;
  tenantId: string;
  organizationId: string;
  parentDepartmentId?: string;
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
 * @class DepartmentCreatedEvent
 * @description 部门创建事件
 */
export class DepartmentCreatedEvent extends BaseEvent {
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
    data?: DepartmentCreatedEventData,
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
   * @returns {DepartmentCreatedEvent} 部门创建事件实例
   */
  static deserialize(data: SerializedEventData): DepartmentCreatedEvent {
    const eventData = data.metadata.data as DepartmentCreatedEventData;
    return new DepartmentCreatedEvent(
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
