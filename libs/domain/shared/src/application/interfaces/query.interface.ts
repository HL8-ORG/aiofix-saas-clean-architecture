/**
 * @interface IQuery
 * @description 查询接口，定义CQRS模式中查询的标准接口
 *
 * 主要原理与机制：
 * 1. 定义了查询的统一接口规范，确保所有查询都遵循相同的契约
 * 2. 查询代表一个意图，用于获取系统状态
 * 3. 查询是幂等的，多次执行不会改变系统状态
 * 4. 查询包含获取数据所需的所有参数
 *
 * 功能与业务规则：
 * 1. 提供统一的查询标识
 * 2. 支持查询的元数据管理
 * 3. 支持查询的缓存优化
 * 4. 支持查询的权限验证
 */
export interface IQuery<TResult = any> {
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
   * @property correlationId
   * @description 关联ID，用于追踪业务流程
   */
  readonly correlationId?: string;

  /**
   * @property causationId
   * @description 因果ID，用于追踪事件链
   */
  readonly causationId?: string;
}
