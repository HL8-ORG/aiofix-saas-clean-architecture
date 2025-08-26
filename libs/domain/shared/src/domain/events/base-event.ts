/**
 * @file base-event.ts
 * @description 基础事件类
 *
 * 该文件定义了所有领域事件的基础类，提供事件的基本属性和方法。
 * 所有具体的领域事件都应该继承自这个基础类。
 *
 * 主要功能：
 * 1. 提供事件的基本属性（ID、时间戳、版本等）
 * 2. 提供事件的序列化和反序列化方法
 * 3. 提供事件验证和元数据管理
 * 4. 支持事件溯源和审计
 *
 * 业务规则：
 * 1. 每个事件必须有唯一的ID
 * 2. 每个事件必须记录发生时间
 * 3. 每个事件必须包含聚合根ID
 * 4. 每个事件必须包含版本信息
 * 5. 每个事件必须包含租户ID（多租户支持）
 */

import { Uuid } from '../value-objects/uuid.vo';

/**
 * @interface EventMetadata
 * @description 事件元数据接口
 */
export interface EventMetadata {
  eventId: string; // 事件ID
  aggregateId: string; // 聚合根ID
  aggregateType: string; // 聚合根类型
  eventType: string; // 事件类型
  eventVersion: number; // 事件版本
  occurredOn: Date; // 发生时间
  tenantId?: string; // 租户ID（可选）
  userId?: string; // 用户ID（可选）
  correlationId?: string; // 关联ID（可选）
  causationId?: string; // 因果ID（可选）
  source?: string; // 事件源
  data?: Record<string, any>; // 额外数据
}

/**
 * @abstract BaseEvent
 * @description 基础事件抽象类
 */
export abstract class BaseEvent {
  /**
   * @property metadata
   * @description 事件元数据
   */
  public readonly metadata: EventMetadata;

  /**
   * @constructor
   * @description 构造函数
   * @param aggregateId 聚合根ID
   * @param aggregateType 聚合根类型
   * @param eventType 事件类型
   * @param eventVersion 事件版本
   * @param tenantId 租户ID（可选）
   * @param userId 用户ID（可选）
   * @param correlationId 关联ID（可选）
   * @param causationId 因果ID（可选）
   * @param source 事件源（可选）
   * @param data 额外数据（可选）
   */
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
    data?: Record<string, any>,
  ) {
    this.metadata = {
      eventId: Uuid.generate().value,
      aggregateId,
      aggregateType,
      eventType,
      eventVersion,
      occurredOn: new Date(),
      tenantId,
      userId,
      correlationId,
      causationId,
      source: source || 'IAM.Domain',
      data,
    };
  }

  /**
   * @method getEventId
   * @description 获取事件ID
   * @returns 事件ID
   */
  getEventId(): string {
    return this.metadata.eventId;
  }

  /**
   * @method getAggregateId
   * @description 获取聚合根ID
   * @returns 聚合根ID
   */
  getAggregateId(): string {
    return this.metadata.aggregateId;
  }

  /**
   * @method getAggregateType
   * @description 获取聚合根类型
   * @returns 聚合根类型
   */
  getAggregateType(): string {
    return this.metadata.aggregateType;
  }

  /**
   * @method getEventType
   * @description 获取事件类型
   * @returns 事件类型
   */
  getEventType(): string {
    return this.metadata.eventType;
  }

  /**
   * @method getEventVersion
   * @description 获取事件版本
   * @returns 事件版本
   */
  getEventVersion(): number {
    return this.metadata.eventVersion;
  }

  /**
   * @method getOccurredOn
   * @description 获取事件发生时间
   * @returns 发生时间
   */
  getOccurredOn(): Date {
    return this.metadata.occurredOn;
  }

  /**
   * @method getTenantId
   * @description 获取租户ID
   * @returns 租户ID
   */
  getTenantId(): string | undefined {
    return this.metadata.tenantId;
  }

  /**
   * @method getUserId
   * @description 获取用户ID
   * @returns 用户ID
   */
  getUserId(): string | undefined {
    return this.metadata.userId;
  }

  /**
   * @method getCorrelationId
   * @description 获取关联ID
   * @returns 关联ID
   */
  getCorrelationId(): string | undefined {
    return this.metadata.correlationId;
  }

  /**
   * @method getCausationId
   * @description 获取因果ID
   * @returns 因果ID
   */
  getCausationId(): string | undefined {
    return this.metadata.causationId;
  }

  /**
   * @method getSource
   * @description 获取事件源
   * @returns 事件源
   */
  getSource(): string {
    return this.metadata.source || 'IAM.Domain';
  }

  /**
   * @method getData
   * @description 获取额外数据
   * @returns 额外数据
   */
  getData(): Record<string, any> | undefined {
    return this.metadata.data;
  }

  /**
   * @method serialize
   * @description 序列化事件
   * @returns 序列化后的事件数据
   */
  serialize(): Record<string, any> {
    return {
      metadata: this.metadata,
      data: this.serializeEventData(),
    };
  }

  /**
   * @method deserialize
   * @description 反序列化事件
   * @param _data 序列化的事件数据
   * @returns 事件实例
   */
  static deserialize(_data: Record<string, any>): BaseEvent {
    throw new Error('子类必须实现deserialize方法');
  }

  /**
   * @abstract serializeEventData
   * @description 序列化事件数据（子类必须实现）
   * @returns 序列化后的事件数据
   */
  protected abstract serializeEventData(): Record<string, any>;

  /**
   * @method validate
   * @description 验证事件
   * @returns 验证结果
   */
  validate(): boolean {
    if (!this.metadata.eventId) {
      throw new Error('事件ID不能为空');
    }
    if (!this.metadata.aggregateId) {
      throw new Error('聚合根ID不能为空');
    }
    if (!this.metadata.aggregateType) {
      throw new Error('聚合根类型不能为空');
    }
    if (!this.metadata.eventType) {
      throw new Error('事件类型不能为空');
    }
    if (this.metadata.eventVersion < 1) {
      throw new Error('事件版本必须大于等于1');
    }
    if (!this.metadata.occurredOn) {
      throw new Error('事件发生时间不能为空');
    }
    return true;
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式
   * @returns JSON格式的事件数据
   */
  toJSON(): Record<string, any> {
    return this.serialize();
  }

  /**
   * @method toString
   * @description 转换为字符串格式
   * @returns 字符串格式的事件数据
   */
  toString(): string {
    return JSON.stringify(this.serialize());
  }
}
