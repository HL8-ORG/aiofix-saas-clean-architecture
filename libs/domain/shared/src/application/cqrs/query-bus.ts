import { Injectable } from '@nestjs/common';
import { IQueryBus } from '../interfaces/query-bus.interface';
import { IQuery } from '../interfaces/query.interface';
import { IQueryHandler } from '../interfaces/query-handler.interface';

/**
 * @class QueryBus
 * @description 查询总线实现，负责查询的分发和处理
 *
 * 主要原理与机制：
 * 1. 使用Map存储查询类型到处理器的映射关系
 * 2. 通过依赖注入获取所有查询处理器实例
 * 3. 在execute方法中根据查询类型查找对应的处理器
 * 4. 支持查询缓存、错误处理和性能优化
 * 5. 采用异步处理模式，支持复杂的查询逻辑
 *
 * 功能与业务规则：
 * 1. 查询处理器自动注册和发现
 * 2. 查询类型到处理器的路由映射
 * 3. 查询结果的统一返回和缓存
 * 4. 查询执行异常的捕获和处理
 * 5. 支持查询性能监控和优化
 */
@Injectable()
export class QueryBus implements IQueryBus {
  private readonly handlers = new Map<string, IQueryHandler<any, any>>();
  private readonly cache = new Map<
    string,
    { result: any; timestamp: number }
  >();
  private readonly cacheTtl = 5 * 60 * 1000; // 5分钟缓存

  /**
   * @method registerHandler
   * @description 注册查询处理器
   * @param queryType 查询类型
   * @param handler 查询处理器实例
   */
  registerHandler<TQuery extends IQuery<TResult>, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    this.handlers.set(queryType, handler);
  }

  /**
   * @method execute
   * @description 执行查询
   * @param query 查询对象
   * @returns 查询结果
   */
  async execute<TQuery extends IQuery<TResult>, TResult>(
    query: TQuery,
  ): Promise<TResult> {
    const queryType = query.constructor.name;
    const handler = this.handlers.get(queryType);

    if (!handler) {
      throw new Error(`No handler found for query: ${queryType}`);
    }

    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey(query);
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // 执行查询处理器
      const result = await handler.execute(query);

      // 缓存结果
      this.cacheResult(cacheKey, result);

      return result;
    } catch (error) {
      // 记录错误日志
      console.error(`Error executing query ${queryType}:`, error);
      throw error;
    }
  }

  /**
   * @method getHandler
   * @description 获取指定查询类型的处理器
   * @param queryType 查询类型
   * @returns 查询处理器实例
   */
  getHandler<TQuery extends IQuery<TResult>, TResult>(
    queryType: string,
  ): IQueryHandler<TQuery, TResult> | undefined {
    return this.handlers.get(queryType);
  }

  /**
   * @method hasHandler
   * @description 检查是否存在指定查询类型的处理器
   * @param queryType 查询类型
   * @returns 是否存在处理器
   */
  hasHandler(queryType: string): boolean {
    return this.handlers.has(queryType);
  }

  /**
   * @method getRegisteredQueries
   * @description 获取所有已注册的查询类型
   * @returns 查询类型列表
   */
  getRegisteredQueries(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * @method clearHandlers
   * @description 清空所有处理器
   */
  clearHandlers(): void {
    this.handlers.clear();
  }

  /**
   * @method clearCache
   * @description 清空查询缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * @method invalidateCache
   * @description 使指定查询的缓存失效
   * @param queryType 查询类型
   */
  invalidateCache(queryType: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key =>
      key.startsWith(queryType),
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * @method generateCacheKey
   * @description 生成缓存键
   * @param query 查询对象
   * @returns 缓存键
   */
  private generateCacheKey(query: IQuery<any>): string {
    const queryType = query.constructor.name;
    const queryData = JSON.stringify(query);
    return `${queryType}:${this.hashCode(queryData)}`;
  }

  /**
   * @method getCachedResult
   * @description 获取缓存的结果
   * @param cacheKey 缓存键
   * @returns 缓存的结果或null
   */
  private getCachedResult(cacheKey: string): any | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) {
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > this.cacheTtl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.result;
  }

  /**
   * @method cacheResult
   * @description 缓存查询结果
   * @param cacheKey 缓存键
   * @param result 查询结果
   */
  private cacheResult(cacheKey: string, result: any): void {
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * @method hashCode
   * @description 生成字符串的哈希码
   * @param str 字符串
   * @returns 哈希码
   */
  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}
