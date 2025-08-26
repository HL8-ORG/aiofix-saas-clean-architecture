/**
 * @class DomainEventBus
 * @description 领域事件总线，负责事件的注册和分发
 * @rule 所有领域事件必须通过此总线发布
 */
export class DomainEventBus {
  private readonly handlers = new Map<
    string,
    Array<(event: DomainEvent) => Promise<void>>
  >();

  /**
   * @method registerHandler
   * @description 注册事件处理器
   * @param eventName 事件类名
   * @param handler 处理函数
   */
  public registerHandler(
    eventName: string,
    handler: (event: DomainEvent) => Promise<void>,
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
  public async publish(event: DomainEvent): Promise<void> {
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
}
