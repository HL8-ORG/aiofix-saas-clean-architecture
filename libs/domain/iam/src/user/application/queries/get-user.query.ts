import { BaseQuery } from '@aiofix/domain-shared';

/**
 * @class GetUserQuery
 * @description 获取用户查询，定义获取用户信息的操作
 *
 * 主要原理与机制：
 * 1. 继承BaseQuery，获得查询的基础功能
 * 2. 包含获取用户所需的参数
 * 3. 作为CQRS模式中的读操作查询
 * 4. 支持用户和租户上下文信息
 *
 * 功能与业务规则：
 * 1. 定义获取用户信息的业务操作
 * 2. 支持通过用户ID获取用户信息
 * 3. 包含用户的完整信息
 * 4. 支持权限验证和数据隔离
 */
export class GetUserQuery extends BaseQuery {
  /**
   * @property userId
   * @description 用户ID
   */
  readonly userId: string;

  /**
   * @constructor
   * @description 构造函数
   * @param userId 用户ID
   * @param queryUserId 执行查询的用户ID
   * @param tenantId 查询所属的租户ID
   */
  constructor(userId: string, queryUserId?: string, tenantId?: string) {
    super(queryUserId, tenantId);
    this.userId = userId;
  }
}
