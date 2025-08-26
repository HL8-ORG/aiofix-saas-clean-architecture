/**
 * @interface IQuery
 * @description 查询接口，定义CQRS模式中查询的标准接口
 */
export interface IQuery<TResult = any> {
  readonly queryId: string;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causationId?: string;
}
