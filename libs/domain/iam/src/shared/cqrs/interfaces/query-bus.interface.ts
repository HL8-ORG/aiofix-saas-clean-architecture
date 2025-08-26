/**
 * @interface IQueryBus
 * @description 查询总线接口，负责分发和处理查询
 *
 * 主要原理与机制：
 * 1. 作为CQRS模式的核心组件，负责查询的分发和执行
 * 2. 提供统一的查询处理入口，支持查询缓存和优化
 * 3. 支持分页、过滤、排序等查询功能
 * 4. 与缓存系统集成，提升查询性能
 *
 * 功能与业务规则：
 * 1. 查询分发和执行
 * 2. 查询缓存管理
 * 3. 查询结果映射
 * 4. 性能优化
 */
export interface IQueryBus {
  /**
   * @method execute
   * @description 执行查询
   * @param query 要执行的查询
   * @returns 查询结果
   */
  execute<TQuery, TResult>(query: TQuery): Promise<TResult>;
}
