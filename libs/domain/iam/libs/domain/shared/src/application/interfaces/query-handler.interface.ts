import { IQuery } from './query.interface';

/**
 * @interface IQueryHandler
 * @description 查询处理器接口，定义CQRS模式中查询处理器的标准接口
 */
export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  execute(query: TQuery): Promise<TResult>;
}
