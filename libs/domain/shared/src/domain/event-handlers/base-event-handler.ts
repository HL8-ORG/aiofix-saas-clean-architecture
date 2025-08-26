/**
 * @file base-event-handler.ts
 * @description 事件处理器基类
 *
 * 该文件定义了事件处理器的基类，提供事件处理的基础功能。
 * 所有具体的事件处理器都应该继承自这个基类。
 *
 * 主要功能：
 * 1. 提供事件处理的基础框架
 * 2. 提供事件处理的错误处理机制
 * 3. 提供事件处理的日志记录
 * 4. 提供事件处理的性能监控
 * 5. 支持事件处理的异步处理
 *
 * 业务规则：
 * 1. 每个事件处理器必须实现handle方法
 * 2. 事件处理器应该是幂等的
 * 3. 事件处理器应该能够处理重复事件
 * 4. 事件处理器应该记录处理结果
 * 5. 事件处理器应该支持重试机制
 */

import { BaseEvent } from '../events/base-event';

/**
 * @interface EventHandlerResult
 * @description 事件处理结果
 */
export interface EventHandlerResult {
  success: boolean;
  processedAt: Date;
  duration: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * @interface EventHandlerOptions
 * @description 事件处理器选项
 */
export interface EventHandlerOptions {
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

/**
 * @abstract BaseEventHandler
 * @description 事件处理器基类
 */
export abstract class BaseEventHandler<T extends BaseEvent = BaseEvent> {
  protected readonly options: EventHandlerOptions;

  /**
   * @constructor
   * @description 构造函数
   * @param options 处理器选项
   */
  constructor(options: EventHandlerOptions = {}) {
    this.options = {
      retryCount: 3,
      retryDelay: 1000,
      timeout: 30000,
      enableLogging: true,
      enableMetrics: true,
      ...options,
    };
  }

  /**
   * @method handle
   * @description 处理事件的主方法
   * @param event 要处理的事件
   * @returns {Promise<EventHandlerResult>} 处理结果
   */
  async handle(event: T): Promise<EventHandlerResult> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    try {
      // 验证事件
      this.validateEvent(event);

      // 记录处理开始
      this.logEventProcessing(event, 'started');

      // 执行事件处理
      await this.processEvent(event);

      // 记录处理成功
      this.logEventProcessing(event, 'completed');

      const duration = Date.now() - startTime;
      return {
        success: true,
        processedAt: new Date(),
        duration,
        metadata: {
          eventId: event.metadata.eventId,
          eventType: event.metadata.eventType,
          aggregateId: event.metadata.aggregateId,
        },
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 记录处理失败
      this.logEventProcessing(event, 'failed', lastError);

      // 尝试重试
      if (this.options.retryCount && this.options.retryCount > 0) {
        return await this.retryEvent(event, lastError, startTime);
      }

      const duration = Date.now() - startTime;
      return {
        success: false,
        processedAt: new Date(),
        duration,
        error: lastError.message,
        metadata: {
          eventId: event.metadata.eventId,
          eventType: event.metadata.eventType,
          aggregateId: event.metadata.aggregateId,
          retryCount: 0,
        },
      };
    }
  }

  /**
   * @abstract
   * @method processEvent
   * @description 处理具体事件的抽象方法
   * @param event 要处理的事件
   * @returns {Promise<void>}
   */
  protected abstract processEvent(event: T): Promise<void>;

  /**
   * @method validateEvent
   * @description 验证事件
   * @param event 要验证的事件
   * @throws {Error} 当事件无效时抛出错误
   */
  protected validateEvent(event: T): void {
    if (!event) {
      throw new Error('事件不能为空');
    }

    if (!event.metadata) {
      throw new Error('事件元数据不能为空');
    }

    if (!event.metadata.eventId) {
      throw new Error('事件ID不能为空');
    }

    if (!event.metadata.eventType) {
      throw new Error('事件类型不能为空');
    }

    if (!event.metadata.aggregateId) {
      throw new Error('聚合根ID不能为空');
    }
  }

  /**
   * @method retryEvent
   * @description 重试事件处理
   * @param event 要重试的事件
   * @param lastError 上次处理的错误
   * @param startTime 开始时间
   * @returns {Promise<EventHandlerResult>} 重试结果
   */
  private async retryEvent(
    event: T,
    lastError: Error,
    startTime: number,
  ): Promise<EventHandlerResult> {
    const maxRetries = this.options.retryCount || 3;
    const retryDelay = this.options.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 等待重试延迟
        if (attempt > 1) {
          await this.delay(retryDelay * attempt);
        }

        this.logEventProcessing(event, `retry_attempt_${attempt}`);

        // 重新处理事件
        await this.processEvent(event);

        this.logEventProcessing(event, 'retry_success');

        const duration = Date.now() - startTime;
        return {
          success: true,
          processedAt: new Date(),
          duration,
          metadata: {
            eventId: event.metadata.eventId,
            eventType: event.metadata.eventType,
            aggregateId: event.metadata.aggregateId,
            retryCount: attempt,
          },
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logEventProcessing(event, `retry_failed_${attempt}`, lastError);

        // 如果是最后一次重试，返回失败结果
        if (attempt === maxRetries) {
          const duration = Date.now() - startTime;
          return {
            success: false,
            processedAt: new Date(),
            duration,
            error: lastError.message,
            metadata: {
              eventId: event.metadata.eventId,
              eventType: event.metadata.eventType,
              aggregateId: event.metadata.aggregateId,
              retryCount: attempt,
            },
          };
        }
      }
    }

    // 这里不应该到达，但为了类型安全
    const duration = Date.now() - startTime;
    return {
      success: false,
      processedAt: new Date(),
      duration,
      error: lastError.message,
      metadata: {
        eventId: event.metadata.eventId,
        eventType: event.metadata.eventType,
        aggregateId: event.metadata.aggregateId,
        retryCount: maxRetries,
      },
    };
  }

  /**
   * @method logEventProcessing
   * @description 记录事件处理日志
   * @param event 事件
   * @param status 处理状态
   * @param error 错误信息（可选）
   */
  protected logEventProcessing(event: T, status: string, error?: Error): void {
    if (!this.options.enableLogging) {
      return;
    }

    const logData = {
      eventId: event.metadata.eventId,
      eventType: event.metadata.eventType,
      aggregateId: event.metadata.aggregateId,
      status,
      timestamp: new Date().toISOString(),
      ...(error && { error: error.message, stack: error.stack }),
    };

    // 这里可以集成具体的日志系统
    console.log(`[EventProcessor] ${JSON.stringify(logData)}`);
  }

  /**
   * @method delay
   * @description 延迟函数
   * @param ms 延迟毫秒数
   * @returns {Promise<void>}
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @method getHandlerName
   * @description 获取处理器名称
   * @returns {string} 处理器名称
   */
  getHandlerName(): string {
    return this.constructor.name;
  }

  /**
   * @method canHandle
   * @description 检查是否可以处理指定类型的事件
   * @param _eventType 事件类型
   * @returns {boolean} 是否可以处理
   */
  canHandle(_eventType: string): boolean {
    return true; // 子类可以重写此方法
  }
}
