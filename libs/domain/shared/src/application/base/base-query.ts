import { IQuery } from '../interfaces/query.interface';
import { Uuid } from '../../domain/value-objects/uuid.vo';

/**
 * @class BaseQuery
 * @description 基础查询类，提供查询的通用实现
 *
 * 主要原理与机制：
 * 1. 实现了IQuery接口，提供查询的基础功能
 * 2. 自动生成查询ID和时间戳，确保查询的唯一性和可追溯性
 * 3. 支持用户和租户上下文信息的设置
 * 4. 作为所有具体查询的基类，提供统一的查询行为
 *
 * 功能与业务规则：
 * 1. 提供查询的唯一标识符生成
 * 2. 提供查询的时间戳记录
 * 3. 支持查询的上下文信息管理
 * 4. 确保查询的不可变性
 */
export abstract class BaseQuery implements IQuery {
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
   * @property userId
   * @description 执行查询的用户ID
   */
  readonly userId?: string;

  /**
   * @property tenantId
   * @description 查询所属的租户ID
   */
  readonly tenantId?: string;

  /**
   * @constructor
   * @description 构造函数，初始化查询的基础属性
   * @param userId 执行查询的用户ID
   * @param tenantId 查询所属的租户ID
   */
  constructor(userId?: string, tenantId?: string) {
    this.queryId = Uuid.generate().value;
    this.timestamp = new Date();
    this.userId = userId;
    this.tenantId = tenantId;
  }
}
