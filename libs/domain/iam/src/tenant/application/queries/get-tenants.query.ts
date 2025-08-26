import { BaseQuery } from '@aiofix/domain-shared';
import { GetTenantsDto } from '../dtos/get-tenants.dto';

/**
 * @class GetTenantsQuery
 * @description 获取租户列表查询，定义获取租户列表的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseQuery，获得查询的基础功能
 * 2. 包含获取租户列表所需的所有参数
 * 3. 作为CQRS模式中的读操作查询
 * 4. 支持分页、过滤、排序等查询功能
 *
 * 功能与业务规则：
 * 1. 定义获取租户列表的查询操作
 * 2. 支持分页查询，限制每页数量
 * 3. 支持按状态、套餐类型等条件过滤
 * 4. 支持按名称、代码等字段搜索
 * 5. 支持按创建时间、更新时间等字段排序
 */
export class GetTenantsQuery extends BaseQuery {
  /**
   * @property page
   * @description 页码，从1开始
   */
  readonly page: number;

  /**
   * @property limit
   * @description 每页数量
   */
  readonly limit: number;

  /**
   * @property status
   * @description 租户状态过滤
   */
  readonly status?: string;

  /**
   * @property plan
   * @description 租户套餐类型过滤
   */
  readonly plan?: string;

  /**
   * @property search
   * @description 搜索关键词，支持名称和代码模糊搜索
   */
  readonly search?: string;

  /**
   * @property sortBy
   * @description 排序字段
   */
  readonly sortBy: string;

  /**
   * @property sortOrder
   * @description 排序方向
   */
  readonly sortOrder: 'ASC' | 'DESC';

  /**
   * @property includeStatistics
   * @description 是否包含统计信息
   */
  readonly includeStatistics: boolean;

  /**
   * @constructor
   * @description 构造函数
   * @param dto 获取租户列表DTO
   */
  constructor(dto: GetTenantsDto) {
    super();
    this.page = dto.page || 1;
    this.limit = dto.limit || 10;
    this.status = dto.status;
    this.plan = dto.plan;
    this.search = dto.search;
    this.sortBy = dto.sortBy || 'createdAt';
    this.sortOrder = dto.sortOrder || 'DESC';
    this.includeStatistics = dto.includeStatistics || false;
  }
}
