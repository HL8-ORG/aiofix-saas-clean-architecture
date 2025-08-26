import { BaseQuery } from '@aiofix/domain-shared';
import { GetUsersDto, SortOrder } from '../dtos/get-users.dto';

/**
 * @class GetUsersQuery
 * @description 获取用户列表查询，定义获取用户列表的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseQuery，获得查询的基础功能
 * 2. 包含获取用户列表所需的参数
 * 3. 作为CQRS模式中的读操作查询
 * 4. 支持用户和租户上下文信息
 *
 * 功能与业务规则：
 * 1. 定义获取用户列表的业务操作
 * 2. 支持分页、排序、过滤等功能
 * 3. 包含用户的完整信息
 * 4. 支持权限验证和数据隔离
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
   * @property search
   * @description 搜索关键词
   */
  readonly search?: string;

  /**
   * @property status
   * @description 用户状态过滤
   */
  readonly status?: string;

  /**
   * @property organizationId
   * @description 组织ID过滤
   */
  readonly organizationId?: string;

  /**
   * @property departmentId
   * @description 部门ID过滤
   */
  readonly departmentId?: string;

  /**
   * @property roleId
   * @description 角色ID过滤
   */
  readonly roleId?: string;

  /**
   * @property sortBy
   * @description 排序字段
   */
  readonly sortBy: string;

  /**
   * @property sortOrder
   * @description 排序顺序
   */
  readonly sortOrder: SortOrder;

  /**
   * @constructor
   * @description 构造函数
   * @param dto 获取用户列表DTO
   * @param queryUserId 执行查询的用户ID
   * @param tenantId 查询所属的租户ID
   */
  constructor(dto: GetUsersDto, queryUserId?: string, tenantId?: string) {
    super(queryUserId, tenantId);
    this.page = dto.page || 1;
    this.limit = dto.limit || 10;
    this.search = dto.search;
    this.status = dto.status;
    this.organizationId = dto.organizationId;
    this.departmentId = dto.departmentId;
    this.roleId = dto.roleId;
    this.sortBy = dto.sortBy || 'createdAt';
    this.sortOrder = dto.sortOrder || SortOrder.DESC;
  }
}
