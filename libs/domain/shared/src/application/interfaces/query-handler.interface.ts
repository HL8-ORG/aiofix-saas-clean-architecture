import { IQuery } from './query.interface';

/**
 * @interface IQueryHandler
 * @description 查询处理器接口，定义CQRS模式中查询处理器的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了查询处理器的统一接口规范，确保所有查询处理器都遵循相同的契约
 * 2. 查询处理器负责执行具体的数据查询，获取系统状态
 * 3. 采用泛型设计，支持不同类型的查询和结果
 * 4. 支持异步操作，符合现代应用开发的最佳实践
 *
 * 功能与业务规则：
 * 1. 提供统一的查询处理入口
 * 2. 支持查询的数据获取和转换
 * 3. 支持查询的权限验证
 * 4. 支持查询结果的缓存优化
 */
export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  /**
   * @method execute
   * @description 执行查询
   * @param query 查询对象
   * @returns 查询结果
   */
  execute(query: TQuery): Promise<TResult>;
}
