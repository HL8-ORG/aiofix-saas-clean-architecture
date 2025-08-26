/**
 * @interface IQuery
 * @description 查询接口，定义CQRS模式中查询的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了查询的统一接口规范，确保所有查询都遵循相同的契约
 * 2. 查询代表系统中的读操作，用于获取系统状态
 * 3. 每个查询都有唯一的标识符和时间戳
 * 4. 支持用户和租户上下文信息，用于权限控制
 *
 * 功能与业务规则：
 * 1. 提供统一的查询执行入口
 * 2. 支持查询的权限控制
 * 3. 支持多租户数据隔离
 * 4. 支持查询结果的缓存优化
 */
export interface IQuery {
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
}
