import { BaseEvent } from '../../domain/events/base-event';

/**
 * @interface IEventStore
 * @description 事件存储接口，定义事件溯源模式中事件存储的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了事件存储的统一接口规范，确保所有事件存储实现都遵循相同的契约
 * 2. 支持事件的追加、查询、重放等核心功能
 * 3. 采用异步操作，符合现代应用开发的最佳实践
 * 4. 支持事件版本控制和快照机制
 *
 * 功能与业务规则：
 * 1. 提供事件追加功能，确保事件的不可变性
 * 2. 支持按聚合ID查询事件流
 * 3. 支持事件重放和状态重建
 * 4. 支持快照机制优化性能
 * 5. 支持事件版本控制
 */
export interface IEventStore {
  /**
   * @method appendEvents
   * @description 追加事件到事件流
   * @param aggregateId 聚合根ID
   * @param expectedVersion 期望的版本号
   * @param events 事件列表
   * @returns 追加结果
   */
  appendEvents(
    aggregateId: string,
    expectedVersion: number,
    events: BaseEvent[],
  ): Promise<void>;

  /**
   * @method getEvents
   * @description 获取指定聚合根的事件流
   * @param aggregateId 聚合根ID
   * @param fromVersion 起始版本号
   * @param toVersion 结束版本号
   * @returns 事件列表
   */
  getEvents(
    aggregateId: string,
    fromVersion?: number,
    toVersion?: number,
  ): Promise<BaseEvent[]>;

  /**
   * @method getEventsByType
   * @description 按事件类型获取事件
   * @param eventType 事件类型
   * @param fromDate 起始日期
   * @param toDate 结束日期
   * @returns 事件列表
   */
  getEventsByType(
    eventType: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<BaseEvent[]>;

  /**
   * @method saveSnapshot
   * @description 保存聚合根快照
   * @param aggregateId 聚合根ID
   * @param version 版本号
   * @param snapshot 快照数据
   * @returns 保存结果
   */
  saveSnapshot(
    aggregateId: string,
    version: number,
    snapshot: any,
  ): Promise<void>;

  /**
   * @method getSnapshot
   * @description 获取聚合根快照
   * @param aggregateId 聚合根ID
   * @returns 快照数据
   */
  getSnapshot(aggregateId: string): Promise<any | null>;

  /**
   * @method getLastEventVersion
   * @description 获取聚合根的最后事件版本号
   * @param aggregateId 聚合根ID
   * @returns 版本号
   */
  getLastEventVersion(aggregateId: string): Promise<number>;

  /**
   * @method deleteEvents
   * @description 删除指定聚合根的事件（软删除）
   * @param aggregateId 聚合根ID
   * @returns 删除结果
   */
  deleteEvents(aggregateId: string): Promise<void>;

  /**
   * @method getEventCount
   * @description 获取事件总数
   * @param aggregateId 聚合根ID
   * @returns 事件数量
   */
  getEventCount(aggregateId: string): Promise<number>;
}
