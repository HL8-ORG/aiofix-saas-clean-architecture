import { BaseQuery } from '@aiofix/domain-shared';

/**
 * @class GetUsersQuery
 * @description 获取用户列表查询，定义获取用户列表的查询参数
 *
 * 主要原理与机制：
 * 1. 作为CQRS查询模式的查询对象
 * 2. 包含分页、过滤、排序等查询参数
 * 3. 支持多租户数据隔离
 * 4. 提供灵活的查询条件组合
 *
 * 功能与业务规则：
 * 1. 支持分页查询
 * 2. 支持多条件过滤
 * 3. 支持排序
 * 4. 支持搜索
 */
export class GetUsersQuery extends BaseQuery {
  /**
   * @property page
   * @description 页码
   */
  readonly page: number;

  /**
   * @property limit
   * @description 每页数量
   */
  readonly limit: number;

  /**
   * @property tenantId
   * @description 租户ID
   */
  readonly tenantId?: string;

  /**
   * @property organizationId
   * @description 组织ID
   */
  readonly organizationId?: string;

  /**
   * @property departmentId
   * @description 部门ID
   */
  readonly departmentId?: string;

  /**
   * @property status
   * @description 用户状态
   */
  readonly status?: string;

  /**
   * @property type
   * @description 用户类型
   */
  readonly type?: string;

  /**
   * @property search
   * @description 搜索关键词
   */
  readonly search?: string;

  /**
   * @property sortBy
   * @description 排序字段
   */
  readonly sortBy?: string;

  /**
   * @property sortOrder
   * @description 排序方向
   */
  readonly sortOrder?: 'ASC' | 'DESC';

  /**
   * @constructor
   * @description 构造函数
   * @param page 页码
   * @param limit 每页数量
   * @param tenantId 租户ID
   * @param organizationId 组织ID
   * @param departmentId 部门ID
   * @param status 用户状态
   * @param type 用户类型
   * @param search 搜索关键词
   * @param sortBy 排序字段
   * @param sortOrder 排序方向
   */
  constructor(
    page: number = 1,
    limit: number = 10,
    tenantId?: string,
    organizationId?: string,
    departmentId?: string,
    status?: string,
    type?: string,
    search?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    super();
    this.page = page;
    this.limit = limit;
    this.tenantId = tenantId;
    this.organizationId = organizationId;
    this.departmentId = departmentId;
    this.status = status;
    this.type = type;
    this.search = search;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}
