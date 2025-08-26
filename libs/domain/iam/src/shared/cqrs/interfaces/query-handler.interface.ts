/**
 * @interface IQueryHandler
 * @description 查询处理器接口，定义查询处理器的标准接口
 *
 * 主要原理与机制：
 * 1. 定义查询处理器的标准接口，确保处理器的一致性
 * 2. 支持泛型类型，提供类型安全的查询处理
 * 3. 与查询总线集成，实现查询的自动分发
 * 4. 支持缓存和性能优化
 *
 * 功能与业务规则：
 * 1. 查询验证和处理
 * 2. 数据检索和映射
 * 3. 缓存管理
 * 4. 结果返回
 */
export interface IQueryHandler<TQuery, TResult> {
  /**
   * @method execute
   * @description 执行查询处理
   * @param query 要处理的查询
   * @returns 查询结果
   */
  execute(query: TQuery): Promise<TResult>;
}
