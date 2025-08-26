import { BaseQuery } from '@aiofix/domain-shared';

/**
 * @class GetTenantQuery
 * @description 获取租户查询，定义获取单个租户的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseQuery，获得查询的基础功能
 * 2. 包含获取租户所需的参数
 * 3. 作为CQRS模式中的读操作查询
 * 4. 支持租户详细信息的获取
 *
 * 功能与业务规则：
 * 1. 定义获取单个租户的查询操作
 * 2. 支持租户基本信息的获取
 * 3. 支持租户统计信息的获取
 * 4. 支持租户关联数据的获取
 */
export class GetTenantQuery extends BaseQuery {
  /**
   * @property tenantId
   * @description 要获取的租户ID
   */
  readonly tenantId: string;

  /**
   * @property includeStatistics
   * @description 是否包含统计信息
   */
  readonly includeStatistics: boolean;

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId 要获取的租户ID
   * @param includeStatistics 是否包含统计信息
   */
  constructor(tenantId: string, includeStatistics: boolean = false) {
    super();
    this.tenantId = tenantId;
    this.includeStatistics = includeStatistics;
  }
}
