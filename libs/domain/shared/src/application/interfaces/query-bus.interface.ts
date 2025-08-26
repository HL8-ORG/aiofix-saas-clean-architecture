import { IQuery } from './query.interface';

/**
 * @interface IQueryBus
 * @description 查询总线接口，定义CQRS模式中查询总线的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了查询总线的统一接口规范，确保所有查询总线都遵循相同的契约
 * 2. 查询总线负责分发查询到对应的查询处理器
 * 3. 采用泛型设计，支持不同类型的查询和结果
 * 4. 支持异步操作，符合现代应用开发的最佳实践
 *
 * 功能与业务规则：
 * 1. 提供统一的查询分发入口
 * 2. 支持查询的路由和分发
 * 3. 支持查询的验证和错误处理
 * 4. 支持查询结果的缓存优化
 */
export interface IQueryBus {
  /**
   * @method execute
   * @description 执行查询
   * @param query 查询对象
   * @returns 查询结果
   */
  execute<TQuery extends IQuery<TResult>, TResult>(
    query: TQuery,
  ): Promise<TResult>;
}
