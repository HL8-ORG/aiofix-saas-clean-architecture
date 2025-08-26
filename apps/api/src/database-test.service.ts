/**
 * @file database-test.service.ts
 * @description 数据库测试服务
 *
 * 该服务用于测试数据库适配器的功能，包括：
 * - 连接测试
 * - 查询测试
 * - 健康检查
 * - 统计信息
 *
 * 遵循DDD和Clean Architecture原则，提供数据库功能的验证。
 */

import { Injectable, Inject } from '@nestjs/common';
import { PinoLoggerService, LogContext } from '@aiofix/infrastructure-logging';
import type { IDatabaseAdapter } from '@aiofix/infrastructure-database';

/**
 * @class DatabaseTestService
 * @description 数据库测试服务
 *
 * 提供数据库功能的测试和验证，包括：
 * - 连接状态检查
 * - 查询执行测试
 * - 健康状态监控
 * - 性能统计分析
 */
@Injectable()
export class DatabaseTestService {
  private readonly logger: PinoLoggerService;

  constructor(
    @Inject('IDatabaseAdapter')
    private readonly databaseAdapter: IDatabaseAdapter,
    logger: PinoLoggerService,
  ) {
    this.logger = logger;
  }

  /**
   * @method testConnection
   * @description 测试数据库连接
   * @returns {Promise<object>} 连接测试结果
   */
  async testConnection(): Promise<object> {
    try {
      this.logger.info('开始测试数据库连接', LogContext.DATABASE);

      // 测试连接
      const isConnected = await this.databaseAdapter.ping();

      if (!isConnected) {
        throw new Error('数据库连接失败');
      }

      // 获取健康状态
      const health = await this.databaseAdapter.getHealth();

      // 获取统计信息
      const stats = await this.databaseAdapter.getStats();

      // 获取连接信息
      const connection = await this.databaseAdapter.getConnection();

      const result = {
        success: true,
        message: '数据库连接测试成功',
        timestamp: new Date().toISOString(),
        adapter: {
          name: this.databaseAdapter.name,
          type: this.databaseAdapter.type,
          isConnected: this.databaseAdapter.isConnected,
        },
        health,
        stats,
        connection: {
          id: connection.id,
          status: connection.status,
          lastActivity: connection.lastActivity,
        },
      };

      this.logger.info('数据库连接测试完成', LogContext.DATABASE, result);
      return result;
    } catch (error) {
      this.logger.error(
        '数据库连接测试失败',
        LogContext.DATABASE,
        { error: error.message },
        error,
      );

      return {
        success: false,
        message: '数据库连接测试失败',
        error: error.message,
        timestamp: new Date().toISOString(),
        adapter: {
          name: this.databaseAdapter.name,
          type: this.databaseAdapter.type,
          isConnected: this.databaseAdapter.isConnected,
        },
      };
    }
  }

  /**
   * @method testQuery
   * @description 测试数据库查询
   * @returns {Promise<object>} 查询测试结果
   */
  async testQuery(): Promise<object> {
    try {
      this.logger.info('开始测试数据库查询', LogContext.DATABASE);

      // 执行简单查询
      const result = await this.databaseAdapter.query(
        'SELECT NOW() as current_time, version() as db_version',
        [],
        { logQuery: true, tag: 'test_query' },
      );

      const queryResult = {
        success: true,
        message: '数据库查询测试成功',
        timestamp: new Date().toISOString(),
        query: 'SELECT NOW() as current_time, version() as db_version',
        result: {
          rowCount: result.rowCount,
          rows: result.rows,
        },
      };

      this.logger.info('数据库查询测试完成', LogContext.DATABASE, queryResult);
      return queryResult;
    } catch (error) {
      this.logger.error(
        '数据库查询测试失败',
        LogContext.DATABASE,
        { error: error.message },
        error,
      );

      return {
        success: false,
        message: '数据库查询测试失败',
        error: error.message,
        timestamp: new Date().toISOString(),
        query: 'SELECT NOW() as current_time, version() as db_version',
      };
    }
  }

  /**
   * @method testTransaction
   * @description 测试数据库事务
   * @returns {Promise<object>} 事务测试结果
   */
  async testTransaction(): Promise<object> {
    try {
      this.logger.info('开始测试数据库事务', LogContext.DATABASE);

      // 执行事务测试
      const result = await this.databaseAdapter.transaction(
        async (trx) => {
          // 在事务中执行查询
          const queryResult = await trx.raw('SELECT NOW() as transaction_time');
          return queryResult.rows[0];
        },
        { tag: 'test_transaction' },
      );

      const transactionResult = {
        success: true,
        message: '数据库事务测试成功',
        timestamp: new Date().toISOString(),
        result,
      };

      this.logger.info(
        '数据库事务测试完成',
        LogContext.DATABASE,
        transactionResult,
      );
      return transactionResult;
    } catch (error) {
      this.logger.error(
        '数据库事务测试失败',
        LogContext.DATABASE,
        { error: error.message },
        error,
      );

      return {
        success: false,
        message: '数据库事务测试失败',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * @method getDatabaseInfo
   * @description 获取数据库信息
   * @returns {Promise<object>} 数据库信息
   */
  async getDatabaseInfo(): Promise<object> {
    try {
      const health = await this.databaseAdapter.getHealth();
      const stats = await this.databaseAdapter.getStats();
      const connection = await this.databaseAdapter.getConnection();

      return {
        success: true,
        message: '获取数据库信息成功',
        timestamp: new Date().toISOString(),
        adapter: {
          name: this.databaseAdapter.name,
          type: this.databaseAdapter.type,
          isConnected: this.databaseAdapter.isConnected,
        },
        health,
        stats,
        connection: {
          id: connection.id,
          status: connection.status,
          lastActivity: connection.lastActivity,
        },
      };
    } catch (error) {
      this.logger.error(
        '获取数据库信息失败',
        LogContext.DATABASE,
        { error: error.message },
        error,
      );

      return {
        success: false,
        message: '获取数据库信息失败',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
