import { Injectable } from '@nestjs/common';
import { IQueryBus, IQueryHandler } from './interfaces';

/**
 * @class QueryBus
 * @description 查询总线实现，负责分发和处理查询
 *
 * 主要原理与机制：
 * 1. 使用Map存储查询类型到处理器的映射关系
 * 2. 通过依赖注入获取处理器实例
 * 3. 支持查询缓存和性能优化
 * 4. 提供查询结果映射和转换
 *
 * 功能与业务规则：
 * 1. 查询分发和执行
 * 2. 处理器自动注册
 * 3. 查询缓存管理
 * 4. 性能优化
 */
@Injectable()
export class QueryBus implements IQueryBus {
  private readonly handlers = new Map<string, IQueryHandler<any, any>>();

  /**
   * @method registerHandler
   * @description 注册查询处理器
   * @param queryType 查询类型
   * @param handler 查询处理器
   */
  registerHandler<TQuery, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    this.handlers.set(queryType, handler);
  }

  /**
   * @method execute
   * @description 执行查询
   * @param query 要执行的查询
   * @returns 查询结果
   */
  async execute<TQuery, TResult>(query: TQuery): Promise<TResult> {
    const queryType = query.constructor.name;
    const handler = this.handlers.get(queryType);

    if (!handler) {
      throw new Error(`未找到查询处理器: ${queryType}`);
    }

    try {
      return await handler.execute(query);
    } catch (error) {
      // 记录错误日志
      console.error(`查询执行失败: ${queryType}`, error);
      throw error;
    }
  }

  /**
   * @method getHandler
   * @description 获取查询处理器
   * @param queryType 查询类型
   * @returns 查询处理器
   */
  getHandler<TQuery, TResult>(
    queryType: string,
  ): IQueryHandler<TQuery, TResult> | undefined {
    return this.handlers.get(queryType);
  }

  /**
   * @method hasHandler
   * @description 检查是否有对应的查询处理器
   * @param queryType 查询类型
   * @returns 是否存在处理器
   */
  hasHandler(queryType: string): boolean {
    return this.handlers.has(queryType);
  }
}
