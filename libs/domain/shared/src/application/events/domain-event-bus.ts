import { BaseEvent } from '../../domain/events/base-event';

/**
 * @class DomainEventBus
 * @description 领域事件总线，负责事件的注册和分发
 *
 * 主要原理与机制：
 * 1. 使用Map存储事件类型到处理器的映射关系
 * 2. 支持异步事件处理，使用Promise.all并行执行
 * 3. 提供错误处理机制，单个处理器失败不影响其他处理器
 * 4. 与CQRS模式集成，支持事件溯源
 *
 * 功能与业务规则：
 * 1. 事件注册和分发
 * 2. 异步事件处理
 * 3. 错误处理和日志记录
 * 4. 事件处理器管理
 */
export class DomainEventBus {
  private readonly handlers = new Map<
    string,
    Array<(event: BaseEvent) => Promise<void>>
  >();

  /**
   * @method registerHandler
   * @description 注册事件处理器
   * @param eventName 事件类名
   * @param handler 处理函数
   */
  public registerHandler(
    eventName: string,
    handler: (event: BaseEvent) => Promise<void>,
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)?.push(handler);
  }

  /**
   * @method publish
   * @description 发布领域事件
   * @param event 领域事件实例
   * @returns 处理完成的Promise
   */
  public async publish(event: BaseEvent): Promise<void> {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];

    await Promise.all(
      handlers.map(handler =>
        handler(event).catch(err => {
          console.error(`事件处理失败: ${eventName}`, err);
        }),
      ),
    );
  }

  /**
   * @method getHandlers
   * @description 获取指定事件的所有处理器
   * @param eventName 事件类名
   * @returns 处理器数组
   */
  public getHandlers(
    eventName: string,
  ): Array<(event: BaseEvent) => Promise<void>> {
    return this.handlers.get(eventName) || [];
  }

  /**
   * @method hasHandlers
   * @description 检查是否有指定事件的处理器
   * @param eventName 事件类名
   * @returns 是否存在处理器
   */
  public hasHandlers(eventName: string): boolean {
    return (
      this.handlers.has(eventName) && this.handlers.get(eventName)!.length > 0
    );
  }

  /**
   * @method clearHandlers
   * @description 清除指定事件的所有处理器
   * @param eventName 事件类名
   */
  public clearHandlers(eventName: string): void {
    this.handlers.delete(eventName);
  }

  /**
   * @method clearAllHandlers
   * @description 清除所有事件处理器
   */
  public clearAllHandlers(): void {
    this.handlers.clear();
  }
}
