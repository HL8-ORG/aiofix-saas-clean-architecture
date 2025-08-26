import { IQuery } from '../interfaces/query.interface';

/**
 * @class BaseQuery
 * @description 基础查询类，提供查询的基础功能
 *
 * 主要原理与机制：
 * 1. 实现IQuery接口，提供查询的基础功能
 * 2. 自动生成查询ID和时间戳
 * 3. 支持关联ID和因果ID用于事件链追踪
 * 4. 提供查询的元数据管理
 *
 * 功能与业务规则：
 * 1. 提供统一的查询标识
 * 2. 支持查询的元数据管理
 * 3. 支持查询的缓存优化
 * 4. 支持查询的权限验证
 */
export abstract class BaseQuery<TResult = any> implements IQuery<TResult> {
  /**
   * @property queryId
   * @description 查询唯一标识符
   */
  readonly queryId: string;

  /**
   * @property timestamp
   * @description 查询创建时间戳
   */
  readonly timestamp: Date;

  /**
   * @property correlationId
   * @description 关联ID，用于追踪业务流程
   */
  readonly correlationId?: string;

  /**
   * @property causationId
   * @description 因果ID，用于追踪事件链
   */
  readonly causationId?: string;

  /**
   * @constructor
   * @description 构造函数
   * @param correlationId 关联ID
   * @param causationId 因果ID
   */
  constructor(correlationId?: string, causationId?: string) {
    this.queryId = this.generateQueryId();
    this.timestamp = new Date();
    this.correlationId = correlationId;
    this.causationId = causationId;
  }

  /**
   * @method generateQueryId
   * @description 生成查询ID
   * @returns 查询ID
   */
  private generateQueryId(): string {
    return `${this.constructor.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
